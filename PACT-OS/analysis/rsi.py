"""
PACT-OS
RSI Indicator
"""

from __future__ import annotations


def calculate(prices: list[float], period: int = 14) -> float:
    """
    Calculate Relative Strength Index (RSI)

    Parameters
    ----------
    prices : list[float]
        Closing prices.

    period : int
        RSI period.

    Returns
    -------
    float
        RSI value.
    """

    if len(prices) < period + 1:
        raise ValueError(
            f"Need at least {period + 1} prices."
        )

    gains = []
    losses = []

    for i in range(1, period + 1):

        change = prices[i] - prices[i - 1]

        if change > 0:
            gains.append(change)
            losses.append(0.0)
        else:
            gains.append(0.0)
            losses.append(abs(change))

    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period

    for i in range(period + 1, len(prices)):

        change = prices[i] - prices[i - 1]

        gain = max(change, 0.0)
        loss = abs(min(change, 0.0))

        avg_gain = ((avg_gain * (period - 1)) + gain) / period
        avg_loss = ((avg_loss * (period - 1)) + loss) / period

    if avg_loss == 0:
        return 100.0

    rs = avg_gain / avg_loss

    rsi = 100 - (100 / (1 + rs))

    return round(rsi, 2)