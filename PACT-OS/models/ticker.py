"""
PACT-OS - Ticker Model
"""

from dataclasses import dataclass


@dataclass(slots=True)
class Ticker:
    symbol: str
    last_price: float
    best_bid: float
    best_ask: float
    spread: float
    spread_percent: float