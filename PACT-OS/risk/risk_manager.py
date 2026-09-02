"""
PACT-OS
Risk Manager
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class RiskManager:

    max_risk_percent: float = 2.0

    max_open_positions: int = 5

    def can_open_position(

        self,

        current_positions: int,

    ) -> bool:

        return current_positions < self.max_open_positions

    def calculate_position_size(

        self,

        capital: float,

    ) -> float:

        return capital * (self.max_risk_percent / 100)