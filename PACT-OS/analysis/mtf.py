"""
PACT-OS
Multi Timeframe Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class TimeframeSignal:

    timeframe: str

    signal: str


@dataclass(slots=True)
class MTFResult:

    overall: str

    agreement: float

    signals: list[TimeframeSignal]


class MTFEngine:

    def evaluate(

        self,

        signals: list[TimeframeSignal],

    ) -> MTFResult:

        buy = 0
        sell = 0

        for item in signals:

            if "BUY" in item.signal:
                buy += 1

            elif "SELL" in item.signal:
                sell += 1

        total = len(signals)

        if buy > sell:

            overall = "BUY"

            agreement = buy / total

        elif sell > buy:

            overall = "SELL"

            agreement = sell / total

        else:

            overall = "HOLD"

            agreement = 0.50

        return MTFResult(

            overall=overall,

            agreement=agreement,

            signals=signals,
        )