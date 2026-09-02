"""
PACT-OS
Decision Engine
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class Decision:

    action: str

    allowed: bool

    reason: str


class DecisionEngine:

    def decide(

        self,

        signal: str,

    ) -> Decision:

        if signal == "STRONG BUY":

            return Decision(

                action="BUY",

                allowed=True,

                reason="Strong bullish signal",
            )

        if signal == "BUY":

            return Decision(

                action="BUY",

                allowed=True,

                reason="Bullish signal",
            )

        if signal == "SELL":

            return Decision(

                action="SELL",

                allowed=True,

                reason="Bearish signal",
            )

        if signal == "STRONG SELL":

            return Decision(

                action="SELL",

                allowed=True,

                reason="Strong bearish signal",
            )

        return Decision(

            action="HOLD",

            allowed=False,

            reason="No trade opportunity",
        )