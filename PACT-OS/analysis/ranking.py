"""
PACT-OS
Opportunity Ranking Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class Opportunity:

    symbol: str

    score: int

    confidence: int

    signal: str


class RankingEngine:

    def rank(

        self,

        opportunities: list[Opportunity],

    ) -> list[Opportunity]:

        return sorted(

            opportunities,

            key=lambda item: (

                item.score,

                item.confidence,

            ),

            reverse=True,
        )