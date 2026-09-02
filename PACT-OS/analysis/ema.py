"""
PACT-OS - EMA Indicator
"""

from __future__ import annotations


def calculate(prices: list[float], period: int) -> float:
    """
    Calculate Exponential Moving Average (EMA).

    Parameters
    ----------
    prices : list[float]
        Closing prices.
    period : int
        EMA period.

    Returns
    -------
    float
        EMA value.
    """

    if len(prices) < period:
        raise ValueError(
            f"Need at least {period} prices."
        )

    multiplier = 2 / (period + 1)

    ema = sum(prices[:period]) / period

    for price in prices[period:]:
        ema = (price - ema) * multiplier + ema

    return ema