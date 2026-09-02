"""
PACT-OS
Pullback Detection Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class PullbackResult:

    detected: bool

    status: str

    distance_percent: float


class PullbackEngine:

    def __init__(

        self,

        tolerance: float = 0.30,

    ):

        self.tolerance = tolerance

    def evaluate(

        self,

        current_price: float,

        level: float,

    ) -> PullbackResult:

        distance_percent = (

            abs(current_price - level)

            / level

        ) * 100

        detected = (

            distance_percent <= self.tolerance

        )

        return PullbackResult(

            detected=detected,

            status=(
                "PULLBACK"
                if detected
                else "NO PULLBACK"
            ),

            distance_percent=distance_percent,
        )