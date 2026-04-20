"""
SQLite access and battle state. Uses DB_PATH (same as main bot).
"""
from __future__ import annotations

import contextlib
import json
import logging
import os
import random
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import Any, List, Optional, Tuple

import aiosqlite

from models.battle import Battle, BattleInvite

DB_PATH = os.environ.get("DB_PATH", "quiz_bot.db")
logger = logging.getLogger(__name__)

ANSWERS_PER_PLAYER = 10
# После 10 ответов с каждой стороны бой не заканчивается, пока нет ≥10 💎 у кого‑либо
# (или не исчерпан лимит полу‑раундов — защита от бесконечной игры).
TARGET_BATTLE_DIAMONDS = 10
MAX_BATTLE_HALF_ROUNDS = 40
QUESTION_TIMEOUT_SEC = 5.0
FRIEND_INVITE_MIN = 5
RANDOM_WINDOW_SEC = 10
TURN_INITIATOR = "initiator"
TURN_OPPONENT = "opponent"

AI_DISPLAY_NAME = "🤖 AI"


@asynccontextmanager
async def _db():
    conn = await aiosqlite.connect(DB_PATH)
    await conn.execute("PRAGMA foreign_keys=ON")
    await conn.execute("PRAGMA busy_timeout=8000")
    try:
        yield conn
    finally:
        await conn.close()


def _iso_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _row_battle(t: tuple) -> Battle:
    return Battle(
        id=t[0],
        initiator_id=t[1],
        opponent_id=t[2] if t[2] is not None else None,
        is_ai_opponent=bool(t[3]),
        level=t[4],
        status=t[5],
        initiator_score=t[6],
        opponent_score=t[7],
        current_turn=t[8],
        initiator_answers_cnt=t[9],
        opponent_answers_cnt=t[10],
        used_word_ids=t[11] or "[]",
        current_word_id=t[12],
        forfeit_by=t[13],
        created_at=t[14],
        finished_at=t[15],
        finish_notified_initiator=int(t[16] or 0) if len(t) > 16 else 0,
        finish_notified_opponent=int(t[17] or 0) if len(t) > 17 else 0,
    )


def _row_invite(t: tuple) -> BattleInvite:
    return BattleInvite(
        id=t[0],
        battle_id=t[1],
        invited_user_id=t[2],
        invite_token=t[3],
        invite_type=t[4],
        status=t[5],
        sent_at=t[6],
        expires_at=t[7],
    )


def _load_used_ids(used: str) -> list[int]:
    with contextlib.suppress(Exception, TypeError, ValueError):
        data = json.loads(used)
        if isinstance(data, list):
            return [int(x) for x in data if str(x).lstrip("-").isdigit()]
    return []


def _dump_used_ids(ids: list[int]) -> str:
    return json.dumps(ids, separators=(",", ":"))


def pick_unseen_word_id(level: str, used: str) -> int | None:
    from bot import WORDS_BY_LEVEL

    pool: list = list(WORDS_BY_LEVEL.get(level) or [])
    if not pool:
        return None
    u = set(_load_used_ids(used))
    candidates = [w["id"] for w in pool if w["id"] not in u]
    if not candidates:
        # 10+10 вопросов может превысить число уникальных слов уровня — разрешаем повтор
        return random.choice([w["id"] for w in pool])
    return random.choice(candidates)


def pick_word_by_id(word_id: int) -> Any | None:
    from bot import WORDS_BY_ID
    return WORDS_BY_ID.get(word_id)


async def user_has_active_battle(user_id: int) -> bool:
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT 1 FROM battles
            WHERE status IN ('waiting', 'active')
              AND (initiator_id = ? OR (opponent_id IS NOT NULL AND opponent_id = ?))
            LIMIT 1
            """,
            (user_id, user_id),
        )
        row = await cur.fetchone()
        await cur.close()
    return row is not None


async def get_active_battle_for_user(user_id: int) -> Battle | None:
    """
    Return latest battle in 'waiting' or 'active' where user participates.
    For AI battles opponent_id is NULL; initiator_id is always the user.
    """
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT * FROM battles
            WHERE status IN ('waiting', 'active')
              AND (initiator_id = ? OR opponent_id = ?)
            ORDER BY id DESC
            LIMIT 1
            """,
            (user_id, user_id),
        )
        t = await cur.fetchone()
        await cur.close()
    return _row_battle(t) if t else None


async def create_battle(
    initiator_id: int,
    level: str,
    is_ai: bool = False,
) -> int:
    now = _iso_now()
    async with _db() as db:
        cur = await db.execute(
            """
            INSERT INTO battles (
                initiator_id, opponent_id, is_ai_opponent, level, status,
                initiator_score, opponent_score, current_turn,
                initiator_answers_cnt, opponent_answers_cnt,
                used_word_ids, current_word_id, forfeit_by, created_at, finished_at
            ) VALUES (?, NULL, ?, ?, 'waiting', 0, 0, 'initiator', 0, 0, '[]', NULL, NULL, ?, NULL)
            """,
            (initiator_id, int(is_ai), level, now),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def get_user_display_name(user_id: int) -> str:
    async with _db() as db:
        cur = await db.execute(
            "SELECT COALESCE(NULLIF(TRIM(first_name), ''), NULLIF(TRIM(username), ''), '') "
            "FROM users WHERE user_id = ?",
            (user_id,),
        )
        row = await cur.fetchone()
        await cur.close()
    if row and row[0]:
        return str(row[0])
    return str(user_id)


async def get_battle(bid: int) -> Battle | None:
    async with _db() as db:
        cur = await db.execute("SELECT * FROM battles WHERE id = ?", (bid,))
        t = await cur.fetchone()
        await cur.close()
    return _row_battle(t) if t else None


async def update_battle(battle_id: int, **kwargs: Any) -> bool:
    if not kwargs:
        return False
    allow = {
        "opponent_id", "is_ai_opponent", "level", "status", "initiator_score",
        "opponent_score", "current_turn", "initiator_answers_cnt", "opponent_answers_cnt",
        "used_word_ids", "current_word_id", "forfeit_by", "finished_at",
        "finish_notified_initiator", "finish_notified_opponent",
    }
    cols, vals = [], []
    for k, v in kwargs.items():
        if k in allow:
            cols.append(f"{k} = ?")
            vals.append(v)
    if not cols:
        return False
    vals.append(battle_id)
    async with _db() as db:
        await db.execute(
            f"UPDATE battles SET {', '.join(cols)} WHERE id = ?",
            tuple(vals),
        )
        await db.commit()
    return True


async def get_latest_unnotified_finished_battle_for_user(user_id: int) -> Battle | None:
    """
    Return most recent finished battle where this user hasn't received the finish message yet.
    Works for AI battles too (opponent_id is NULL).
    """
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT * FROM battles
            WHERE status = 'finished'
              AND (initiator_id = ? OR opponent_id = ?)
              AND (
                (initiator_id = ? AND COALESCE(finish_notified_initiator, 0) = 0)
                OR
                (opponent_id = ? AND COALESCE(finish_notified_opponent, 0) = 0)
              )
            ORDER BY COALESCE(finished_at, created_at) DESC
            LIMIT 1
            """,
            (user_id, user_id, user_id, user_id),
        )
        t = await cur.fetchone()
        await cur.close()
    return _row_battle(t) if t else None


async def get_unnotified_finished_battles(limit: int = 50) -> list[Battle]:
    """Return recently finished battles with any undelivered finish message."""
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT * FROM battles
            WHERE status = 'finished'
              AND (
                COALESCE(finish_notified_initiator, 0) = 0
                OR (opponent_id IS NOT NULL AND COALESCE(finish_notified_opponent, 0) = 0)
              )
            ORDER BY COALESCE(finished_at, created_at) DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = await cur.fetchall()
        await cur.close()
    return [_row_battle(r) for r in rows]


# ----- invites -----

async def add_invite(
    battle_id: int,
    token: str,
    itype: str,
    invited_user_id: int | None,
    life_minutes: int | None = FRIEND_INVITE_MIN,
    life_seconds: int | None = None,
) -> int:
    now = _iso_now()
    t0 = datetime.fromisoformat(now.replace("Z", "+00:00"))
    if life_seconds is not None:
        ex = t0 + timedelta(seconds=life_seconds)
    else:
        ex = t0 + timedelta(minutes=life_minutes or FRIEND_INVITE_MIN)
    ex_s = ex.astimezone(timezone.utc).isoformat()
    async with _db() as db:
        cur = await db.execute(
            """
            INSERT INTO battle_invites
            (battle_id, invited_user_id, invite_token, invite_type, status, sent_at, expires_at)
            VALUES (?, ?, ?, ?, 'pending', ?, ?)
            """,
            (battle_id, invited_user_id, token, itype, now, ex_s),
        )
        await db.commit()
        return int(cur.lastrowid or 0)


async def get_invite(iid: int) -> Optional[Tuple[BattleInvite, Optional[Battle]]]:
    inv_row = None
    async with _db() as db:
        cur = await db.execute("SELECT * FROM battle_invites WHERE id = ?", (iid,))
        inv_row = await cur.fetchone()
        await cur.close()
    if not inv_row:
        return None
    inv = _row_invite(inv_row)
    return inv, await get_battle(inv.battle_id)


async def get_invite_by_token(
    token: str,
) -> Optional[Tuple[BattleInvite, Optional[Battle]]]:
    inv_row = None
    async with _db() as db:
        cur = await db.execute("SELECT * FROM battle_invites WHERE invite_token = ?", (token,))
        inv_row = await cur.fetchone()
        await cur.close()
    if not inv_row:
        return None
    inv = _row_invite(inv_row)
    return inv, await get_battle(inv.battle_id)


async def get_invite_message_rows(invite_id: int) -> List[Tuple[int, int, int]]:
    async with _db() as db:
        cur = await db.execute(
            "SELECT user_id, chat_id, message_id FROM battle_invite_messages WHERE invite_id = ?",
            (invite_id,),
        )
        rows = await cur.fetchall()
        await cur.close()
    return [(r[0], r[1], r[2]) for r in rows]


async def save_invite_message(
    invite_id: int, user_id: int, chat_id: int, message_id: int
) -> None:
    async with _db() as db:
        await db.execute(
            """
            INSERT OR REPLACE INTO battle_invite_messages (invite_id, user_id, chat_id, message_id)
            VALUES (?, ?, ?, ?)
            """,
            (invite_id, user_id, chat_id, message_id),
        )
        await db.commit()


async def try_accept_invite(
    invite_id: int, actor_id: int
) -> tuple[str, Optional[Battle], Optional[BattleInvite]]:
    """ok | not_found | expired | self | full | not_waiting"""
    now = _iso_now()
    async with _db() as db:
        c = await db.execute("SELECT * FROM battle_invites WHERE id = ?", (invite_id,))
        ir = await c.fetchone()
        if not ir:
            return "not_found", None, None
        inv = _row_invite(ir)
        c2 = await db.execute("SELECT * FROM battles WHERE id = ?", (inv.battle_id,))
        br = await c2.fetchone()
        if not br:
            return "not_found", None, inv
        b = _row_battle(br)
        if b.initiator_id == actor_id:
            return "self", b, inv
        if inv.status != "pending" or (now > inv.expires_at):
            if now > inv.expires_at and inv.status == "pending":
                await db.execute("UPDATE battle_invites SET status = 'expired' WHERE id = ?", (inv.id,))
                if b.status == "waiting" and b.opponent_id in (None, 0) and (not b.is_ai_opponent):
                    await db.execute(
                        "UPDATE battles SET status = 'cancelled', finished_at = ? WHERE id = ?",
                        (now, b.id),
                    )
            await db.commit()
            return ("expired" if now > inv.expires_at else "not_waiting"), b, inv
        if b.is_ai_opponent:
            return "full", b, inv
        if b.status != "waiting":
            return "not_waiting", b, inv
        u = await db.execute(
            """
            UPDATE battles
            SET opponent_id = ?, status = 'active', is_ai_opponent = 0, current_turn = 'initiator'
            WHERE id = ? AND (opponent_id IS NULL OR opponent_id = 0)
              AND is_ai_opponent = 0
              AND status = 'waiting'
            """,
            (actor_id, b.id),
        )
        nch = u.rowcount if u else 0
        if nch == 0:
            await db.commit()
            b2 = await get_battle(b.id)
            return "full", b2, inv
        await db.execute("UPDATE battle_invites SET status = 'accepted' WHERE id = ?", (inv.id,))
        await db.commit()
    nb = await get_battle(b.id)
    pair = await get_invite(invite_id)
    ninv: Optional[BattleInvite] = pair[0] if pair else None
    return "ok", nb, ninv


async def start_random_with_ai(battle_id: int, invite_id: int) -> bool:
    """
    If battle still waiting with no human opponent, enable AI, activate battle.
    """
    async with _db() as db:
        c2 = await db.execute(
            "SELECT * FROM battles WHERE id = ? AND status = 'waiting' AND (opponent_id IS NULL OR opponent_id = 0) AND is_ai_opponent = 0",
            (battle_id,),
        )
        b_t = await c2.fetchone()
        await c2.close()
        if not b_t:
            return False
        await db.execute("UPDATE battle_invites SET status = 'expired' WHERE id = ? AND status = 'pending'", (invite_id,))
        await db.execute(
            """
            UPDATE battles
            SET is_ai_opponent = 1, status = 'active', opponent_id = NULL, current_turn = 'initiator'
            WHERE id = ?
            """,
            (battle_id,),
        )
        await db.commit()
    return True


async def cancel_random_invite(
    initiator_id: int, battle_id: int, invite_id: int
) -> str | None:
    """
    Cancel a random invite window (battle remains not started).
    Intended to be called by the battle initiator when nobody accepted.
    """
    b = await get_battle(battle_id)
    if not b or b.initiator_id != initiator_id:
        return "forbidden"
    if b.status != "waiting":
        return "not_waiting"
    now = _iso_now()
    async with _db() as db:
        # only cancel if invite still pending (or already expired by time)
        await db.execute(
            """
            UPDATE battle_invites
            SET status = 'superseded'
            WHERE id = ? AND battle_id = ? AND invite_type = 'random'
              AND status IN ('pending', 'expired')
            """,
            (invite_id, battle_id),
        )
        await db.execute(
            "UPDATE battles SET status = 'cancelled', finished_at = ? WHERE id = ?",
            (now, battle_id),
        )
        await db.commit()
    return None


async def renew_random_invite(
    initiator_id: int, battle_id: int, invite_id: int
) -> tuple[str | None, int]:
    """
    Supersede current random invite and create a new one for the same battle.
    Battle stays in 'waiting'. Returns (error, new_invite_id).
    """
    b = await get_battle(battle_id)
    if not b or b.initiator_id != initiator_id:
        return "forbidden", 0
    if b.status != "waiting":
        return "not_waiting", 0
    now = _iso_now()
    # supersede old invite (if still around)
    async with _db() as db:
        await db.execute(
            """
            UPDATE battle_invites
            SET status = 'superseded'
            WHERE id = ? AND battle_id = ? AND invite_type = 'random'
              AND status IN ('pending', 'expired')
            """,
            (invite_id, battle_id),
        )
        await db.commit()
    # create fresh invite window
    tok = str(uuid.uuid4())
    new_iid = await add_invite(battle_id, tok, "random", None, life_seconds=RANDOM_WINDOW_SEC)
    # ensure battle is still waiting (defensive)
    async with _db() as db:
        await db.execute(
            """
            UPDATE battles
            SET status = 'waiting', is_ai_opponent = 0, opponent_id = NULL, finished_at = NULL
            WHERE id = ?
            """,
            (battle_id,),
        )
        await db.commit()
    return None, new_iid


async def try_accept_by_token(
    token: str, actor_id: int
) -> tuple[str, Optional[Battle], Optional[BattleInvite]]:
    t = await get_invite_by_token(token)
    if not t:
        return "not_found", None, None
    inv, _b = t
    return await try_accept_invite(inv.id, actor_id)


async def decline_opponent(
    invite_id: int, user_id: int
) -> tuple[str, Optional[Battle], Optional[BattleInvite]]:
    now = _iso_now()
    async with _db() as db:
        c = await db.execute("SELECT * FROM battle_invites WHERE id = ?", (invite_id,))
        ir = await c.fetchone()
        if not ir:
            return "not_found", None, None
        inv = _row_invite(ir)
        b = await get_battle(inv.battle_id)
        if not b:
            return "not_found", None, inv
        if user_id == b.initiator_id:
            return "self", b, inv
        if inv.status != "pending" or (now > inv.expires_at):
            return "expired", b, inv
        if inv.invite_type != "friend":
            return "ignored", b, inv
        await db.execute("UPDATE battle_invites SET status = 'declined' WHERE id = ?", (invite_id,))
        await db.execute(
            "UPDATE battles SET status = 'cancelled', finished_at = ? WHERE id = ?",
            (now, b.id),
        )
        await db.commit()
    b2 = await get_battle(inv.battle_id)
    return "ok", b2, inv


async def cancel_friend_invite(
    initiator_id: int, battle_id: int, invite_id: int
) -> str | None:
    b = await get_battle(battle_id)
    if not b or b.initiator_id != initiator_id:
        return "forbidden"
    if b.status != "waiting":
        return "not_waiting"
    now = _iso_now()
    async with _db() as db:
        await db.execute("UPDATE battle_invites SET status = 'superseded' WHERE id = ? AND status = 'pending'", (invite_id,))  # type: ignore  # noqa: E501
        await db.execute("UPDATE battles SET status = 'cancelled', finished_at = ? WHERE id = ?", (now, battle_id))
        await db.commit()
    return None


def expected_answerer_user_id(b: Battle) -> int | None:
    if b.status != "active":
        return None
    if b.current_turn == TURN_INITIATOR:
        return b.initiator_id
    if b.is_ai_opponent:
        return None
    return b.opponent_id


async def user_ids_for_random_invite(
    level: str, except_uid: int, limit: int = 50
) -> List[int]:
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT DISTINCT a.user_id
            FROM answers a
            JOIN users u ON u.user_id = a.user_id
            WHERE a.level = ? AND a.user_id != ?
              AND (u.blocked_at IS NULL OR u.blocked_at = '')
            ORDER BY RANDOM()
            LIMIT ?
            """,
            (level, except_uid, limit),
        )
        rows = await cur.fetchall()
        await cur.close()
    return [int(r[0]) for r in rows]


def _clamped(n: int) -> int:
    return max(0, n)


def battle_is_done(
    initiator_answers: int,
    opponent_answers: int,
    initiator_score: int,
    opponent_score: int,
) -> bool:
    """
    Battle ends immediately after both players answered ANSWERS_PER_PLAYER questions.
    Winner is who has more diamonds; tie is handled by finish message renderer.
    """
    return (
        initiator_answers >= ANSWERS_PER_PLAYER
        and opponent_answers >= ANSWERS_PER_PLAYER
    )


async def prepare_new_question(
    battle_id: int, level: str
) -> int | None:
    b = await get_battle(battle_id)
    if not b:
        return None
    wid = pick_unseen_word_id(level, b.used_word_ids)
    if wid is None:
        return None
    used = _load_used_ids(b.used_word_ids) + [wid]
    await update_battle(
        battle_id, current_word_id=wid, used_word_ids=_dump_used_ids(used)
    )
    return wid


async def apply_turn_outcome(
    battle_id: int, outcome: str
) -> tuple[str, Optional[Battle]]:
    b = await get_battle(battle_id)
    if not b or b.status != "active" or b.current_word_id is None:
        return "not_found", b
    is_correct = outcome == "correct"
    d = 1 if is_correct else -1
    is_i = b.current_turn == TURN_INITIATOR
    i_s = b.initiator_score
    o_s = b.opponent_score
    ic, oc = b.initiator_answers_cnt, b.opponent_answers_cnt
    if is_i:
        i_s = _clamped(i_s + d)
        ic += 1
    else:
        o_s = _clamped(o_s + d)
        oc += 1
    nxt = TURN_OPPONENT if b.current_turn == TURN_INITIATOR else TURN_INITIATOR
    done = battle_is_done(ic, oc, i_s, o_s)
    when = _iso_now()
    await update_battle(
        battle_id,
        initiator_score=i_s,
        opponent_score=o_s,
        initiator_answers_cnt=ic,
        opponent_answers_cnt=oc,
        current_word_id=None,
        current_turn=nxt,
        status="finished" if done else "active",
        finished_at=when if done else None,
    )
    return ("done" if done else "go_on"), await get_battle(battle_id)


async def forfeit_due_to_block(
    battle_id: int, failed_user_id: int
) -> Optional[Battle]:
    b = await get_battle(battle_id)
    if not b or b.status not in ("active", "waiting"):
        return b
    is_init = failed_user_id == b.initiator_id
    is_opp = (not b.is_ai_opponent) and b.opponent_id is not None and b.opponent_id == failed_user_id
    if not is_init and not is_opp:
        return b
    now = _iso_now()
    if b.status == "waiting" and b.initiator_id == failed_user_id:
        await update_battle(
            b.id, status="forfeit", forfeit_by=failed_user_id, finished_at=now
        )
        return await get_battle(b.id)
    i_r = max(0, ANSWERS_PER_PLAYER - b.initiator_answers_cnt)
    o_r = max(0, ANSWERS_PER_PLAYER - b.opponent_answers_cnt)
    is_, os_ = b.initiator_score, b.opponent_score
    if is_init:
        is_ = _clamped(is_ - i_r)
    if is_opp and not b.is_ai_opponent:
        os_ = _clamped(os_ - o_r)
    if b.is_ai_opponent and b.opponent_id is None:
        is_ = _clamped(is_ - i_r) if is_init else is_
    else:
        if is_init:
            is_ = _clamped(is_ - i_r)
        if is_opp:
            os_ = _clamped(os_ - o_r)
    await update_battle(
        battle_id,
        status="forfeit",
        forfeit_by=failed_user_id,
        finished_at=now,
        initiator_score=is_,
        opponent_score=os_,
        initiator_answers_cnt=10,
        opponent_answers_cnt=10,
    )
    return await get_battle(battle_id)