"""
PACT-OS
Breakout Detection Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class BreakoutResult:

    breakout_up: bool

    breakout_down: bool

    status: str


class BreakoutEngine:

    def evaluate(

        self,

        current_price: float,

        support: float,

        resistance: float,

    ) -> BreakoutResult:

        if current_price > resistance:

            return BreakoutResult(

                breakout_up=True,

                breakout_down=False,

                status="BREAKOUT UP",
            )

        if current_price < support:

            return BreakoutResult(

                breakout_up=False,

                breakout_down=True,

                status="BREAKDOWN",
            )

        return BreakoutResult(

            breakout_up=False,

            breakout_down=False,

            status="RANGE",
        )