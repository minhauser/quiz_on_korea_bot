"""
Battle (전쟁·배틀) — handlers and router. Imports `bot` only inside functions to avoid cycles.
"""
from __future__ import annotations

import asyncio
import logging
import uuid
from functools import partial
from typing import Any

from aiogram import Bot, F, Router
from aiogram.exceptions import TelegramBadRequest, TelegramForbiddenError, TelegramNetworkError
from aiogram.types import CallbackQuery, InlineKeyboardButton, InlineKeyboardMarkup, Message

from services import battle_ai
from models.battle import Battle
from services import battle_service as bs
from services.battle_invite import build_share_url, build_telegram_deeplink

logger = logging.getLogger(__name__)

battle_router = Router(name="battle")

# Keep in sync with MAIN_MENU_KB button text in bot.py
BATTLE_TEXT = "⚔️퀴즈 · 배틀🛡"

_turn_timers: dict[int, asyncio.Task[None]] = {}
_question_chat_msg: dict[int, tuple[int, int]] = {}
_random_ai_tasks: dict[tuple[int, int], asyncio.Task[None]] = {}
_finish_retry_tasks: dict[tuple[int, int, str], asyncio.Task[None]] = {}


async def _retry_send_finish(
        bot: Bot,
        battle_id: int,
        user_id: int,
        who: str) -> None:
    """
    Try to deliver finish message automatically after transient network errors.
    `who` is 'initiator' or 'opponent' (controls which notified flag to set).
    """
    delays = (2.0, 5.0, 12.0, 25.0, 60.0)  # ~1.5 min total
    for d in delays:
        await asyncio.sleep(d)
        b = await bs.get_battle(battle_id)
        if not b or b.status != "finished":
            return
        if who == "initiator" and int(
            getattr(
                b,
                "finish_notified_initiator",
                0) or 0) == 1:
            return
        if who == "opponent" and int(
            getattr(
                b,
                "finish_notified_opponent",
                0) or 0) == 1:
            return
        await _show_finish(bot, b)
        b2 = await bs.get_battle(battle_id)
        if not b2:
            return
        if who == "initiator" and int(
            getattr(
                b2,
                "finish_notified_initiator",
                0) or 0) == 1:
            return
        if who == "opponent" and int(
            getattr(
                b2,
                "finish_notified_opponent",
                0) or 0) == 1:
            return


def _schedule_finish_retry(
        bot: Bot,
        battle_id: int,
        user_id: int,
        who: str) -> None:
    key = (battle_id, user_id, who)
    t = _finish_retry_tasks.get(key)
    if t and not t.done():
        return
    _finish_retry_tasks[key] = asyncio.create_task(
        _retry_send_finish(bot, battle_id, user_id, who))


def _level_idx_to_name(idx: int) -> str:
    from bot import LEVEL_ORDER
    return LEVEL_ORDER[idx]


def _level_label_ko(level: str) -> str:
    from bot import LEVEL_ADVANCED, LEVEL_BEGINNER, LEVEL_INTERMEDIATE
    if level == LEVEL_BEGINNER:
        return "🟢 초급"
    if level == LEVEL_INTERMEDIATE:
        return "🟡 중급"
    if level == LEVEL_ADVANCED:
        return "🔴 고급"
    return level


def _kb_levels() -> InlineKeyboardMarkup:
    rows = [
        [InlineKeyboardButton(text="🟢 초급", callback_data="bt:lv:0")],
        [InlineKeyboardButton(text="🟡 중급", callback_data="bt:lv:1")],
        [InlineKeyboardButton(text="🔴 고급", callback_data="bt:lv:2")],
    ]
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _kb_mode(level_idx: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="👤 친구와 배틀",
                    callback_data=f"bt:mf:{level_idx}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="🎲 랜덤 배틀",
                    callback_data=f"bt:mr:{level_idx}",
                )
            ],
        ]
    )


def _kb_share(deep_link: str) -> InlineKeyboardMarkup:
    share = build_share_url(deep_link)
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📤 친구에게 공유",
                    url=share,
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌ 취소",
                    callback_data="bt:ic:0",
                )
            ],
        ]
    )


def _kb_invite_friend(invite_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ 수락",
                    callback_data=f"bt:ok:{invite_id}"),
                InlineKeyboardButton(
                    text="❌ 거절",
                    callback_data=f"bt:nd:{invite_id}"),
            ]])


def _kb_invite_random(invite_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text="✅ 수락", callback_data=f"bt:ok:{invite_id}")],
        ]
    )


def _kb_ai_offer(battle_id: int, invite_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅네, AI와 배틀 할게요",
                    callback_data=f"bt:aiy:{battle_id}:{invite_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌아니요, AI와 배틀을 안 할래요",
                    callback_data=f"bt:ain:{battle_id}:{invite_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="🎲50명에게 다시 초대를 보낼게요",
                    callback_data=f"bt:air:{battle_id}:{invite_id}",
                )
            ],
        ]
    )


def _kb_decline_initiator(level_idx: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🔄 다시 초대", callback_data=f"bt:mf:{level_idx}"),
                InlineKeyboardButton(text="🎲 랜덤 배틀", callback_data=f"bt:mr:{level_idx}"),
            ],
            [InlineKeyboardButton(text="🏠 메인 메뉴", callback_data="bt:hm:1")],
        ]
    )


def _kb_finish() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(text="🔄 다시 하기", callback_data="bt:ag:1"),
                InlineKeyboardButton(text="🏠 메인 메뉴", callback_data="bt:hm:1"),
            ]
        ]
    )


def _kb_active_battle(battle_id: int) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ 진행 중인 배틀을 계속하기",
                    callback_data=f"bt:rb:{battle_id}",
                )
            ],
            [
                InlineKeyboardButton(
                    text="❌진행 중인 배틀을 종료하기",
                    callback_data=f"bt:fb:{battle_id}",
                )
            ],
        ]
    )


def _build_question_caption(word: dict) -> str:
    from bot import build_question_text

    return build_question_text(word)


def _kb_answers(battle_id: int, word: dict) -> InlineKeyboardMarkup:
    from bot import _pretty_korean_word

    rows = []
    for i, opt in enumerate(word["options"]):
        rows.append(
            [
                InlineKeyboardButton(
                    text=f"{i + 1}) {_pretty_korean_word(opt)}",
                    callback_data=f"bt:an:{battle_id}:{i}",
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=rows)


def _cancel_turn_timer(battle_id: int) -> None:
    t = _turn_timers.pop(battle_id, None)
    if t and not t.done():
        t.cancel()


async def _safe_send(bot: Bot, chat_id: int, text: str,
                     **kwargs: Any) -> Message | None:
    try:
        return await bot.send_message(chat_id, text, **kwargs)
    except (TelegramForbiddenError, TelegramBadRequest, TelegramNetworkError) as e:
        logger.warning("battle send fail chat=%s: %s", chat_id, e)
        return None


async def _forfeit_if_blocked(
        bot: Bot,
        battle_id: int,
        failed_uid: int) -> None:
    nb = await bs.forfeit_due_to_block(battle_id, failed_uid)
    if not nb:
        return
    txt = (
        "⚔️ 상대가 봇을 차단했거나 채팅을 사용할 수 없어 배틀이 종료되었습니다.\n"
        f"패자 처리: {await bs.get_user_display_name(failed_uid)}"
    )
    for uid in (nb.initiator_id, nb.opponent_id):
        if uid and not nb.is_ai_opponent:
            await _safe_send(bot, uid, txt)
        elif uid == nb.initiator_id and nb.is_ai_opponent:
            await _safe_send(bot, uid, txt)


async def _status_text(b: Battle) -> str:
    n1 = await bs.get_user_display_name(b.initiator_id)
    if b.is_ai_opponent:
        n2 = bs.AI_DISPLAY_NAME
    elif b.opponent_id is not None:
        n2 = await bs.get_user_display_name(b.opponent_id)
    else:
        n2 = "?"
    nxt = ""
    if b.status == "active":
        if b.current_turn == bs.TURN_INITIATOR:
            nxt = n1
        elif b.is_ai_opponent:
            nxt = n2
        elif b.opponent_id is not None:
            nxt = n2
    ri = f"{b.initiator_answers_cnt}/{bs.ANSWERS_PER_PLAYER}"
    ro = f"{b.opponent_answers_cnt}/{bs.ANSWERS_PER_PLAYER}"
    body = (
        "⚔️ 배틀 현황\n\n"
        f"👤 {n1}: {b.initiator_score} 💎  (퀴즈 {ri})\n"
        f"👤 {n2}: {b.opponent_score} 💎  (퀴즈 {ro})\n"
    )
    if nxt:
        body += f"\n다음 차례: {nxt} 5초⏳"
    return body


async def _broadcast_status(bot: Bot, b: Battle) -> None:
    t = await _status_text(b)
    await _safe_send(bot, b.initiator_id, t)
    if b.is_ai_opponent:
        return
    if b.opponent_id is not None:
        await _safe_send(bot, b.opponent_id, t)


async def _show_finish(bot: Bot, b: Battle) -> None:
    _cancel_turn_timer(b.id)
    _question_chat_msg.pop(b.id, None)
    if b.status in ("active", "waiting"):
        await bs.update_battle(
            b.id,
            status="finished",
            finished_at=bs._iso_now(),
        )
        b = await bs.get_battle(b.id) or b
    n1 = await bs.get_user_display_name(b.initiator_id)
    if b.is_ai_opponent:
        n2 = bs.AI_DISPLAY_NAME
    else:
        n2 = await bs.get_user_display_name(b.opponent_id or 0)
    i_s, o_s = b.initiator_score, b.opponent_score
    kb = _kb_finish()
    if i_s == o_s:
        body = (
            "🤝 무승부!\n\n"
            f"👤 {n1}: {i_s} 💎\n"
            f"👤 {n2}: {o_s} 💎"
        )
        m1 = await _safe_send(bot, b.initiator_id, body, reply_markup=kb)
        if m1:
            await bs.update_battle(b.id, finish_notified_initiator=1)
        else:
            _schedule_finish_retry(bot, b.id, b.initiator_id, "initiator")
        if not b.is_ai_opponent and b.opponent_id is not None:
            m2 = await _safe_send(bot, b.opponent_id, body, reply_markup=kb)
            if m2:
                await bs.update_battle(b.id, finish_notified_opponent=1)
            else:
                _schedule_finish_retry(bot, b.id, b.opponent_id, "opponent")
    else:
        if i_s > o_s:
            win, lose, ws, ls = n1, n2, i_s, o_s
            initiator_won = True
        else:
            win, lose, ws, ls = n2, n1, o_s, i_s
            initiator_won = False
        header = (
            "🏆 최종 결과!\n\n"
            f"👤 {win}: {ws} 💎 🏆 승리!\n"
            f"👤 {lose}: {ls} 💎\n\n"
        )
        congrats = "축하합니다! 🎉"
        encouragement = (
            "절대 포기하지 마세요 ! \n 열심히 공부하고 다음에 꼭 이기세요 🤩 \n "
            "제가 당신을 응원하겠습니다 🥹😇"
        )
        m1 = await _safe_send(
            bot,
            b.initiator_id,
            header + (congrats if initiator_won else encouragement),
            reply_markup=kb,
        )
        if m1:
            await bs.update_battle(b.id, finish_notified_initiator=1)
        else:
            _schedule_finish_retry(bot, b.id, b.initiator_id, "initiator")
        if not b.is_ai_opponent and b.opponent_id is not None:
            m2 = await _safe_send(
                bot,
                b.opponent_id,
                header + (congrats if not initiator_won else encouragement),
                reply_markup=kb,
            )
            if m2:
                await bs.update_battle(b.id, finish_notified_opponent=1)
            else:
                _schedule_finish_retry(bot, b.id, b.opponent_id, "opponent")


async def _maybe_resend_finish(bot: Bot, user_id: int) -> None:
    b = await bs.get_latest_unnotified_finished_battle_for_user(user_id)
    if not b:
        return
    await _show_finish(bot, b)


async def _on_question_timeout(bot: Bot, battle_id: int) -> None:
    b = await bs.get_battle(battle_id)
    if not b or b.status != "active" or b.current_word_id is None:
        return
    wid = b.current_word_id
    word = bs.pick_word_by_id(wid)
    if not word:
        return
    ci = word["correct_index"]
    correct_txt = word["options"][ci]
    from bot import _pretty_korean_word
    reveal = f"⏰ 5초 지났습니다!\n정답: {ci + 1}) {_pretty_korean_word(correct_txt)}"
    cm = _question_chat_msg.pop(battle_id, None)
    if cm:
        chat_id, mid = cm
        try:
            await bot.edit_message_reply_markup(chat_id=chat_id, message_id=mid, reply_markup=None)
        except TelegramBadRequest:
            pass
    for uid in (b.initiator_id, b.opponent_id):
        if uid and (not b.is_ai_opponent or uid == b.initiator_id):
            await _safe_send(bot, uid, reveal)
    code, nb = await bs.apply_turn_outcome(battle_id, "timeout")
    if code == "not_found":
        logger.warning(
            "battle timeout: apply_turn_outcome not_found battle_id=%s",
            battle_id)
        return
    if nb:
        await _broadcast_status(bot, nb)
    if code == "done" and nb:
        await _show_finish(bot, nb)
    elif code == "go_on" and nb:
        await do_round(bot, battle_id)


async def do_round(bot: Bot, battle_id: int) -> None:
    b = await bs.get_battle(battle_id)
    if not b or b.status != "active":
        return
    if bs.battle_is_done(
        b.initiator_answers_cnt,
        b.opponent_answers_cnt,
        b.initiator_score,
        b.opponent_score,
    ):
        await _show_finish(bot, b)
        return

    if b.current_turn == bs.TURN_OPPONENT and b.is_ai_opponent:
        wid = await bs.prepare_new_question(battle_id, b.level)
        if not wid:
            await _show_finish(bot, b)
            return
        word = bs.pick_word_by_id(wid)
        if not word:
            await _show_finish(bot, b)
            return
        await asyncio.sleep(battle_ai.ai_think_delay_sec())
        b2 = await bs.get_battle(battle_id)
        if not b2 or b2.status != "active" or b2.current_word_id != wid:
            return
        ci = word["correct_index"]
        pick = battle_ai.pick_ai_option_index(
            len(word["options"]), ci, b2.level)
        out = "correct" if pick == ci else "wrong"
        code, nb = await bs.apply_turn_outcome(battle_id, out)
        if nb:
            await _broadcast_status(bot, nb)
        if code == "done" and nb:
            await _show_finish(bot, nb)
        elif code == "go_on":
            await do_round(bot, battle_id)
        return

    wid = await bs.prepare_new_question(battle_id, b.level)
    if not wid:
        await _safe_send(
            bot,
            b.initiator_id,
            "⚔️ 이 레벨에서 더 이상 출제할 단어가 없어 배틀을 종료합니다.",
        )
        if not b.is_ai_opponent and b.opponent_id is not None:
            await _safe_send(
                bot,
                b.opponent_id,
                "⚔️ 이 레벨에서 더 이상 출제할 단어가 없어 배틀을 종료합니다.",
            )
        await _show_finish(bot, b)
        return
    word = bs.pick_word_by_id(wid)
    if not word:
        await _show_finish(bot, b)
        return
    b = await bs.get_battle(battle_id) or b
    uid = bs.expected_answerer_user_id(b)
    if uid is None:
        logger.error(
            "battle do_round: expected_answerer_user_id is None battle_id=%s turn=%s ai=%s opp=%s",
            battle_id,
            b.current_turn,
            b.is_ai_opponent,
            b.opponent_id,
        )
        return
    cap = _build_question_caption(word)
    kb = _kb_answers(battle_id, word)
    msg = await _safe_send(bot, uid, cap, reply_markup=kb)
    if not msg:
        await _forfeit_if_blocked(bot, battle_id, uid)
        return
    _question_chat_msg[battle_id] = (uid, msg.message_id)
    _cancel_turn_timer(battle_id)
    from utils.battle_timer import schedule_question_timer

    _turn_timers[battle_id] = schedule_question_timer(
        bs.QUESTION_TIMEOUT_SEC,
        partial(_run_timeout_wrapper, bot, battle_id),
    )


async def _run_timeout_wrapper(bot: Bot, battle_id: int) -> None:
    await _on_question_timeout(bot, battle_id)


async def _start_battle_flow_after_accept(bot: Bot, battle_id: int) -> None:
    b = await bs.get_battle(battle_id)
    if b:
        await _broadcast_status(bot, b)
    await do_round(bot, battle_id)


async def _clear_random_messages(bot: Bot, invite_id: int) -> None:
    rows = await bs.get_invite_message_rows(invite_id)
    for _uid, chat_id, mid in rows:
        try:
            await bot.edit_message_reply_markup(chat_id=chat_id, message_id=mid, reply_markup=None)
        except TelegramBadRequest:
            pass


async def process_battle_deep_link(message: Message, token: str) -> bool:
    from bot import MAIN_MENU_KB

    pair = await bs.get_invite_by_token(token)
    if not pair:
        await message.answer("⏰ 초대 링크가 만료되었습니다.", reply_markup=MAIN_MENU_KB)
        return True
    inv, battle = pair
    if not battle:
        await message.answer("⏰ 초대 링크가 만료되었습니다.", reply_markup=MAIN_MENU_KB)
        return True
    from datetime import datetime, timezone

    now = datetime.now(timezone.utc).isoformat()
    if inv.status != "pending" or (now > inv.expires_at):
        await message.answer("⏰ 초대 링크가 만료되었습니다.", reply_markup=MAIN_MENU_KB)
        return True
    if await bs.user_has_active_battle(message.from_user.id):
        await message.answer("이미 진행 중인 배틀이 있습니다.", reply_markup=MAIN_MENU_KB)
        return True
    ini = await bs.get_user_display_name(battle.initiator_id)
    txt = (
        "⚔️ 배틀 초대!\n\n"
        f"👤 {ini} 님이 배틀에 초대했습니다!\n"
        f"레벨: {_level_label_ko(battle.level)}\n\n"
        "수락하시겠습니까?"
    )
    await message.answer(txt, reply_markup=_kb_invite_friend(inv.id))
    return True


async def on_battle_button(message: Message) -> None:
    from bot import MAIN_MENU_KB, get_or_create_user

    await get_or_create_user(
        message.from_user.id,
        message.from_user.username,
        message.from_user.first_name,
    )
    if await bs.user_has_active_battle(message.from_user.id):
        b = await bs.get_active_battle_for_user(message.from_user.id)
        if not b:
            await message.answer("🛡이미 진행 중인 배틀이 있습니다...", reply_markup=MAIN_MENU_KB)
            return
        await message.answer(
            "🛡이미 진행 중인 배틀이 있습니다...",
            reply_markup=_kb_active_battle(b.id),
        )
        return
    await message.answer("레벨을 선택하세요.", reply_markup=_kb_levels())


@battle_router.callback_query(F.data.startswith("bt:"))
async def on_battle_callback(callback: CallbackQuery) -> None:
    from bot import MAIN_MENU_KB, get_or_create_user

    data = callback.data or ""
    parts = data.split(":")
    if len(parts) < 2 or parts[0] != "bt":
        return
    kind = parts[1]
    bot = callback.bot

    if kind == "hm":
        await callback.answer()
        await callback.message.answer("메인 메뉴", reply_markup=MAIN_MENU_KB)
        return

    if kind == "ag":
        await callback.answer()
        await callback.message.edit_reply_markup(reply_markup=None)
        await callback.message.answer("레벨을 선택하세요.", reply_markup=_kb_levels())
        return

    if kind in ("rb", "fb") and len(parts) >= 3:
        battle_id = int(parts[2])
        b = await bs.get_battle(battle_id)
        if not b or b.status not in ("waiting", "active"):
            await callback.answer("배틀이 없습니다.", show_alert=True)
            return
        if callback.from_user.id not in (b.initiator_id, b.opponent_id):
            await callback.answer("권한이 없습니다.", show_alert=True)
            return
        await callback.answer()
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except TelegramBadRequest:
            pass

        if kind == "fb":
            await bs.update_battle(
                b.id,
                status="finished",
                finished_at=bs._iso_now(),
            )
            b2 = await bs.get_battle(b.id) or b
            await _show_finish(bot, b2)
            return

        # kind == "rb": resume
        b2 = await bs.get_battle(b.id) or b
        if b2.status == "waiting":
            await _safe_send(bot, callback.from_user.id, "⏳ 아직 배틀이 시작되지 않았습니다. 상대의 수락을 기다려 주세요.")
            return

        # Active battle: if a question is already selected, resend it to
        # expected answerer.
        if b2.current_word_id is not None:
            wid = b2.current_word_id
            word = bs.pick_word_by_id(wid)
            if word:
                uid = bs.expected_answerer_user_id(b2)
                if uid is not None:
                    cap = _build_question_caption(word)
                    kb = _kb_answers(b2.id, word)
                    msg = await _safe_send(bot, uid, cap, reply_markup=kb)
                    if msg:
                        _question_chat_msg[b2.id] = (uid, msg.message_id)
                        _cancel_turn_timer(b2.id)
                        from utils.battle_timer import schedule_question_timer

                        _turn_timers[b2.id] = schedule_question_timer(
                            bs.QUESTION_TIMEOUT_SEC,
                            partial(_run_timeout_wrapper, bot, b2.id),
                        )
            await _broadcast_status(bot, b2)
            return

        await _broadcast_status(bot, b2)
        await do_round(bot, b2.id)
        return

    if kind == "lv" and len(parts) >= 3:
        await callback.answer()
        idx = int(parts[2])
        await callback.message.edit_text(
            "배틀 방식을 선택하세요.",
            reply_markup=_kb_mode(idx),
        )
        return

    if kind == "mf" and len(parts) >= 3:
        if await bs.user_has_active_battle(callback.from_user.id):
            await callback.answer("이미 배틀 중입니다.", show_alert=True)
            return
        await callback.answer()
        level_idx = int(parts[2])
        level = _level_idx_to_name(level_idx)
        bid = await bs.create_battle(callback.from_user.id, level, False)
        tok = str(uuid.uuid4())
        iid = await bs.add_invite(bid, tok, "friend", None, life_minutes=bs.FRIEND_INVITE_MIN)
        me = await bot.get_me()
        uname = me.username or ""
        link = build_telegram_deeplink(uname, tok)
        share_kb = _kb_share(link)
        share_kb.inline_keyboard[1][0] = InlineKeyboardButton(
            text="❌ 취소",
            callback_data=f"bt:ic:{iid}",
        )
        await callback.message.edit_text(
            "⚔️ 배틀 링크가 생성되었습니다!\n\n"
            "아래 버튼을 눌러 친구에게 공유하세요 👇",
            reply_markup=share_kb,
        )
        return

    if kind == "mr" and len(parts) >= 3:
        if await bs.user_has_active_battle(callback.from_user.id):
            await callback.answer("이미 배틀 중입니다.", show_alert=True)
            return
        await callback.answer()
        level_idx = int(parts[2])
        level = _level_idx_to_name(level_idx)
        bid = await bs.create_battle(callback.from_user.id, level, False)
        tok = str(uuid.uuid4())
        iid = await bs.add_invite(
            bid, tok, "random", None, life_seconds=bs.RANDOM_WINDOW_SEC
        )
        uids = await bs.user_ids_for_random_invite(level, callback.from_user.id, 50)
        # immediate feedback to initiator
        await _safe_send(
            bot,
            callback.from_user.id,
            f"🎲랜덤으로 {len(uids)}명에게 초대를 보냈습니다. 잠시만 기다려 주세요…",
        )
        text = (
            "⚔️ 랜덤 배틀 도전!\n"
            f"레벨: {_level_label_ko(level)}\n\n"
            "첫 수락자가 상대가 됩니다. 참가하려면 ✅를 눌러주세요."
        )
        sem = asyncio.Semaphore(5)

        async def one(uid: int) -> None:
            async with sem:
                try:
                    m = await bot.send_message(uid, text, reply_markup=_kb_invite_random(iid))
                    await bs.save_invite_message(iid, uid, m.chat.id, m.message_id)
                except (TelegramForbiddenError, TelegramBadRequest):
                    pass
                await asyncio.sleep(0.05)

        await asyncio.gather(*(one(u) for u in uids))

        key = (bid, iid)

        async def wait_ai_offer() -> None:
            await asyncio.sleep(bs.RANDOM_WINDOW_SEC)
            pair = await bs.get_invite(iid)
            if not pair:
                return
            inv, b = pair
            if not b or b.status != "waiting":
                return
            if inv.status != "pending":
                return
            await _safe_send(
                bot,
                callback.from_user.id,
                "⏰ 아무도 🎲랜덤 배틀 하고 싶지 않네요 ㅜㅜ \n"
                "🤖 AI와 배틀을 해보실래요 ? \n"
                "🎲아니면 다른 50명에게 다시 초대를 보내실래요 ?",
                reply_markup=_kb_ai_offer(bid, iid),
            )

        _random_ai_tasks[key] = asyncio.create_task(wait_ai_offer())
        try:
            await callback.message.edit_text(
                f"🎲랜덤으로 {len(uids)}명에게 초대를 보냈습니다. 잠시만 기다려 주세요…"
            )
        except TelegramBadRequest:
            pass
        return

    if kind in ("aiy", "ain", "air") and len(parts) >= 4:
        bid = int(parts[2])
        iid = int(parts[3])
        pair = await bs.get_invite(iid)
        if not pair:
            await callback.answer()
            return
        inv, b = pair
        if not b or b.id != bid:
            await callback.answer()
            return
        if callback.from_user.id != b.initiator_id:
            await callback.answer("권한이 없습니다.", show_alert=True)
            return
        await callback.answer()
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except TelegramBadRequest:
            pass
        key = (bid, iid)
        t = _random_ai_tasks.pop(key, None)
        if t and not t.done():
            t.cancel()
        # clean up pending random invite buttons in other chats
        await _clear_random_messages(bot, iid)
        if kind == "ain":
            err = await bs.cancel_random_invite(callback.from_user.id, bid, iid)
            if err:
                await _safe_send(bot, callback.from_user.id, "❌ 취소할 수 없습니다.")
            else:
                await _safe_send(bot, callback.from_user.id, "❌ 배틀을 취소했습니다.")
            return
        if kind == "air":
            err, new_iid = await bs.renew_random_invite(callback.from_user.id, bid, iid)
            if err or not new_iid:
                await _safe_send(bot, callback.from_user.id, "❌ 다시 초대할 수 없습니다.")
                return
            # resend to a new random batch
            uids = await bs.user_ids_for_random_invite(b.level, callback.from_user.id, 50)
            text = (
                "⚔️ 랜덤 배틀 도전!\n"
                f"레벨: {_level_label_ko(b.level)}\n\n"
                "첫 수락자가 상대가 됩니다. 참가하려면 ✅를 눌러주세요."
            )
            sem = asyncio.Semaphore(5)

            async def one(uid: int) -> None:
                async with sem:
                    try:
                        m = await bot.send_message(uid, text, reply_markup=_kb_invite_random(new_iid))
                        await bs.save_invite_message(new_iid, uid, m.chat.id, m.message_id)
                    except (TelegramForbiddenError, TelegramBadRequest):
                        pass
                    await asyncio.sleep(0.05)

            await asyncio.gather(*(one(u) for u in uids))

            async def wait_ai_offer2() -> None:
                await asyncio.sleep(bs.RANDOM_WINDOW_SEC)
                pair2 = await bs.get_invite(new_iid)
                if not pair2:
                    return
                inv2, b2 = pair2
                if not b2 or b2.status != "waiting":
                    return
                if inv2.status != "pending":
                    return
                await _safe_send(
                    bot,
                    callback.from_user.id,
                    "⏰ 아무도 🎲랜덤 배틀 하고 싶지 않네요 ㅜㅜ \n"
                    "🤖 AI와 배틀을 해보실래요 ?"
                    "\n🎲아니면 다른 50명에게 다시 초대를 보내실래요 ?",
                    reply_markup=_kb_ai_offer(bid, new_iid),
                )

            _random_ai_tasks[(bid, new_iid)] = asyncio.create_task(
                wait_ai_offer2())
            await _safe_send(
                bot,
                callback.from_user.id,
                f"🎲랜덤으로 {len(uids)}명에게 초대를 보냈습니다. 잠시만 기다려 주세요…",
            )
            return
        # kind == aiy
        if await bs.start_random_with_ai(bid, iid):
            ini = await bs.get_user_display_name(callback.from_user.id)
            await _safe_send(
                bot,
                callback.from_user.id,
                f"✅ 좋아요! 🤖 AI와 배틀을 시작합니다.\n준비되셨나요, {ini} 님?",
            )
            await _start_battle_flow_after_accept(bot, bid)
        return

    if kind == "ic" and len(parts) >= 3:
        iid = int(parts[2])
        pair = await bs.get_invite(iid)
        if not pair:
            await callback.answer()
            return
        inv, battle = pair
        if not battle:
            await callback.answer()
            return
        err = await bs.cancel_friend_invite(callback.from_user.id, inv.battle_id, iid)
        await callback.answer("취소했습니다." if not err else "취소할 수 없습니다.", show_alert=bool(err))
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except TelegramBadRequest:
            pass
        return

    if kind == "ok" and len(parts) >= 3:
        iid = int(parts[2])
        code, nb, inv = await bs.try_accept_invite(iid, callback.from_user.id)
        if code == "expired":
            await callback.answer("⏰ 링크가 만료되었습니다.", show_alert=True)
            try:
                await callback.message.edit_text("⏰ 초대 링크가 만료되었습니다.")
            except TelegramBadRequest:
                pass
            if nb and inv and inv.invite_type == "friend":
                await _safe_send(
                    bot,
                    nb.initiator_id,
                    "⏰ 초대가 만료되었습니다.",
                )
            return
        if code != "ok" or not nb or not inv:
            await callback.answer(
                "참여할 수 없습니다." if code != "self" else "본인의 초대입니다.",
                show_alert=True,
            )
            return
        await callback.answer()
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except TelegramBadRequest:
            pass
        key = (nb.id, inv.id)
        t = _random_ai_tasks.pop(key, None)
        if t and not t.done():
            t.cancel()
        if inv.invite_type == "random":
            await _clear_random_messages(bot, inv.id)
        opp = await bs.get_user_display_name(callback.from_user.id)
        await _safe_send(
            bot,
            nb.initiator_id,
            f"✅ {opp} 님이 수락했습니다! 배틀 시작! ⚔️",
        )
        await get_or_create_user(
            callback.from_user.id,
            callback.from_user.username,
            callback.from_user.first_name,
        )
        await _start_battle_flow_after_accept(bot, nb.id)
        return

    if kind == "nd" and len(parts) >= 3:
        iid = int(parts[2])
        code, nb, inv = await bs.decline_opponent(iid, callback.from_user.id)
        if code == "ignored":
            await callback.answer()
            return
        await callback.answer()
        try:
            await callback.message.edit_reply_markup(reply_markup=None)
        except TelegramBadRequest:
            pass
        if code == "ok" and nb and inv:
            level_idx = 0
            from bot import LEVEL_ORDER
            try:
                level_idx = LEVEL_ORDER.index(nb.level)
            except ValueError:
                level_idx = 0
            opp = await bs.get_user_display_name(callback.from_user.id)
            await _safe_send(
                bot,
                nb.initiator_id,
                f"❌ {opp} 님이 거절했습니다.",
                reply_markup=_kb_decline_initiator(level_idx),
            )
        return

    if kind == "an" and len(parts) >= 4:
        battle_id = int(parts[2])
        sel = int(parts[3])
        b = await bs.get_battle(battle_id)
        if not b or b.status != "active":
            await callback.answer("배틀이 종료되었습니다.", show_alert=True)
            return
        exp = bs.expected_answerer_user_id(b)
        if exp != callback.from_user.id:
            await callback.answer("지금은 당신 차례가 아닙니다.", show_alert=True)
            return
        wid = b.current_word_id
        if wid is None:
            await callback.answer("문항이 없습니다.", show_alert=True)
            return
        word = bs.pick_word_by_id(wid)
        if not word:
            await callback.answer("오류", show_alert=True)
            return
        ci = word["correct_index"]
        out = "correct" if sel == ci else "wrong"
        _cancel_turn_timer(battle_id)
        cm = _question_chat_msg.pop(battle_id, None)
        if cm:
            try:
                await bot.edit_message_reply_markup(
                    chat_id=cm[0], message_id=cm[1], reply_markup=None
                )
            except TelegramBadRequest:
                pass
        from bot import _pretty_korean_word
        if out == "wrong":
            wrong_msg = f"정답: {ci + 1}) {_pretty_korean_word(word['options'][ci])}"
            for uid in (b.initiator_id, b.opponent_id):
                if uid and (not b.is_ai_opponent or uid == b.initiator_id):
                    await _safe_send(bot, uid, wrong_msg)
        await callback.answer("정답!" if out == "correct" else "오답", show_alert=False)
        code, nb = await bs.apply_turn_outcome(battle_id, out)
        if code == "not_found":
            logger.warning(
                "battle answer: apply not_found battle_id=%s",
                battle_id)
            return
        if nb:
            await _broadcast_status(bot, nb)
        if code == "done" and nb:
            await _show_finish(bot, nb)
        elif code == "go_on":
            await do_round(bot, battle_id)
        return

    await callback.answer()
