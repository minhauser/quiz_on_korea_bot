"""Battle domain constants and row shapes (not ORM)."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal, Optional

BattleStatus = Literal["waiting", "active", "finished", "forfeit", "cancelled"]
InviteStatus = Literal["pending", "accepted", "declined", "expired", "superseded"]
TurnRole = Literal["initiator", "opponent"]


@dataclass
class Battle:
    id: int
    initiator_id: int
    opponent_id: Optional[int]
    is_ai_opponent: bool
    level: str
    status: str
    initiator_score: int
    opponent_score: int
    current_turn: str
    initiator_answers_cnt: int
    opponent_answers_cnt: int
    used_word_ids: str
    current_word_id: Optional[int]
    forfeit_by: Optional[int]
    created_at: str
    finished_at: Optional[str]
    finish_notified_initiator: int = 0
    finish_notified_opponent: int = 0


@dataclass
class BattleInvite:
    id: int
    battle_id: int
    invited_user_id: Optional[int]
    invite_token: str
    invite_type: str
    status: str
    sent_at: str
    expires_at: str
