"""
PACT-OS
Historical Candle Model
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Candle:

    symbol: str

    timestamp: int

    open: float

    high: float

    low: float

    close: float

    volume: float

    @property
    def body(self) -> float:

        return abs(
            self.close - self.open
        )

    @property
    def range(self) -> float:

        return self.high - self.low

    @property
    def bullish(self) -> bool:

        return self.close > self.open

    @property
    def bearish(self) -> bool:

        return self.close < self.open

    @property
    def midpoint(self) -> float:

        return (
            self.high + self.low
        ) / 2