"""
PACT-OS
Trading Strategy
"""

from __future__ import annotations

from dataclasses import dataclass

from analysis.rules import RuleEngine


@dataclass(slots=True)
class StrategyResult:

    score: int

    ema: str
    rsi: str
    macd: str


class DefaultStrategy:

    def evaluate(

        self,

        ema9: float,
        ema21: float,

        rsi14: float,

        macd: float,
        signal: float,

    ) -> StrategyResult:

        result = RuleEngine(

            ema9=ema9,
            ema21=ema21,

            rsi14=rsi14,

            macd=macd,
            signal=signal,

        ).evaluate()

        return StrategyResult(

            score=result.score,

            ema=result.ema,
            rsi=result.rsi,
            macd=result.macd,
        )