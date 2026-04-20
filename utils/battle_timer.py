"""5-second question timeout via asyncio.Task; cancel the task on answer."""
from __future__ import annotations

import asyncio
import contextlib
import logging
from typing import Awaitable, Callable, Optional, TypeVar

T = TypeVar("T")

logger = logging.getLogger(__name__)


def schedule_question_timer(
    delay_sec: float,
    on_timeout: Callable[[], Awaitable[None]],
) -> asyncio.Task[None]:
    """
    After delay_sec, await on_timeout(). Caller should task.cancel() when
    the player answered in time. CancelledError is silently ignored.
    """

    async def _run() -> None:
        try:
            await asyncio.sleep(delay_sec)
            await on_timeout()
        except asyncio.CancelledError:
            return
        except Exception:
            logger.exception("battle question timer on_timeout failed")

    return asyncio.create_task(_run())


@contextlib.contextmanager
def hold_timer(t: Optional[asyncio.Task]) -> object:
    """On exit, cancels the timer if still running."""
    try:
        yield
    finally:
        if t and not t.done():
            t.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                pass  # not awaiting t — avoid blocking handler
