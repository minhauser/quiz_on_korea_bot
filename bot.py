# Quiz bot (Korean vocabulary)
import asyncio
import csv
import json
import logging
import os
import random
import shutil
import sqlite3
import subprocess
import tempfile
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path
from typing import Set

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

import aiosqlite
from openpyxl import Workbook
from aiogram import Bot, Dispatcher, F
from aiogram.exceptions import TelegramBadRequest, TelegramUnauthorizedError
from aiogram.filters import CommandStart, Command
from aiogram.types import (
    BufferedInputFile,
    CallbackQuery,
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    KeyboardButton,
    Message,
    ReplyKeyboardMarkup,
)

# =======================
# DB CONNECTION (faster: WAL set in init_db; per-connection PRAGMAs here)
# =======================


@asynccontextmanager
async def _db():
    conn = await aiosqlite.connect(DB_PATH)
    await conn.execute("PRAGMA synchronous=NORMAL")
    await conn.execute("PRAGMA cache_size=-32000")
    try:
        yield conn
    finally:
        await conn.close()


# =======================
# CONFIGURATION
# =======================
# BOT_TOKEN and DB_PATH can be set via environment variables (e.g. on Railway).
# For local development use .env or export BOT_TOKEN=... and optionally
# DB_PATH=...

BOT_TOKEN = os.environ.get("BOT_TOKEN", "")
DB_PATH = os.environ.get("DB_PATH", "quiz_bot.db")
WORDS_FILE = os.environ.get("WORDS_FILE", "words.json")

# backup DB to GitHub every N seconds (set GITHUB_TOKEN + GITHUB_REPOSITORY on Railway)
BACKUP_INTERVAL_SEC = int(os.environ.get("BACKUP_INTERVAL_SEC", "300"))
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
GITHUB_REPOSITORY = os.environ.get("GITHUB_REPOSITORY", "")
DB_BACKUP_PATH_IN_REPO = "db_backup/quiz_bot_backup.db"

ADMIN_USERNAMES = {"Sunnatulla_Mamur_Korean", "Sunnatulla_Mamur"}

LEVEL_BEGINNER = "초급"
LEVEL_INTERMEDIATE = "중급"
LEVEL_ADVANCED = "고급"
QUIZ_MODE_AI = "ai"

LEVEL_ORDER = [LEVEL_BEGINNER, LEVEL_INTERMEDIATE, LEVEL_ADVANCED]
QUIZ_MODES = [LEVEL_BEGINNER, LEVEL_INTERMEDIATE, LEVEL_ADVANCED, QUIZ_MODE_AI]

# how many in-a-row are needed to change level
LEVEL_UP_CORRECT_STREAK = 20
LEVEL_DOWN_WRONG_STREAK = 3

# =======================
# WORD DATA
# =======================

# each entry: {
#   "id": int,
#   "korean": str,
#   "uzbek": str,
#   "english": str,
#   "options": [str, str, str],
#   "correct_index": int (0-based),
#   "level": LEVEL_*
# }
WORDS = []  # will be filled by _load_words()


def _load_words():
    global WORDS
    WORDS = []
    word_id = 1

    words_file_path = Path(WORDS_FILE)
    if not words_file_path.exists():
        raise FileNotFoundError(
            f"Words file '{WORDS_FILE}' not found. Please create it with words for each level."
        )

    with open(words_file_path, "r", encoding="utf-8") as f:
        words_data = json.load(f)

    for level in LEVEL_ORDER:
        if level not in words_data:
            logging.warning(f"No words found for level: {level}")
            continue

        level_words = words_data[level]
        if not level_words:
            logging.warning(f"Empty word list for level: {level}")
            continue

        # создаем список всех корейских слов этого уровня для генерации
        # неправильных вариантов
        all_korean_words = [w["korean"] for w in level_words]

        for word_data in level_words:
            korean = word_data["korean"]
            uzbek = word_data["uzbek"]
            english = word_data["english"]
            russian = word_data["russian"]

            # генерируем варианты ответов: правильный + 2 неправильных из того
            # же уровня
            wrong_candidates = [
                w for w in all_korean_words if w != korean
            ]
            random.shuffle(wrong_candidates)

            wrong1 = wrong_candidates[0] if wrong_candidates else korean
            wrong2 = wrong_candidates[1] if len(
                wrong_candidates) > 1 else korean

            options = [korean, wrong1, wrong2]
            random.shuffle(options)
            correct_index = options.index(korean)

            WORDS.append(
                {
                    "id": word_id,
                    "korean": korean,
                    "uzbek": uzbek,
                    "english": english,
                    "russian": russian,
                    "options": options,
                    "correct_index": correct_index,
                    "level": level,
                }
            )

            word_id += 1

    if not WORDS:
        raise RuntimeError(
            "No words loaded! Please add words to words.json file.")

    logging.info(
        f"Loaded {len(WORDS)} words: "
        f"{sum(1 for w in WORDS if w['level'] == LEVEL_BEGINNER)} 초급, "
        f"{sum(1 for w in WORDS if w['level'] == LEVEL_INTERMEDIATE)} 중급, "
        f"{sum(1 for w in WORDS if w['level'] == LEVEL_ADVANCED)} 고급"
    )


_load_words()

WORDS_BY_LEVEL = {
    level: [w for w in WORDS if w["level"] == level] for level in LEVEL_ORDER
}
WORDS_BY_ID = {w["id"]: w for w in WORDS}


# =======================
# KEYBOARDS
# =======================

# =======================
# KEYBOARDS
# =======================

from handlers.battle_handler import BATTLE_TEXT as BATTLE_MENU_TEXT

QUIZ_MENU_TEXT = "🔠퀴즈 · 연습🛡"

MAIN_MENU_KB = ReplyKeyboardMarkup(
    keyboard=[
        [
            KeyboardButton(text=QUIZ_MENU_TEXT),
            KeyboardButton(text=BATTLE_MENU_TEXT),
        ],
        [
            KeyboardButton(text="📊랭킹"),
            KeyboardButton(text="🎁추천"),
        ],
    ],
    resize_keyboard=True,
)


def build_quiz_level_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=" 🟢 초급", callback_data="quiz_lev:초급")],
            [InlineKeyboardButton(text=" 🟡 중급", callback_data="quiz_lev:중급")],
            [InlineKeyboardButton(text=" 🔴 고급", callback_data="quiz_lev:고급")],
            [InlineKeyboardButton(text=" 🤖 AI Quiz", callback_data="quiz_lev:ai")],
        ]
    )


def build_ranking_level_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [InlineKeyboardButton(text=" 🟢 초급 랭킹", callback_data="rank_lev:초급")],
            [InlineKeyboardButton(text=" 🟡 중급 랭킹", callback_data="rank_lev:중급")],
            [InlineKeyboardButton(text=" 🔴 고급 랭킹", callback_data="rank_lev:고급")],
            [InlineKeyboardButton(text=" 🤖 AI Quiz 랭킹", callback_data="rank_lev:ai")],
            [InlineKeyboardButton(text="TOP 10 🤴👸 in 1st Round", callback_data="rank_top10_1st")],
        ]
    )

# =======================
# DATABASE
# =======================


def _restore_db_from_backup_if_needed():
    """If DB_PATH does not exist but db_backup/quiz_bot_backup.db exists (e.g. in repo), copy it to DB_PATH (e.g. Volume)."""
    if Path(DB_PATH).exists():
        return
    backup_path = Path(DB_BACKUP_PATH_IN_REPO)
    if not backup_path.exists():
        return
    try:
        Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(backup_path, DB_PATH)
        logging.info("restored DB from %s to %s", backup_path, DB_PATH)
    except Exception as e:
        logging.warning("could not restore DB from backup: %s", e)


async def init_db():
    async with _db() as db:
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                user_id INTEGER PRIMARY KEY,
                username TEXT,
                first_name TEXT,
                total_score INTEGER NOT NULL DEFAULT 0,
                current_level TEXT NOT NULL,
                correct_streak INTEGER NOT NULL DEFAULT 0,
                wrong_streak INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        cur = await db.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in await cur.fetchall()]
        await cur.close()
        if "blocked_at" not in columns:
            await db.execute("ALTER TABLE users ADD COLUMN blocked_at TEXT")
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS answers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                word_id INTEGER NOT NULL,
                is_correct INTEGER NOT NULL,
                delta_score INTEGER NOT NULL,
                level TEXT NOT NULL,
                quiz_mode TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
            """
        )
        cur = await db.execute("PRAGMA table_info(answers)")
        answer_columns = [row[1] for row in await cur.fetchall()]
        await cur.close()
        if "quiz_mode" not in answer_columns:
            await db.execute("ALTER TABLE answers ADD COLUMN quiz_mode TEXT DEFAULT 'ai'")
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS user_level_scores (
                user_id INTEGER NOT NULL,
                quiz_mode TEXT NOT NULL,
                total_score INTEGER NOT NULL DEFAULT 0,
                PRIMARY KEY (user_id, quiz_mode),
                FOREIGN KEY (user_id) REFERENCES users(user_id)
            )
            """
        )
        await db.execute("PRAGMA journal_mode=WAL")
        # Cap WAL file growth; avoids huge -wal and reduces aggressive checkpointing
        # into the main .db file when third-party tools (or sqlite backup API) read the DB.
        await db.execute("PRAGMA journal_size_limit=67108864")
        await db.execute("PRAGMA busy_timeout=5000")
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS battles (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                initiator_id INTEGER NOT NULL,
                opponent_id INTEGER,
                is_ai_opponent INTEGER NOT NULL DEFAULT 0,
                level TEXT NOT NULL,
                status TEXT NOT NULL,
                initiator_score INTEGER NOT NULL DEFAULT 0,
                opponent_score INTEGER NOT NULL DEFAULT 0,
                current_turn TEXT NOT NULL,
                initiator_answers_cnt INTEGER NOT NULL DEFAULT 0,
                opponent_answers_cnt INTEGER NOT NULL DEFAULT 0,
                used_word_ids TEXT NOT NULL DEFAULT '[]',
                current_word_id INTEGER,
                forfeit_by INTEGER,
                created_at TEXT NOT NULL,
                finished_at TEXT,
                finish_notified_initiator INTEGER NOT NULL DEFAULT 0,
                finish_notified_opponent INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        cur = await db.execute("PRAGMA table_info(battles)")
        battle_columns = [row[1] for row in await cur.fetchall()]
        await cur.close()
        if "finish_notified_initiator" not in battle_columns:
            await db.execute(
                "ALTER TABLE battles ADD COLUMN finish_notified_initiator INTEGER NOT NULL DEFAULT 0"
            )
        if "finish_notified_opponent" not in battle_columns:
            await db.execute(
                "ALTER TABLE battles ADD COLUMN finish_notified_opponent INTEGER NOT NULL DEFAULT 0"
            )
        if "ai_opponent_display_name" not in battle_columns:
            await db.execute(
                "ALTER TABLE battles ADD COLUMN ai_opponent_display_name TEXT"
            )
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS battle_invites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                battle_id INTEGER NOT NULL,
                invited_user_id INTEGER,
                invite_token TEXT NOT NULL UNIQUE,
                invite_type TEXT NOT NULL,
                status TEXT NOT NULL,
                sent_at TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                FOREIGN KEY (battle_id) REFERENCES battles(id)
            )
            """
        )
        await db.execute(
            """
            CREATE TABLE IF NOT EXISTS battle_invite_messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                invite_id INTEGER NOT NULL,
                user_id INTEGER NOT NULL,
                chat_id INTEGER NOT NULL,
                message_id INTEGER NOT NULL,
                UNIQUE (invite_id, user_id),
                FOREIGN KEY (invite_id) REFERENCES battle_invites(id)
            )
            """
        )
        await db.commit()


async def get_or_create_user(
        user_id: int,
        username: str | None,
        first_name: str | None):
    now = datetime.now(timezone.utc).isoformat()
    async with _db() as db:
        cur = await db.execute(
            "SELECT user_id, current_level, total_score, correct_streak, wrong_streak "
            "FROM users WHERE user_id = ?",
            (user_id,),
        )
        row = await cur.fetchone()
        await cur.close()

        if row:
            return {
                "user_id": row[0],
                "current_level": row[1],
                "total_score": row[2],
                "correct_streak": row[3],
                "wrong_streak": row[4],
            }

        # default to beginner for new users
        await db.execute(
            """
            INSERT INTO users (
                user_id, username, first_name, total_score,
                current_level, correct_streak, wrong_streak,
                created_at, updated_at
            ) VALUES (?, ?, ?, 0, ?, 0, 0, ?, ?)
            """,
            (user_id, username, first_name, LEVEL_BEGINNER, now, now),
        )
        await db.commit()

        return {
            "user_id": user_id,
            "current_level": LEVEL_BEGINNER,
            "total_score": 0,
            "correct_streak": 0,
            "wrong_streak": 0,
        }


async def update_user_stats(
    user_id: int,
    total_score: int,
    current_level: str,
    correct_streak: int,
    wrong_streak: int,
):
    now = datetime.now(timezone.utc).isoformat()
    async with _db() as db:
        await db.execute(
            """
            UPDATE users
            SET total_score = ?,
                current_level = ?,
                correct_streak = ?,
                wrong_streak = ?,
                updated_at = ?
            WHERE user_id = ?
            """,
            (total_score, current_level, correct_streak, wrong_streak, now, user_id),
        )
        await db.commit()


async def mark_user_blocked(user_id: int) -> None:
    """Mark user as having blocked or deleted the bot (used when send fails)."""
    now = datetime.now(timezone.utc).isoformat()
    async with _db() as db:
        await db.execute(
            "UPDATE users SET blocked_at = ? WHERE user_id = ? AND (blocked_at IS NULL OR blocked_at = '')",
            (now, user_id),
        )
        await db.commit()


async def log_answer(
    user_id: int,
    word_id: int,
    is_correct: bool,
    delta_score: int,
    level: str,
    quiz_mode: str,
):
    now = datetime.now(timezone.utc).isoformat()
    async with _db() as db:
        await db.execute(
            """
            INSERT INTO answers (user_id, word_id, is_correct, delta_score, level, quiz_mode, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, word_id, int(is_correct), delta_score, level, quiz_mode, now),
        )
        await db.commit()


async def get_level_score(user_id: int, quiz_mode: str) -> int:
    async with _db() as db:
        cur = await db.execute(
            "SELECT total_score FROM user_level_scores WHERE user_id = ? AND quiz_mode = ?",
            (user_id, quiz_mode),
        )
        row = await cur.fetchone()
        await cur.close()
    return row[0] if row else 0


async def update_level_score(
        user_id: int,
        quiz_mode: str,
        delta_score: int) -> int:
    current = await get_level_score(user_id, quiz_mode)
    new_score = max(0, current + delta_score)
    async with _db() as db:
        await db.execute(
            """
            INSERT INTO user_level_scores (user_id, quiz_mode, total_score)
            VALUES (?, ?, ?)
            ON CONFLICT(user_id, quiz_mode) DO UPDATE SET total_score = excluded.total_score
            """,
            (user_id, quiz_mode, new_score),
        )
        await db.commit()
    return new_score


# =======================
# QUIZ / ADAPTIVE LOGIC
# =======================


def choose_word_for_level(level: str) -> dict:
    # choosing random word inside level keeps repetition low across sessions
    return random.choice(WORDS_BY_LEVEL[level])


def _pretty_korean_word(raw: str) -> str:
    # hide technical numeric suffixes like "안녕하세요 2" from the user
    parts = raw.rsplit(" ", 1)
    if len(parts) == 2 and parts[1].isdigit():
        return parts[0]
    return raw


def build_question_text(word: dict) -> str:
    return (
        "ℹ️ 알맞은 것을 고르십시오.\n"
        f"🇺🇿 {word['uzbek']} | 🇺🇸 {word['english']} | 🇷🇺 {word['russian']}"
    )


def build_options_keyboard(word: dict, quiz_mode: str) -> InlineKeyboardMarkup:
    buttons = []
    for idx, option in enumerate(word["options"]):
        callback_data = f"ans:{word['id']}:{idx}:{quiz_mode}"
        buttons.append(
            [
                InlineKeyboardButton(
                    text=f"{idx + 1}) {_pretty_korean_word(option)}",
                    callback_data=callback_data,
                )
            ]
        )
    return InlineKeyboardMarkup(inline_keyboard=buttons)


def get_next_level_on_streak(
        level: str,
        correct_streak: int,
        wrong_streak: int) -> str:
    idx = LEVEL_ORDER.index(level)
    new_level = level

    if correct_streak >= LEVEL_UP_CORRECT_STREAK and idx < len(
            LEVEL_ORDER) - 1:
        new_level = LEVEL_ORDER[idx + 1]
    elif wrong_streak >= LEVEL_DOWN_WRONG_STREAK and idx > 0:
        new_level = LEVEL_ORDER[idx - 1]

    return new_level


async def send_quiz_question(
        message: Message,
        user_state: dict,
        quiz_mode: str):
    if quiz_mode == QUIZ_MODE_AI:
        level = user_state["current_level"]
    else:
        level = quiz_mode
    word = choose_word_for_level(level)
    text = build_question_text(word)
    kb = build_options_keyboard(word, quiz_mode)
    await message.answer(text, reply_markup=kb)


# =======================
# RATING LOGIC
# =======================


async def get_all_time_top10_by_mode(quiz_mode: str):
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT s.user_id, COALESCE(u.username, ''), COALESCE(u.first_name, ''), s.total_score
            FROM user_level_scores s
            JOIN users u ON u.user_id = s.user_id
            WHERE s.quiz_mode = ?
            ORDER BY s.total_score DESC, s.user_id ASC
            LIMIT 10
            """,
            (quiz_mode,),
        )
        rows = await cur.fetchall()
        await cur.close()
    return rows


async def get_today_top10_by_mode(quiz_mode: str):
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT a.user_id,
                   COALESCE(u.username, ''),
                   COALESCE(u.first_name, ''),
                   SUM(a.delta_score) AS raw_score
            FROM answers a
            JOIN users u ON u.user_id = a.user_id
            WHERE DATE(a.created_at) = DATE('now') AND a.quiz_mode = ?
            GROUP BY a.user_id
            ORDER BY raw_score DESC, a.user_id ASC
            LIMIT 10
            """,
            (quiz_mode,),
        )
        rows = await cur.fetchall()
        await cur.close()
    result = []
    for uid, username, first_name, raw in rows:
        today_score = max(0, raw) if raw is not None else 0
        result.append((uid, username, first_name, today_score))
    return result


async def get_user_rank_by_mode(user_id: int, quiz_mode: str):
    score = await get_level_score(user_id, quiz_mode)
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT COUNT(*) FROM user_level_scores
            WHERE quiz_mode = ? AND total_score > ?
            """,
            (quiz_mode, score),
        )
        higher_count = (await cur.fetchone())[0]
        await cur.close()
        cur = await db.execute(
            "SELECT COUNT(*) FROM user_level_scores WHERE quiz_mode = ?",
            (quiz_mode,),
        )
        total_users = (await cur.fetchone())[0]
        await cur.close()
    rank = higher_count + 1
    return rank, total_users, score


def _rank_medal_all_time(idx: int) -> str:
    if idx == 1:
        return "👑"
    if idx == 2:
        return "🥇"
    if idx == 3:
        return "🥈"
    if idx == 4:
        return "🥉"
    return ""


def _rank_medal_today(idx: int) -> str:
    if idx == 1:
        return "🥇"
    if idx == 2:
        return "🥈"
    if idx == 3:
        return "🥉"
    return ""


def _quiz_mode_label(quiz_mode: str) -> str:
    return "AI Quiz" if quiz_mode == QUIZ_MODE_AI else quiz_mode


def _quiz_mode_emoji_label(quiz_mode: str) -> str:
    if quiz_mode == LEVEL_BEGINNER:
        return "🟢초급"
    if quiz_mode == LEVEL_INTERMEDIATE:
        return "🟡중급"
    if quiz_mode == LEVEL_ADVANCED:
        return "🔴고급"
    return "🤖AI Quiz"


async def get_battle_all_time_top10_by_level(level: str):
    async with _db() as db:
        cur = await db.execute(
            """
            WITH scores AS (
              SELECT initiator_id AS user_id, initiator_score AS score
              FROM battles
              WHERE level = ?
                AND status IN ('finished', 'forfeit')
              UNION ALL
              SELECT opponent_id AS user_id, opponent_score AS score
              FROM battles
              WHERE level = ?
                AND status IN ('finished', 'forfeit')
                AND opponent_id IS NOT NULL
            )
            SELECT s.user_id,
                   COALESCE(u.username, ''),
                   COALESCE(u.first_name, ''),
                   SUM(s.score) AS total_score
            FROM scores s
            JOIN users u ON u.user_id = s.user_id
            GROUP BY s.user_id
            ORDER BY total_score DESC, s.user_id ASC
            LIMIT 10
            """,
            (level, level),
        )
        rows = await cur.fetchall()
        await cur.close()
    result = []
    for uid, username, first_name, total in rows:
        result.append((uid, username, first_name, int(total or 0)))
    return result


async def get_battle_today_top10_by_level(level: str):
    async with _db() as db:
        cur = await db.execute(
            """
            WITH scores AS (
              SELECT initiator_id AS user_id, initiator_score AS score, finished_at AS ts
              FROM battles
              WHERE level = ?
                AND status IN ('finished', 'forfeit')
                AND finished_at IS NOT NULL
              UNION ALL
              SELECT opponent_id AS user_id, opponent_score AS score, finished_at AS ts
              FROM battles
              WHERE level = ?
                AND status IN ('finished', 'forfeit')
                AND finished_at IS NOT NULL
                AND opponent_id IS NOT NULL
            )
            SELECT s.user_id,
                   COALESCE(u.username, ''),
                   COALESCE(u.first_name, ''),
                   SUM(s.score) AS total_score
            FROM scores s
            JOIN users u ON u.user_id = s.user_id
            WHERE DATE(s.ts) = DATE('now')
            GROUP BY s.user_id
            ORDER BY total_score DESC, s.user_id ASC
            LIMIT 10
            """,
            (level, level),
        )
        rows = await cur.fetchall()
        await cur.close()
    result = []
    for uid, username, first_name, total in rows:
        result.append((uid, username, first_name, int(total or 0)))
    return result


async def get_ai_battle_all_time_top10():
    """
    AI battle ranking for AI Quiz: count only wins vs AI.
    Uses battles table directly (no duplication into answers/user_level_scores).
    """
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT b.initiator_id AS user_id,
                   COALESCE(u.username, ''),
                   COALESCE(u.first_name, ''),
                   SUM(b.initiator_score) AS total_score
            FROM battles b
            JOIN users u ON u.user_id = b.initiator_id
            WHERE b.is_ai_opponent = 1
              AND b.status IN ('finished', 'forfeit')
              AND b.initiator_score > COALESCE(b.opponent_score, 0)
            GROUP BY b.initiator_id
            ORDER BY total_score DESC, b.initiator_id ASC
            LIMIT 10
            """
        )
        rows = await cur.fetchall()
        await cur.close()
    return [(uid, username, first_name, int(total or 0)) for uid, username, first_name, total in rows]


async def get_ai_battle_today_top10():
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT b.initiator_id AS user_id,
                   COALESCE(u.username, ''),
                   COALESCE(u.first_name, ''),
                   SUM(b.initiator_score) AS total_score
            FROM battles b
            JOIN users u ON u.user_id = b.initiator_id
            WHERE b.is_ai_opponent = 1
              AND b.status IN ('finished', 'forfeit')
              AND b.finished_at IS NOT NULL
              AND DATE(b.finished_at) = DATE('now')
              AND b.initiator_score > COALESCE(b.opponent_score, 0)
            GROUP BY b.initiator_id
            ORDER BY total_score DESC, b.initiator_id ASC
            LIMIT 10
            """
        )
        rows = await cur.fetchall()
        await cur.close()
    return [(uid, username, first_name, int(total or 0)) for uid, username, first_name, total in rows]


async def format_rating_text_by_mode(user_id: int, quiz_mode: str) -> str:
    label = _quiz_mode_label(quiz_mode)

    practice_all = await get_all_time_top10_by_mode(quiz_mode)
    practice_today = await get_today_top10_by_mode(quiz_mode)

    battle_all = []
    battle_today = []
    if quiz_mode == QUIZ_MODE_AI:
        battle_all = await get_ai_battle_all_time_top10()
        battle_today = await get_ai_battle_today_top10()
    elif quiz_mode in (LEVEL_BEGINNER, LEVEL_INTERMEDIATE, LEVEL_ADVANCED):
        battle_all = await get_battle_all_time_top10_by_level(quiz_mode)
        battle_today = await get_battle_today_top10_by_level(quiz_mode)

    def _fmt_block(title: str, rows: list[tuple]) -> list[str]:
        out: list[str] = [title]
        if not rows:
            out.append("(아직 사용자가 없습니다)")
            return out
        for idx, (uid, username, first_name, score) in enumerate(rows, start=1):
            name = (username or first_name or str(uid)).strip()
            medal = _rank_medal_all_time(idx)
            out.append(f"{medal}{idx}. {name} — {int(score or 0)}💎")
        return out

    lines: list[str] = []
    lines.append(f"🏆 랭킹 — {label}")
    lines.append("")

    lines += _fmt_block("🔠퀴즈 · 연습🛡 전체 TOP 10:", practice_all)
    lines.append("")
    lines += _fmt_block("🔠퀴즈 · 연습🛡 오늘 TOP 10:", practice_today)
    lines.append("")
    lines += _fmt_block("⚔️퀴즈 · 배틀🛡 전체 TOP 10:", battle_all)
    lines.append("")
    lines += _fmt_block("⚔️퀴즈 · 배틀🛡 오늘 TOP 10:", battle_today)

    return "\n".join(lines)


# =======================
# ADMIN FUNCTIONS
# =======================


def is_admin(username: str | None) -> bool:
    return username in ADMIN_USERNAMES


async def get_bot_statistics():
    async with _db() as db:
        # total users
        cur = await db.execute("SELECT COUNT(*) FROM users")
        total_users = (await cur.fetchone())[0]
        await cur.close()

        # active users today
        cur = await db.execute(
            """
            SELECT COUNT(DISTINCT user_id)
            FROM answers
            WHERE DATE(created_at) = DATE('now')
            """
        )
        active_today = (await cur.fetchone())[0]
        await cur.close()

        # total answers
        cur = await db.execute("SELECT COUNT(*) FROM answers")
        total_answers = (await cur.fetchone())[0]
        await cur.close()

        # correct answers percentage
        cur = await db.execute(
            "SELECT COUNT(*) FROM answers WHERE is_correct = 1"
        )
        correct_answers = (await cur.fetchone())[0]
        await cur.close()
        correct_percentage = (
            round((correct_answers / total_answers * 100), 2)
            if total_answers > 0
            else 0
        )

        # users by level
        cur = await db.execute(
            """
            SELECT current_level, COUNT(*) as count
            FROM users
            GROUP BY current_level
            """
        )
        level_stats = await cur.fetchall()
        await cur.close()

        # new users today
        cur = await db.execute(
            """
            SELECT COUNT(*)
            FROM users
            WHERE DATE(created_at) = DATE('now')
            """
        )
        new_users_today = (await cur.fetchone())[0]
        await cur.close()

        # total score sum
        cur = await db.execute("SELECT SUM(total_score) FROM users")
        total_score_sum = (await cur.fetchone())[0] or 0
        await cur.close()

        # users who blocked or deleted the bot (discovered e.g. when broadcast
        # fails)
        cur = await db.execute(
            "SELECT COUNT(*) FROM users WHERE blocked_at IS NOT NULL AND blocked_at != ''"
        )
        blocked_count = (await cur.fetchone())[0]
        await cur.close()

    return {
        "total_users": total_users,
        "active_today": active_today,
        "new_users_today": new_users_today,
        "total_answers": total_answers,
        "correct_answers": correct_answers,
        "correct_percentage": correct_percentage,
        "level_stats": level_stats,
        "total_score_sum": total_score_sum,
        "blocked_count": blocked_count,
        "active_available": total_users - blocked_count,
    }


async def format_statistics_text() -> str:
    stats = await get_bot_statistics()
    lines: list[str] = []

    lines.append("📊 통계")
    lines.append("")
    lines.append(f"👥 총 사용자: {stats['total_users']}명")
    lines.append(f"✅ 사용 가능 (봇 미차단): {stats['active_available']}명")
    lines.append(f"🚫 차단/삭제 (봇 차단·삭제): {stats['blocked_count']}명")
    lines.append(f"🆕 오늘 가입: {stats['new_users_today']}명")
    lines.append(f"📌 오늘 활동: {stats['active_today']}명")
    lines.append("")
    lines.append(f"📝 총 답변: {stats['total_answers']}개")
    lines.append(
        f"✓ 정답률: {stats['correct_percentage']}% ({stats['correct_answers']}/{stats['total_answers']})"
    )
    lines.append("")
    lines.append("📈 레벨별 사용자:")
    level_map = {
        LEVEL_BEGINNER: "초급",
        LEVEL_INTERMEDIATE: "중급",
        LEVEL_ADVANCED: "고급",
    }
    for level, count in stats["level_stats"]:
        level_name = level_map.get(level, level)
        lines.append(f"  • {level_name}: {count}명")
    lines.append("")
    lines.append(f"🏆 총 점수 합계: {stats['total_score_sum']}점")

    return "\n".join(lines)


async def get_all_user_ids():
    async with _db() as db:
        cur = await db.execute("SELECT user_id FROM users")
        rows = await cur.fetchall()
        await cur.close()
    return [row[0] for row in rows]


async def get_all_users_detailed():
    """Fetch all users with aggregated stats from answers (total_answers, correct_answers, last_activity)."""
    async with _db() as db:
        cur = await db.execute(
            """
            SELECT
                u.user_id,
                u.username,
                u.first_name,
                u.total_score,
                u.current_level,
                u.correct_streak,
                u.wrong_streak,
                u.created_at,
                u.updated_at,
                COALESCE(agg.total_answers, 0) AS total_answers,
                COALESCE(agg.correct_answers, 0) AS correct_answers,
                agg.last_activity
            FROM users u
            LEFT JOIN (
                SELECT
                    user_id,
                    COUNT(*) AS total_answers,
                    SUM(is_correct) AS correct_answers,
                    MAX(created_at) AS last_activity
                FROM answers
                GROUP BY user_id
            ) agg ON u.user_id = agg.user_id
            ORDER BY u.created_at ASC
            """
        )
        rows = await cur.fetchall()
        await cur.close()

    columns = [
        "user_id", "username", "first_name", "total_score", "current_level",
        "correct_streak", "wrong_streak", "created_at", "updated_at",
        "total_answers", "correct_answers", "last_activity",
    ]
    return [dict(zip(columns, row)) for row in rows]


def _export_users_csv(rows: list[dict], filepath: Path) -> None:
    if not rows:
        return
    with open(filepath, "w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=rows[0].keys())
        writer.writeheader()
        writer.writerows(rows)


def _export_users_excel(rows: list[dict], filepath: Path) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = "Users"
    if not rows:
        wb.save(filepath)
        return
    headers = list(rows[0].keys())
    ws.append(headers)
    for r in rows:
        ws.append([r.get(h, "") for h in headers])
    wb.save(filepath)


def _create_db_backup_sync() -> bytes | None:
    """Create a compact backup of quiz_bot.db (SQLite). Returns file bytes or None if not possible.

    Uses VACUUM INTO when available (SQLite >= 3.27) so the snapshot is repacked and does not
    preserve unused free pages. Avoids sqlite3.Connection.backup(), which often triggers WAL
    checkpoints and can inflate the live main database file on each backup.
    """
    if not Path(DB_PATH).exists():
        return None
    src = None
    path = None
    try:
        fd, path = tempfile.mkstemp(suffix=".db")
        os.close(fd)
        Path(path).unlink(missing_ok=True)

        src = sqlite3.connect(DB_PATH, timeout=30.0)
        src.execute("PRAGMA busy_timeout=10000")

        used_vacuum = False
        if sqlite3.sqlite_version_info >= (3, 27, 0):
            try:
                out_sql = Path(path).resolve().as_posix().replace("'", "''")
                src.execute(f"VACUUM main INTO '{out_sql}'")
                used_vacuum = True
            except sqlite3.Error:
                Path(path).unlink(missing_ok=True)
                used_vacuum = False

        if not used_vacuum:
            dst = sqlite3.connect(path)
            try:
                src.backup(dst)
            finally:
                dst.close()

        with open(path, "rb") as f:
            return f.read()
    except Exception as e:
        logging.warning("db backup creation failed: %s", e)
        return None
    finally:
        if src:
            try:
                src.close()
            except Exception:
                pass
        if path and Path(path).exists():
            Path(path).unlink(missing_ok=True)


async def export_database_backup() -> bytes | None:
    """Create backup of the database; returns quiz_bot.db file bytes or None."""
    return await asyncio.to_thread(_create_db_backup_sync)


def _push_backup_to_github_sync(backup_bytes: bytes) -> bool:
    """Clone repo, write backup file, commit and push. Returns True on success."""
    if not GITHUB_TOKEN or not GITHUB_REPOSITORY:
        return False
    repo_url = f"https://x-access-token:{GITHUB_TOKEN}@github.com/{GITHUB_REPOSITORY}.git"
    tmpdir = None
    try:
        tmpdir = tempfile.mkdtemp(prefix="quiz_backup_")
        env = os.environ.copy()
        env["GIT_TERMINAL_PROMPT"] = "0"
        result = subprocess.run(
            ["git", "clone", "--depth", "1", repo_url, "."],
            cwd=tmpdir,
            capture_output=True,
            text=True,
            timeout=60,
            env=env,
        )
        if result.returncode != 0:
            logging.warning("db backup: git clone failed: %s", result.stderr or result.stdout)
            return False
        backup_file = Path(tmpdir) / DB_BACKUP_PATH_IN_REPO
        backup_file.parent.mkdir(parents=True, exist_ok=True)
        backup_file.write_bytes(backup_bytes)
        subprocess.run(
            ["git", "config", "user.email", "backup@quizbot.local"],
            cwd=tmpdir,
            capture_output=True,
            check=False,
        )
        subprocess.run(
            ["git", "config", "user.name", "Quiz Bot Backup"],
            cwd=tmpdir,
            capture_output=True,
            check=False,
        )
        subprocess.run(["git", "add", DB_BACKUP_PATH_IN_REPO], cwd=tmpdir, capture_output=True, check=False)
        result = subprocess.run(
            ["git", "commit", "-m", f"db backup {datetime.now(timezone.utc).isoformat()}Z"],
            cwd=tmpdir,
            capture_output=True,
            text=True,
            timeout=10,
        )
        if result.returncode != 0 and "nothing to commit" not in (result.stdout or "") and "nothing to commit" not in (result.stderr or ""):
            logging.warning("db backup: git commit failed: %s", result.stderr or result.stdout)
        result = subprocess.run(
            ["git", "push", "origin", "main"],
            cwd=tmpdir,
            capture_output=True,
            text=True,
            timeout=30,
        )
        if result.returncode != 0:
            logging.warning("db backup: git push failed: %s", result.stderr or result.stdout)
            return False
        logging.info("db backup: pushed to GitHub successfully")
        return True
    except subprocess.TimeoutExpired:
        logging.warning("db backup: git command timed out")
        return False
    except Exception as e:
        logging.warning("db backup: %s", e)
        return False
    finally:
        if tmpdir and Path(tmpdir).exists():
            shutil.rmtree(tmpdir, ignore_errors=True)


async def _backup_loop():
    """Every BACKUP_INTERVAL_SEC create DB backup and push to GitHub."""
    if not GITHUB_TOKEN or not GITHUB_REPOSITORY:
        logging.info("db backup: GITHUB_TOKEN or GITHUB_REPOSITORY not set, backup to repo disabled")
        return
    if not shutil.which("git"):
        logging.info("db backup: git not installed (e.g. on Railway), backup to GitHub disabled")
        return
    await asyncio.sleep(60)
    while True:
        try:
            data = await asyncio.to_thread(_create_db_backup_sync)
            if data:
                await asyncio.to_thread(_push_backup_to_github_sync, data)
        except Exception as e:
            logging.warning("db backup loop: %s", e)
        await asyncio.sleep(BACKUP_INTERVAL_SEC)


def build_admin_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📊 통계 보기", callback_data="admin:stats"
                )
            ],
            [
                InlineKeyboardButton(
                    text="📢 모든 사용자에게 메시지 보내기",
                    callback_data="admin:broadcast",
                )
            ],
            [
                InlineKeyboardButton(
                    text="📥 Export users (Excel/CSV)",
                    callback_data="admin:export",
                )
            ],
            [
                InlineKeyboardButton(
                    text="📦 Export database (quiz_bot.db)",
                    callback_data="admin:export_db",
                )
            ],
        ]
    )


def build_export_format_keyboard() -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="📗 Excel (.xlsx)", callback_data="admin:export_excel"
                ),
                InlineKeyboardButton(
                    text="📄 CSV", callback_data="admin:export_csv"
                ),
            ],
            [
                InlineKeyboardButton(
                    text="◀️ Back", callback_data="admin:export_back"
                )
            ],
        ]
    )


# =======================
# BOT HANDLERS
# =======================

dp = Dispatcher()

# состояние для рассылки: хранит user_id админов, которые находятся в
# режиме рассылки
broadcast_mode: Set[int] = set()
# хранит сообщения, ожидающие подтверждения: user_id -> broadcast_data
# broadcast_data = {
#     "text": str,
#     "content_type": str,
#     "message": Message
# }
pending_broadcasts: dict[int, dict] = {}


@dp.message(CommandStart())
async def cmd_start(message: Message):
    from handlers.battle_handler import process_battle_deep_link
    from services.battle_invite import parse_start_battle_arg

    user = await get_or_create_user(
        user_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    start_arg = ""
    if message.text and " " in message.text:
        start_arg = message.text.split(maxsplit=1)[1].strip()
    battle_token = parse_start_battle_arg(start_arg)
    if battle_token:
        if await process_battle_deep_link(message, battle_token):
            return

    level_ko = user["current_level"]
    level_map_uz = {
        LEVEL_BEGINNER: "Boshlang‘ich",
        LEVEL_INTERMEDIATE: "O‘rta",
        LEVEL_ADVANCED: "Yuqori",
    }
    level_map_ru = {
        LEVEL_BEGINNER: "Начальный",
        LEVEL_INTERMEDIATE: "Средний",
        LEVEL_ADVANCED: "Продвинутый",
    }
    level_map_en = {
        LEVEL_BEGINNER: "Beginner",
        LEVEL_INTERMEDIATE: "Intermediate",
        LEVEL_ADVANCED: "Advanced",
    }

    level_uz = level_map_uz.get(level_ko, level_ko)
    level_ru = level_map_ru.get(level_ko, level_ko)
    level_en = level_map_en.get(level_ko, level_ko)
    score = user["total_score"]

    welcome = [
        "🇰🇷안녕하세요!",
        "",
        "이 봇은 적응형 한국어 단어 퀴즈 봇입니다.",
        "",
        f"현재 레벨: {level_ko}",
        f"총 점수: {score}",
        "",
        "아래 메뉴에서 기능을 선택하세요.",
        "",
        "🇺🇿Assalomu alaykum!",
        "",
        "Bu bot moslashuvchan koreys tili so‘z viktorinasi botidir.",
        "",
        f"Joriy daraja: {level_uz}",
        f"Umumiy ball: {score}",
        "",
        "Quyidagi menyudan kerakli funksiyani tanlang.",
        "",
        "🇷🇺 Здравствуйте!",
        "",
        "Этот бот — адаптивный квиз-бот для изучения корейских слов.",
        "",
        f"Текущий уровень: {level_ru}",
        f"Общий счёт: {score}",
        "",
        "Пожалуйста, выберите нужную функцию в меню ниже.",
        "",
        "🇺🇸 Hello!",
        "",
        "This bot is an adaptive Korean vocabulary quiz bot.",
        "",
        f"Current level: {level_en}",
        f"Total score: {score}",
        "",
        "Please select a feature from the menu below.",
    ]
    await message.answer("\n".join(welcome), reply_markup=MAIN_MENU_KB)


@dp.message(F.text.in_({QUIZ_MENU_TEXT, "🔠퀴즈"}))
async def handle_quiz(message: Message):
    await get_or_create_user(
        user_id=message.from_user.id,
        username=message.from_user.username,
        first_name=message.from_user.first_name,
    )
    text = "🇰🇷 퀴즈 레벨을 선택하세요 🔠\n"

    text += "\n 🇬🇧 Choose quiz level 🔠\n"

    text += "\n 🇷🇺 Выберите уровень викторины 🔠\n"

    text += "\n 🇺🇿 Viktorina darajasini tanlang 🔠\n"

    await message.answer(text, reply_markup=build_quiz_level_keyboard())


@dp.callback_query(F.data.startswith("quiz_lev:"))
async def handle_quiz_level_selected(callback: CallbackQuery):
    quiz_mode = callback.data.replace("quiz_lev:", "", 1)
    if quiz_mode not in QUIZ_MODES:
        await callback.answer("잘못된 선택입니다.", show_alert=True)
        return
    await callback.answer()
    user = await get_or_create_user(
        user_id=callback.from_user.id,
        username=callback.from_user.username,
        first_name=callback.from_user.first_name,
    )
    try:
        await callback.message.edit_reply_markup(reply_markup=None)
    except Exception:
        pass
    user_state = {
        "user_id": user["user_id"],
        "current_level": user["current_level"],
        "total_score": user["total_score"],
        "correct_streak": user["correct_streak"],
        "wrong_streak": user["wrong_streak"],
    }
    await send_quiz_question(callback.message, user_state, quiz_mode)


@dp.message(F.text == "📊랭킹")
async def handle_rating(message: Message):
    text = "🇰🇷 랭킹 레벨을 선택하세요 📊\n"

    text += "\n 🇬🇧 Choose ranking level 📊\n"

    text += "\n 🇷🇺 Выберите уровень рейтинга 📊\n"

    text += "\n 🇺🇿 Reyting darajasini tanlang 📊\n"

    await message.answer(text, reply_markup=build_ranking_level_keyboard())


TOP10_1ST_ROUND_TEXT = (
    "«TOP 10 🤴👸Leaders of 1st Round Quiz on Korea»\n\n"
    "1. 👑 DarkLogic_ax — 23 887💎\n"
    "2. 🥇 . — 10 222💎\n"
    "3. 🥈Meha_20 — 2 193💎\n"
    "4. 🥉mrmohirbek — 1 902💎\n\n"
    " 5.  💐 Saidmuhammad — 1 800💎\n"
    " 6.  💐 Hasan_Xudoyqulov — 1 731💎\n"
    " 7.  💐 usmonaliyev_17 — 1 570💎\n"
    " 8.  💐 erkknnv — 1 419💎\n"
    " 9.  💐 mariagedamour — 1 230💎\n"
    " 10. 💐 Javohir197 — 1 102💎\n\n"
    "🇰🇷Quiz on Korea:\n"
    "@Sunnatulla_Quiz_bot"
)


@dp.callback_query(F.data == "rank_top10_1st")
async def handle_top10_1st_round(callback: CallbackQuery):
    await callback.answer()
    try:
        await callback.message.edit_text(TOP10_1ST_ROUND_TEXT)
    except Exception:
        await callback.message.answer(TOP10_1ST_ROUND_TEXT, reply_markup=MAIN_MENU_KB)


@dp.callback_query(F.data.startswith("rank_lev:"))
async def handle_ranking_level_selected(callback: CallbackQuery):
    quiz_mode = callback.data.replace("rank_lev:", "", 1)
    if quiz_mode not in QUIZ_MODES:
        await callback.answer("잘못된 선택입니다.", show_alert=True)
        return
    await callback.answer()
    text = await format_rating_text_by_mode(callback.from_user.id, quiz_mode)
    try:
        await callback.message.edit_text(text)
    except Exception:
        await callback.message.answer(text, reply_markup=MAIN_MENU_KB)


@dp.message(F.text == "🎁추천")
async def handle_recommend(message: Message):
    text = (
        "📚 🇰🇷 무료 도서관 \n"
        "👉 https://t.me/SunnatullaMamur_Bot\n\n"

        "📚 🇬🇧 Free Library \n"
        "👉 https://t.me/SunnatullaMamur_Bot\n\n"

        "📚 🇺🇿 Bepul Kutubxona \n"
        "👉 https://t.me/SunnatullaMamur_Bot\n\n"

        "📚 🇷🇺 Бесплатная библиотека \n"
        "👉 https://t.me/SunnatullaMamur_Bot\n"
    )
    await message.answer(text, reply_markup=MAIN_MENU_KB)


@dp.message(Command("admin"))
async def cmd_admin(message: Message):
    if not is_admin(message.from_user.username):
        await message.answer("❌ 권한이 없습니다.")
        return

    text = "🔐 관리자 패널\n\n아래 메뉴에서 기능을 선택하세요."
    kb = build_admin_keyboard()
    await message.answer(text, reply_markup=kb)


@dp.callback_query(F.data == "admin:stats")
async def handle_admin_stats(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    text = await format_statistics_text()
    kb = build_admin_keyboard()
    await callback.message.edit_text(text, reply_markup=kb)
    await callback.answer()


@dp.callback_query(F.data == "admin:export")
async def handle_admin_export(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    text = (
        "📥 Export users database\n\n"
        "Select format. File will contain: user_id, username, first_name, "
        "total_score, current_level, correct_streak, wrong_streak, "
        "created_at, updated_at, total_answers, correct_answers, last_activity.")
    await callback.message.edit_text(text, reply_markup=build_export_format_keyboard())
    await callback.answer()


@dp.callback_query(F.data == "admin:export_back")
async def handle_admin_export_back(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    text = "🔐 관리자 패널\n\n아래 메뉴에서 기능을 선택하세요."
    await callback.message.edit_text(text, reply_markup=build_admin_keyboard())
    await callback.answer()


@dp.callback_query(F.data == "admin:export_excel")
async def handle_admin_export_excel(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    await callback.answer("Generating Excel file...")
    await callback.message.edit_text("⏳ Generating Excel file...")

    try:
        rows = await get_all_users_detailed()
        if not rows:
            await callback.message.edit_text(
                "No users to export.",
                reply_markup=build_admin_keyboard(),
            )
            return

        fd, path_str = tempfile.mkstemp(suffix=".xlsx")
        try:
            os.close(fd)
        except Exception:
            pass
        path = Path(path_str)
        _export_users_excel(rows, path)
        try:
            with open(path, "rb") as f:
                await callback.bot.send_document(
                    chat_id=callback.from_user.id,
                    document=BufferedInputFile(f.read(), filename="users_export.xlsx"),
                )
        finally:
            path.unlink(missing_ok=True)

        text = f"✅ Export complete. Sent Excel file with {len(rows)} users."
        await callback.message.edit_text(text, reply_markup=build_admin_keyboard())
    except Exception as e:
        logging.exception("Export Excel failed")
        await callback.message.edit_text(
            f"❌ Export failed: {e}",
            reply_markup=build_admin_keyboard(),
        )


@dp.callback_query(F.data == "admin:export_csv")
async def handle_admin_export_csv(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    await callback.answer("Generating CSV file...")
    await callback.message.edit_text("⏳ Generating CSV file...")

    try:
        rows = await get_all_users_detailed()
        if not rows:
            await callback.message.edit_text(
                "No users to export.",
                reply_markup=build_admin_keyboard(),
            )
            return

        fd, path_str = tempfile.mkstemp(suffix=".csv")
        try:
            os.close(fd)
        except Exception:
            pass
        path = Path(path_str)
        _export_users_csv(rows, path)
        try:
            with open(path, "rb") as f:
                await callback.bot.send_document(
                    chat_id=callback.from_user.id,
                    document=BufferedInputFile(f.read(), filename="users_export.csv"),
                )
        finally:
            path.unlink(missing_ok=True)

        text = f"✅ Export complete. Sent CSV file with {len(rows)} users."
        await callback.message.edit_text(text, reply_markup=build_admin_keyboard())
    except Exception as e:
        logging.exception("Export CSV failed")
        await callback.message.edit_text(
            f"❌ Export failed: {e}",
            reply_markup=build_admin_keyboard(),
        )


@dp.callback_query(F.data == "admin:export_db")
async def handle_admin_export_db(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    await callback.answer("Preparing database backup...")
    await callback.message.edit_text("⏳ Creating backup (quiz_bot.db)...")

    try:
        data = await export_database_backup()
        if not data:
            await callback.message.edit_text(
                "❌ Backup failed: database file not found or could not be read.\n\n"
                "On Railway: set DB_PATH (e.g. /data/quiz_bot.db) and add a Volume with mount path /data.",
                reply_markup=build_admin_keyboard(),
            )
            return

        await callback.bot.send_document(
            chat_id=callback.from_user.id,
            document=BufferedInputFile(data, filename="quiz_bot.db"),
        )
        await callback.message.edit_text(
            "✅ Backup sent. Save the file quiz_bot.db to restore later.",
            reply_markup=build_admin_keyboard(),
        )
    except Exception as e:
        logging.exception("Export database failed")
        await callback.message.edit_text(
            f"❌ Export failed: {e}",
            reply_markup=build_admin_keyboard(),
        )


@dp.callback_query(F.data == "admin:broadcast")
async def handle_admin_broadcast_start(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    broadcast_mode.add(callback.from_user.id)
    text = (
        "📢 모든 사용자에게 메시지 보내기\n\n"
        "보낼 메시지를 입력하세요.\n\n"
        "💡 팁: 메시지에 텍스트, эмодзи, ссылки 등을 포함할 수 있습니다.\n\n"
        "취소하려면 /cancel을 입력하세요."
    )
    await callback.message.edit_text(text)
    await callback.answer()


@dp.callback_query(F.data.startswith("admin:broadcast_confirm:"))
async def handle_admin_broadcast_confirm(callback: CallbackQuery):
    if not is_admin(callback.from_user.username):
        await callback.answer("❌ 권한이 없습니다.", show_alert=True)
        return

    action = callback.data.split(":")[-1]

    if action == "yes":
        broadcast_data = pending_broadcasts.get(callback.from_user.id)
        if not broadcast_data:
            await callback.answer("❌ 메시지를 찾을 수 없습니다.", show_alert=True)
            broadcast_mode.discard(callback.from_user.id)
            pending_broadcasts.pop(callback.from_user.id, None)
            return

        await callback.message.edit_text("⏳ 메시지를 보내는 중...")
        await callback.answer()

        await send_broadcast(callback.bot, callback.from_user.id, broadcast_data)
        broadcast_mode.discard(callback.from_user.id)
        pending_broadcasts.pop(callback.from_user.id, None)
    else:
        broadcast_mode.discard(callback.from_user.id)
        pending_broadcasts.pop(callback.from_user.id, None)
        text = "❌ 취소되었습니다."
        kb = build_admin_keyboard()
        await callback.message.edit_text(text, reply_markup=kb)
        await callback.answer("취소되었습니다.")


async def send_broadcast(bot: Bot, admin_id: int, broadcast_data: dict):
    user_ids = await get_all_user_ids()
    total = len(user_ids)
    success = 0
    failed = 0

    status_message = await bot.send_message(
        admin_id,
        f"📤 메시지 전송 중...\n\n전체: {total}명\n성공: {success}명\n실패: {failed}명"
    )

    message_text = broadcast_data.get("text", "")
    content_type = broadcast_data.get("content_type", "text")
    original_message = broadcast_data.get("message")

    for idx, user_id in enumerate(user_ids, 1):
        try:
            if content_type == "text":
                await bot.send_message(user_id, message_text)
            elif content_type == "photo" and original_message:
                await bot.send_photo(
                    user_id,
                    photo=original_message.photo[-1].file_id,
                    caption=message_text if message_text else None
                )
            elif content_type == "video" and original_message:
                await bot.send_video(
                    user_id,
                    video=original_message.video.file_id,
                    caption=message_text if message_text else None
                )
            elif content_type == "document" and original_message:
                await bot.send_document(
                    user_id,
                    document=original_message.document.file_id,
                    caption=message_text if message_text else None
                )
            elif content_type == "audio" and original_message:
                await bot.send_audio(
                    user_id,
                    audio=original_message.audio.file_id,
                    caption=message_text if message_text else None
                )
            elif content_type == "voice" and original_message:
                await bot.send_voice(
                    user_id,
                    voice=original_message.voice.file_id,
                    caption=message_text if message_text else None
                )
            else:
                # fallback to text
                if message_text:
                    await bot.send_message(user_id, message_text)

            success += 1
        except Exception as e:
            failed += 1
            error_msg = str(e)
            if (
                "blocked" in error_msg.lower()
                or "chat not found" in error_msg.lower()
                or "user is deactivated" in error_msg.lower()
            ):
                await mark_user_blocked(user_id)
            else:
                logging.warning(f"Failed to send message to {user_id}: {e}")

        # обновляем статус каждые 10 сообщений или в конце
        if idx % 10 == 0 or idx == total:
            try:
                await status_message.edit_text(
                    f"📤 메시지 전송 중...\n\n"
                    f"전체: {total}명\n"
                    f"성공: {success}명\n"
                    f"실패: {failed}명\n"
                    f"진행률: {idx}/{total} ({round(idx/total*100, 1)}%)"
                )
            except BaseException:
                pass

        # небольшая задержка, чтобы не превысить лимиты API
        if idx % 30 == 0:
            await asyncio.sleep(1)

    # финальное сообщение
    final_text = (
        f"✅ 메시지 전송 완료!\n\n"
        f"📊 통계:\n"
        f"• 전체: {total}명\n"
        f"• 성공: {success}명\n"
        f"• 실패: {failed}명\n"
        f"• 성공률: {round(success/total*100, 1) if total > 0 else 0}%"
    )
    kb = build_admin_keyboard()

    try:
        await status_message.edit_text(final_text, reply_markup=kb)
    except BaseException:
        await bot.send_message(admin_id, final_text, reply_markup=kb)


@dp.callback_query(F.data.startswith("ans:"))
async def handle_answer(callback: CallbackQuery):
    parts = callback.data.split(":")
    if len(parts) != 4:
        await callback.answer("잘못된 응답입니다.", show_alert=True)
        return

    try:
        word_id = int(parts[1])
        selected_index = int(parts[2])
        quiz_mode = parts[3]
    except (ValueError, IndexError):
        await callback.answer("잘못된 응답입니다.", show_alert=True)
        return

    if quiz_mode not in QUIZ_MODES:
        await callback.answer("잘못된 응답입니다.", show_alert=True)
        return

    word = WORDS_BY_ID.get(word_id)
    if not word:
        await callback.answer("이 문항은 더 이상 유효하지 않습니다.", show_alert=True)
        return

    user = await get_or_create_user(
        user_id=callback.from_user.id,
        username=callback.from_user.username,
        first_name=callback.from_user.first_name,
    )

    correct_index = word["correct_index"]
    is_correct = selected_index == correct_index
    delta_score = 1 if is_correct else -1

    if quiz_mode == QUIZ_MODE_AI:
        total_score = user["total_score"] + delta_score
        if total_score < 0:
            total_score = 0
        correct_streak = user["correct_streak"]
        wrong_streak = user["wrong_streak"]
        if is_correct:
            correct_streak += 1
            wrong_streak = 0
        else:
            wrong_streak += 1
            correct_streak = 0
        current_level = user["current_level"]
        new_level = get_next_level_on_streak(
            current_level, correct_streak, wrong_streak)
        level_changed = new_level != current_level
        level_change_message = None
        if level_changed:
            if LEVEL_ORDER.index(new_level) > LEVEL_ORDER.index(current_level):
                level_change_message = f"🎉 수준 상승! {current_level} → {new_level}"
            else:
                level_change_message = f"📉 수준 하락. {current_level} → {new_level}"
            correct_streak = 0
            wrong_streak = 0
            current_level = new_level
        await update_user_stats(
            user_id=user["user_id"],
            total_score=total_score,
            current_level=current_level,
            correct_streak=correct_streak,
            wrong_streak=wrong_streak,
        )
    else:
        level_changed = False
        level_change_message = None
        current_level = quiz_mode

    display_score = await update_level_score(user["user_id"], quiz_mode, delta_score)

    log_task = asyncio.create_task(log_answer(
        user_id=user["user_id"],
        word_id=word_id,
        is_correct=is_correct,
        delta_score=delta_score,
        level=current_level if quiz_mode == QUIZ_MODE_AI else word["level"],
        quiz_mode=quiz_mode,
    ))
    rank_task = asyncio.create_task(get_user_rank_by_mode(user["user_id"], quiz_mode))
    await log_task
    user_rank_info = await rank_task
    level_label = _quiz_mode_emoji_label(quiz_mode)
    rank_line = ""
    if user_rank_info:
        rank, _, _ = user_rank_info
        rank_line = f"\n📈내 {level_label} 순위: {rank} 위"
    score_line = f"\n📊내 {level_label} 점수: {display_score}💎{rank_line}"

    if is_correct:
        feedback = f"✅ 정답입니다!\n\n{level_label} +1💎\n" + score_line
    else:
        correct_option_text = word["options"][correct_index]
        feedback = (
            "❌ 틀렸습니다.\n\n"
            f"정답: {correct_index+1}) {correct_option_text}\n\n"
            f"{level_label} -1💎\n{score_line}"
        )

    if level_changed and level_change_message:
        feedback += f"\n\n{level_change_message}"

    try:
        await callback.message.edit_reply_markup(reply_markup=None)
    except TelegramBadRequest:
        pass
    await callback.message.answer(feedback, reply_markup=MAIN_MENU_KB)
    await callback.answer()

    if quiz_mode == QUIZ_MODE_AI:
        user_state = {
            "user_id": user["user_id"],
            "current_level": current_level,
            "total_score": total_score,
            "correct_streak": correct_streak,
            "wrong_streak": wrong_streak,
        }
    else:
        user_state = {
            "user_id": user["user_id"],
            "current_level": user["current_level"],
            "total_score": user["total_score"],
            "correct_streak": user["correct_streak"],
            "wrong_streak": user["wrong_streak"],
        }
    await send_quiz_question(callback.message, user_state, quiz_mode)


@dp.message(Command("cancel"))
async def cmd_cancel(message: Message):
    if message.from_user.id in broadcast_mode:
        broadcast_mode.discard(message.from_user.id)
        pending_broadcasts.pop(message.from_user.id, None)
        text = "❌ 메시지 전송이 취소되었습니다."
        kb = build_admin_keyboard()
        await message.answer(text, reply_markup=kb)
    else:
        await message.answer("취소할 작업이 없습니다.")


@dp.message(F.from_user.id.in_(broadcast_mode))
async def handle_broadcast_message(message: Message):
    if not is_admin(message.from_user.username):
        broadcast_mode.discard(message.from_user.id)
        await message.answer("❌ 권한이 없습니다.")
        return

    message_text = message.text or message.caption or ""

    if not message_text.strip() and not (
            message.photo or message.video or message.document or message.audio or message.voice):
        await message.answer(
            "❌ 메시지가 비어있습니다. 텍스트 또는 미디어 메시지를 입력하세요.\n"
            "취소하려면 /cancel을 입력하세요."
        )
        return

    # определяем тип контента
    content_type = "text"
    media_info = ""

    if message.photo:
        content_type = "photo"
        media_info = "📷 사진"
    elif message.video:
        content_type = "video"
        media_info = "🎥 비디오"
    elif message.document:
        content_type = "document"
        media_info = f"📄 문서: {message.document.file_name or '이름 없음'}"
    elif message.audio:
        content_type = "audio"
        media_info = "🎵 오디오"
    elif message.voice:
        content_type = "voice"
        media_info = "🎤 음성 메시지"

    # показываем превью и запрашиваем подтверждение
    preview_text = f"📝 미리보기:\n\n"

    if content_type != "text":
        preview_text += f"{media_info}\n"
        if message_text:
            preview_text += f"\n{message_text}\n"
    else:
        preview_text += f"{message_text}\n"

    preview_text += (
        f"\n이 메시지를 모든 사용자에게 보내시겠습니까?\n\n"
        f"⚠️ 주의: 이 작업은 취소할 수 없습니다."
    )

    confirm_kb = InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="✅ 전송", callback_data=f"admin:broadcast_confirm:yes"
                ),
                InlineKeyboardButton(
                    text="❌ 취소", callback_data=f"admin:broadcast_confirm:no"
                ),
            ]
        ]
    )

    # сохраняем информацию о сообщении для рассылки
    broadcast_data = {
        "text": message_text,
        "content_type": content_type,
        "message": message,  # сохраняем объект сообщения для копирования медиа
    }
    pending_broadcasts[message.from_user.id] = broadcast_data

    await message.answer(preview_text, reply_markup=confirm_kb)


from handlers.battle_handler import on_battle_button as _on_battle_menu


@dp.message(F.text.in_({BATTLE_MENU_TEXT, "⚔️전쟁 · 배틀🛡"}))
async def handle_battle_menu_button(message: Message):
    """Регистрируется до fallback: иначе пустой @dp.message() перехватывает кнопку битвы."""
    await _on_battle_menu(message)


@dp.message()
async def fallback_message(message: Message):
    # проверяем, не находится ли пользователь в режиме рассылки
    if message.from_user.id in broadcast_mode:
        await handle_broadcast_message(message)
        return

    text = (
        "아래 메뉴에서 기능을 선택하세요:\n\n"
        f"- {QUIZ_MENU_TEXT}\n"
        "- 📊랭킹\n"
        "- 🎁추천\n"
        f"- {BATTLE_MENU_TEXT}"
    )
    await message.answer(text, reply_markup=MAIN_MENU_KB)


# =======================
# ENTRY POINT
# =======================


async def main():
    logging.basicConfig(level=logging.INFO)
    _restore_db_from_backup_if_needed()
    await init_db()

    if not BOT_TOKEN:
        raise RuntimeError(
            "Set BOT_TOKEN environment variable (e.g. in Railway: Variables tab)."
        )

    bot = Bot(token=BOT_TOKEN)
    try:
        await bot.get_me()
    except TelegramUnauthorizedError:
        raise RuntimeError(
            "Invalid BOT_TOKEN. Check: 1) Railway Variables → BOT_TOKEN is set correctly. "
            "2) Token from @BotFather (no extra spaces). 3) Revoke old token and set the new one.")
    asyncio.create_task(_backup_loop())
    from handlers.battle_handler import battle_router

    dp.include_router(battle_router)
    asyncio.create_task(_battle_finish_delivery_loop(bot))
    await dp.start_polling(bot)


async def _battle_finish_delivery_loop(bot: Bot) -> None:
    """
    Auto-deliver missed battle finish messages (e.g. after bot restart),
    without requiring any user button press.
    """
    from services import battle_service as bs
    from handlers.battle_handler import _show_finish  # safe: uses late imports for bot.py helpers

    await asyncio.sleep(2.0)
    while True:
        try:
            battles = await bs.get_unnotified_finished_battles(limit=30)
            for b in battles:
                await _show_finish(bot, b)
        except Exception as e:
            logging.warning("battle finish delivery loop error: %s", e)
        await asyncio.sleep(10.0)


if __name__ == "__main__":
    try:
        asyncio.run(main())
    except (KeyboardInterrupt, SystemExit):
        pass
