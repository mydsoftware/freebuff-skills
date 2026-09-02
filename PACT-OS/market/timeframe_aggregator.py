"""
PACT-OS
Timeframe Aggregator
"""

from __future__ import annotations

from collections import defaultdict

from database.models import MarketSnapshot
from market.candle_builder import CandleBuilder
from models.candle import Candle


class TimeframeAggregator:

    def __init__(self) -> None:
        self.builder = CandleBuilder()

    def build_1m(self, snapshots: list[MarketSnapshot]) -> list[Candle]:
        groups: dict[int, list[MarketSnapshot]] = defaultdict(list)

        for snapshot in snapshots:
            minute = snapshot.timestamp // 60
            groups[minute].append(snapshot)

        candles: list[Candle] = []
        for minute in sorted(groups):
            candle = self.builder.build(groups[minute])
            if candle is not None:
                candles.append(candle)

        return candles

    def aggregate(self, candles: list[Candle], timeframe: int) -> list[Candle]:
        if timeframe <= 1:
            return candles

        result: list[Candle] = []

        for index in range(0, len(candles), timeframe):
            chunk = candles[index : index + timeframe]

            # Incomplete period at the end → stop
            if len(chunk) < timeframe:
                break

            result.append(
                Candle(
                    symbol=chunk[-1].symbol,
                    # Prefer the *open* time of the period
                    timestamp=chunk[0].timestamp,
                    open=chunk[0].open,
                    high=max(c.high for c in chunk),
                    low=min(c.low for c in chunk),
                    close=chunk[-1].close,
                    volume=sum(c.volume for c in chunk),
                )
            )

        return result

    def build_5m(self, candles: list[Candle]) -> list[Candle]:
        return self.aggregate(candles, 5)

    def build_15m(self, candles: list[Candle]) -> list[Candle]:
        return self.aggregate(candles, 15)

    def build_1h(self, candles: list[Candle]) -> list[Candle]:
        return self.aggregate(candles, 60)

    def build_4h(self, candles: list[Candle]) -> list[Candle]:
        return self.aggregate(candles, 240)