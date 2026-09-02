"""
PACT-OS
Confidence Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class ConfidenceResult:

    score: int

    level: str


class ConfidenceEngine:

    def evaluate(

        self,

        signal_score: int,

    ) -> ConfidenceResult:

        if signal_score >= 3:

            return ConfidenceResult(

                score=95,

                level="VERY HIGH",
            )

        if signal_score == 2:

            return ConfidenceResult(

                score=80,

                level="HIGH",
            )

        if signal_score == 1:

            return ConfidenceResult(

                score=65,

                level="MEDIUM",
            )

        if signal_score == 0:

            return ConfidenceResult(

                score=50,

                level="LOW",
            )

        return ConfidenceResult(

            score=30,

            level="VERY LOW",
        )