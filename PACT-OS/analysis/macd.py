"""
PACT-OS
MACD Indicator
"""

from __future__ import annotations

from analysis.ema import calculate as ema


def _ema_series(prices: list[float], period: int) -> list[float]:
    """
    Calculate EMA series.
    """

    if len(prices) < period:
        raise ValueError(
            f"Need at least {period} prices."
        )

    multiplier = 2 / (period + 1)

    ema_values = []

    current = sum(prices[:period]) / period

    ema_values.append(current)

    for price in prices[period:]:

        current = ((price - current) * multiplier) + current

        ema_values.append(current)

    return ema_values


def calculate(
    prices: list[float],
    fast_period: int = 12,
    slow_period: int = 26,
    signal_period: int = 9,
) -> dict:
    """
    Calculate MACD.

    Returns
    -------
    dict
        {
            "macd": float,
            "signal": float,
            "histogram": float,
        }
    """

    if len(prices) < slow_period + signal_period:
        raise ValueError(
            f"Need at least {slow_period + signal_period} prices."
        )

    fast = _ema_series(prices, fast_period)

    slow = _ema_series(prices, slow_period)

    offset = slow_period - fast_period

    macd_series = []

    for i in range(len(slow)):
        macd_series.append(
            fast[i + offset] - slow[i]
        )

    signal = ema(macd_series, signal_period)

    macd = macd_series[-1]

    histogram = macd - signal

    return {
        "macd": round(macd, 2),
        "signal": round(signal, 2),
        "histogram": round(histogram, 2),
    }