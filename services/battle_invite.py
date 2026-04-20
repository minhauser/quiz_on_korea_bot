"""Helpers to build t.me share URLs and parse deep links (no I/O)."""
from __future__ import annotations

import re
import urllib.parse

# start payload: battle_<uuid> (uuid may contain a-f, A-F, 0-9, -)
BATTLE_START_PREFIX = "battle_"
START_TOKEN_RE = re.compile(r"^battle_([0-9a-fA-F-]+)$", re.IGNORECASE)


def parse_start_battle_arg(args: str | None) -> str | None:
    if not args:
        return None
    m = START_TOKEN_RE.match(args.strip())
    return m.group(1) if m else None


def build_telegram_deeplink(bot_username: str, token: str) -> str:
    u = bot_username.lstrip("@")
    return f"https://t.me/{u}?start={BATTLE_START_PREFIX}{token}"


def build_share_url(
    deep_link: str, share_text: str = "⚔️ 나와 배틀하자! 링크를 눌러 참여하세요 🛡"
) -> str:
    q: dict = {
        "url": deep_link,
        "text": share_text,
    }
    return "https://t.me/share/url?" + urllib.parse.urlencode(q)
