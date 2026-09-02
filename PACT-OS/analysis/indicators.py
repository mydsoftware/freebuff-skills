"""
PACT-OS
Indicator Pipeline
"""

from __future__ import annotations

from dataclasses import dataclass

from analysis.ema import calculate as ema
from analysis.macd import calculate as macd
from analysis.rsi import calculate as rsi


@dataclass(slots=True)
class IndicatorPipeline:

    ema9: float
    ema21: float

    rsi: float

    macd: float
    signal: float
    histogram: float

    @classmethod
    def from_prices(
        cls,
        prices: list[float],
    ) -> "IndicatorPipeline":

        macd_result = macd(prices)

        return cls(

            ema9=ema(prices, 9),

            ema21=ema(prices, 21),

            rsi=rsi(prices, 14),

            macd=macd_result["macd"],

            signal=macd_result["signal"],

            histogram=macd_result["histogram"],
        )