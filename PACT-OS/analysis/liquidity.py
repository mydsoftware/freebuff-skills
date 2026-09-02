"""
PACT-OS
Liquidity Engine
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class LiquidityResult:

    equal_highs: bool
    equal_lows: bool

    buy_side_liquidity: bool
    sell_side_liquidity: bool

    liquidity_zone: str

    equal_high_price: float
    equal_low_price: float


class LiquidityEngine:

    def __init__(
        self,
        tolerance_percent: float = 0.20,
    ) -> None:

        self.tolerance_percent = tolerance_percent

    def evaluate(
        self,
        prices: list[float],
    ) -> LiquidityResult:

        if len(prices) < 10:

            last = prices[-1]

            return LiquidityResult(
                equal_highs=False,
                equal_lows=False,
                buy_side_liquidity=False,
                sell_side_liquidity=False,
                liquidity_zone="NONE",
                equal_high_price=last,
                equal_low_price=last,
            )

        highs = sorted(
            prices,
            reverse=True,
        )[:2]

        lows = sorted(prices)[:2]

        high_diff = abs(highs[0] - highs[1])
        low_diff = abs(lows[0] - lows[1])

        high_percent = (
            high_diff / highs[0]
        ) * 100

        low_percent = (
            low_diff / lows[1]
        ) * 100

        equal_highs = (
            high_percent <= self.tolerance_percent
        )

        equal_lows = (
            low_percent <= self.tolerance_percent
        )

        buy_side = equal_highs
        sell_side = equal_lows

        if buy_side and sell_side:

            zone = "BOTH"

        elif buy_side:

            zone = "BUY_SIDE"

        elif sell_side:

            zone = "SELL_SIDE"

        else:

            zone = "NONE"

        return LiquidityResult(

            equal_highs=equal_highs,
            equal_lows=equal_lows,

            buy_side_liquidity=buy_side,
            sell_side_liquidity=sell_side,

            liquidity_zone=zone,

            equal_high_price=max(highs),
            equal_low_price=min(lows),
        )