"""
PACT-OS
Market Structure Engine
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class MarketStructureResult:

    trend: str

    last_higher_high: float
    last_higher_low: float

    last_lower_high: float
    last_lower_low: float

    bos: bool
    choch: bool

    structure: str


class MarketStructureEngine:

    def __init__(
        self,
        lookback: int = 5,
    ) -> None:

        self.lookback = lookback

    def evaluate(
        self,
        prices: list[float],
    ) -> MarketStructureResult:

        if len(prices) < (self.lookback * 2 + 5):

            last = prices[-1]

            return MarketStructureResult(
                trend="UNKNOWN",
                last_higher_high=last,
                last_higher_low=last,
                last_lower_high=last,
                last_lower_low=last,
                bos=False,
                choch=False,
                structure="UNKNOWN",
            )

        highs = []
        lows = []

        for i in range(
            self.lookback,
            len(prices) - self.lookback,
        ):

            window = prices[
                i - self.lookback:
                i + self.lookback + 1
            ]

            value = prices[i]

            if value == max(window):
                highs.append(value)

            if value == min(window):
                lows.append(value)

        if len(highs) < 2 or len(lows) < 2:

            last = prices[-1]

            return MarketStructureResult(
                trend="RANGE",
                last_higher_high=last,
                last_higher_low=last,
                last_lower_high=last,
                last_lower_low=last,
                bos=False,
                choch=False,
                structure="RANGE",
            )

        hh = highs[-1]
        ph = highs[-2]

        hl = lows[-1]
        pl = lows[-2]

        trend = "RANGE"

        if hh > ph and hl > pl:
            trend = "UP"

        elif hh < ph and hl < pl:
            trend = "DOWN"

        current = prices[-1]

        bos = False
        choch = False
        structure = "NONE"

        if trend == "UP":

            if current > hh:

                bos = True
                structure = "BOS_UP"

            elif current < hl:

                choch = True
                structure = "CHOCH_DOWN"

        elif trend == "DOWN":

            if current < hl:

                bos = True
                structure = "BOS_DOWN"

            elif current > hh:

                choch = True
                structure = "CHOCH_UP"

        return MarketStructureResult(

            trend=trend,

            last_higher_high=hh,
            last_higher_low=hl,

            last_lower_high=ph,
            last_lower_low=pl,

            bos=bos,
            choch=choch,

            structure=structure,
        )