"""
PACT-OS
Breakout Filter
"""

from dataclasses import dataclass


@dataclass(slots=True)
class BreakoutFilterResult:

    valid: bool

    threshold_percent: float

    distance_percent: float


class BreakoutFilter:

    def __init__(

        self,

        threshold: float = 0.30,

    ):

        self.threshold = threshold

    def validate(

        self,

        current_price: float,

        level: float,

    ) -> BreakoutFilterResult:

        distance = abs(
            current_price - level
        )

        distance_percent = (
            distance / level
        ) * 100

        return BreakoutFilterResult(

            valid=(
                distance_percent >=
                self.threshold
            ),

            threshold_percent=self.threshold,

            distance_percent=distance_percent,
        )