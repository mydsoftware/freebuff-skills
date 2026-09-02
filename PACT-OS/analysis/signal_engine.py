"""
PACT-OS
Signal Engine
"""

from __future__ import annotations


def evaluate(
    *,
    ema9: float,
    ema21: float,
    rsi14: float,
    macd: float,
    signal: float,
    breakout_valid: bool = False,
    pullback_detected: bool = False,
    high_volume: bool = False,
    buy_side_liquidity: bool = False,
    sell_side_liquidity: bool = False,
    order_flow_signal: str = "NEUTRAL",
) -> dict:

    score = 0

    details = {}

    # ======================================
    # EMA
    # ======================================

    if ema9 > ema21:

        score += 2
        details["ema"] = "BUY"

    else:

        score -= 2
        details["ema"] = "SELL"

    # ======================================
    # RSI
    # ======================================

    if rsi14 < 30:

        score += 2
        details["rsi"] = "BUY"

    elif rsi14 > 70:

        score -= 2
        details["rsi"] = "SELL"

    else:

        details["rsi"] = "NEUTRAL"

    # ======================================
    # MACD
    # ======================================

    if macd > signal:

        score += 2
        details["macd"] = "BUY"

    else:

        score -= 2
        details["macd"] = "SELL"

    # ======================================
    # Breakout
    # ======================================

    if breakout_valid:

        score += 2

    # ======================================
    # Pullback
    # ======================================

    if pullback_detected:

        score += 1

    # ======================================
    # Volume
    # ======================================

    if high_volume:

        score += 1

    # ======================================
    # Liquidity
    # ======================================

    if buy_side_liquidity:

        score += 1

    if sell_side_liquidity:

        score -= 1

    # ======================================
    # Order Flow
    # ======================================

    if order_flow_signal == "BUY":

        score += 2

    elif order_flow_signal == "SELL":

        score -= 2

    # ======================================
    # Final Signal
    # ======================================

    if score >= 7:

        final_signal = "STRONG BUY"

    elif score >= 3:

        final_signal = "BUY"

    elif score <= -7:

        final_signal = "STRONG SELL"

    elif score <= -3:

        final_signal = "SELL"

    else:

        final_signal = "NEUTRAL"

    return {

        "score": score,

        "signal": final_signal,

        "details": details,
    }