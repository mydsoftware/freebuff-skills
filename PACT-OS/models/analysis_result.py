"""
PACT-OS
Analysis Result Model
"""

from dataclasses import dataclass


@dataclass(slots=True)
class AnalysisResult:

    # ==========================================
    # Symbol
    # ==========================================

    symbol: str

    # ==========================================
    # Indicators
    # ==========================================

    ema9: float
    ema21: float

    rsi: float

    macd: float
    signal_line: float
    histogram: float

    # ==========================================
    # Support / Resistance
    # ==========================================

    support: float
    resistance: float

    distance_to_support: float
    distance_to_resistance: float

    # ==========================================
    # Breakout
    # ==========================================

    breakout_up: bool
    breakout_down: bool

    breakout_status: str

    # ==========================================
    # Breakout Filter
    # ==========================================

    breakout_valid: bool

    breakout_distance_percent: float
    breakout_threshold: float

    # ==========================================
    # Pullback
    # ==========================================

    pullback_detected: bool
    pullback_status: str
    pullback_distance_percent: float

    # ==========================================
    # Volume
    # ==========================================

    current_volume: float
    average_volume: float

    volume_ratio: float
    high_volume: bool

    volume_status: str

    # ==========================================
    # Liquidity
    # ==========================================

    equal_highs: bool
    equal_lows: bool

    buy_side_liquidity: bool
    sell_side_liquidity: bool

    liquidity_zone: str

    equal_high_price: float
    equal_low_price: float

    # ==========================================
    # Order Flow
    # ==========================================

    buy_volume: float
    sell_volume: float

    delta: float

    imbalance: float

    order_flow_signal: str

    # ==========================================
    # Final Signal
    # ==========================================

    score: int
    signal: str

    ema_signal: str
    rsi_signal: str
    macd_signal: str