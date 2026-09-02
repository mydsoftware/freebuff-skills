"""
PACT-OS
Candle Builder
"""

from __future__ import annotations

from models.candle import Candle
from database.models import MarketSnapshot


class CandleBuilder:

    def build(
        self,
        snapshots: list[MarketSnapshot],
    ) -> Candle | None:

        if not snapshots:
            return None

        first = snapshots[0]
        last = snapshots[-1]

        high = max(
            row.last_price
            for row in snapshots
        )

        low = min(
            row.last_price
            for row in snapshots
        )

        volume = sum(
            row.volume
            for row in snapshots
        )

        return Candle(

            symbol=last.symbol,

            timestamp=last.timestamp,

            open=first.last_price,

            high=high,

            low=low,

            close=last.last_price,

            volume=volume,

        )