"""AI \"opponent\" answer simulation for battle mode."""
from __future__ import annotations

import random


def ai_correct_probability_range(level: str) -> tuple[float, float]:
    if level == "초급":
        return (0.70, 0.75)
    if level == "중급":
        return (0.80, 0.85)
    if level == "고급":
        return (0.90, 0.95)
    return (0.80, 0.85)


def pick_ai_option_index(
    n_options: int, correct_index: int, level: str
) -> int:
    """With level-based probability, return correct or a random wrong index."""
    if n_options <= 1 or correct_index < 0 or correct_index >= n_options:
        return max(0, min(correct_index, n_options - 1))
    lo, hi = ai_correct_probability_range(level)
    p = random.uniform(lo, hi)
    if random.random() < p:
        return correct_index
    wrong = [i for i in range(n_options) if i != correct_index]
    return random.choice(wrong)


def ai_think_delay_sec() -> float:
    return random.uniform(1.0, 3.0)
