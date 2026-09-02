"""
PACT-OS
Support & Resistance Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class SupportResistance:

    support: float

    resistance: float

    distance_to_support: float

    distance_to_resistance: float


class SupportResistanceEngine:

    def calculate(

        self,

        prices: list[float],

    ) -> SupportResistance:

        if len(prices) < 20:

            raise ValueError(
                "Not enough price history."
            )

        recent = prices[-20:]

        support = min(recent)

        resistance = max(recent)

        current = recent[-1]

        distance_to_support = current - support

        distance_to_resistance = resistance - current

        return SupportResistance(

            support=support,

            resistance=resistance,

            distance_to_support=distance_to_support,

            distance_to_resistance=distance_to_resistance,
        )