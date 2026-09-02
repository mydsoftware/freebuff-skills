"""
PACT-OS
Order Flow Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class OrderFlowResult:

    buy_volume: float

    sell_volume: float

    delta: float

    imbalance: float

    signal: str


class OrderFlowEngine:

    def evaluate(
        self,
        trades,
    ) -> OrderFlowResult:

        buy_volume = 0.0
        sell_volume = 0.0

        for trade in trades:

            if trade.is_buyer_maker:
                sell_volume += trade.quantity
            else:
                buy_volume += trade.quantity

        delta = buy_volume - sell_volume

        total = buy_volume + sell_volume

        if total == 0:

            imbalance = 0.0

        else:

            imbalance = delta / total

        if imbalance >= 0.20:

            signal = "BUY"

        elif imbalance <= -0.20:

            signal = "SELL"

        else:

            signal = "NEUTRAL"

        return OrderFlowResult(

            buy_volume=buy_volume,

            sell_volume=sell_volume,

            delta=delta,

            imbalance=imbalance,

            signal=signal,
        )