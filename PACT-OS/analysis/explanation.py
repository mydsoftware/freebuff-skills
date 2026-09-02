"""
PACT-OS
Explanation Engine
"""

from dataclasses import dataclass


@dataclass(slots=True)
class Explanation:

    summary: str

    reasons: list[str]


class ExplanationEngine:

    def explain(

        self,

        result,

    ) -> Explanation:

        reasons = []

        if result.ema_signal == "BUY":
            reasons.append(
                "EMA(9) is above EMA(21)."
            )

        elif result.ema_signal == "SELL":
            reasons.append(
                "EMA(9) is below EMA(21)."
            )

        if result.rsi_signal == "BUY":
            reasons.append(
                "RSI indicates oversold conditions."
            )

        elif result.rsi_signal == "SELL":
            reasons.append(
                "RSI indicates overbought conditions."
            )

        if result.macd_signal == "BUY":
            reasons.append(
                "MACD crossed above the signal line."
            )

        elif result.macd_signal == "SELL":
            reasons.append(
                "MACD crossed below the signal line."
            )

        if not reasons:

            reasons.append(
                "No strong technical confirmation."
            )

        return Explanation(

            summary=result.signal,

            reasons=reasons,
        )