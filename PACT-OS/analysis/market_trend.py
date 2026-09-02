"""
PACT-OS
Market Trend Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class MarketTrend:

    trend: str

    strength: int


class MarketTrendEngine:

    def evaluate(

        self,

        signals: list[str],

    ) -> MarketTrend:

        buy = sum(
            1
            for signal in signals
            if "BUY" in signal
        )

        sell = sum(
            1
            for signal in signals
            if "SELL" in signal
        )

        total = len(signals)

        if total == 0:

            return MarketTrend(

                trend="UNKNOWN",

                strength=0,
            )

        if buy > sell:

            return MarketTrend(

                trend="BULLISH",

                strength=round(
                    buy / total * 100
                ),
            )

        if sell > buy:

            return MarketTrend(

                trend="BEARISH",

                strength=round(
                    sell / total * 100
                ),
            )

        return MarketTrend(

            trend="SIDEWAYS",

            strength=50,
        )