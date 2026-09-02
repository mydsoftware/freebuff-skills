"""
PACT-OS
Trading Rules
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class RuleResult:

    score: int

    ema: str
    rsi: str
    macd: str


class RuleEngine:

    def __init__(

        self,

        ema9: float,
        ema21: float,

        rsi14: float,

        macd: float,
        signal: float,

    ):

        self.ema9 = ema9
        self.ema21 = ema21

        self.rsi14 = rsi14

        self.macd = macd
        self.signal = signal

    def evaluate(self) -> RuleResult:

        score = 0

        ema_text = "NEUTRAL"

        if self.ema9 > self.ema21:

            score += 1
            ema_text = "BUY"

        elif self.ema9 < self.ema21:

            score -= 1
            ema_text = "SELL"

        rsi_text = "HOLD"

        if self.rsi14 < 30:

            score += 1
            rsi_text = "BUY"

        elif self.rsi14 > 70:

            score -= 1
            rsi_text = "SELL"

        macd_text = "NEUTRAL"

        if self.macd > self.signal:

            score += 1
            macd_text = "BUY"

        elif self.macd < self.signal:

            score -= 1
            macd_text = "SELL"

        return RuleResult(

            score=score,

            ema=ema_text,
            rsi=rsi_text,
            macd=macd_text,
        )