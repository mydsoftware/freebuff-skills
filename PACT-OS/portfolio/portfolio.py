"""
PACT-OS
Portfolio Manager
"""

from __future__ import annotations

from dataclasses import dataclass, field


@dataclass(slots=True)
class Position:

    symbol: str

    quantity: float

    entry_price: float


@dataclass(slots=True)
class Portfolio:

    cash: float = 0.0

    positions: dict[str, Position] = field(
        default_factory=dict
    )

    def has_position(
        self,
        symbol: str,
    ) -> bool:

        return symbol in self.positions

    def get_position(
        self,
        symbol: str,
    ) -> Position | None:

        return self.positions.get(symbol)

    def add_position(

        self,

        symbol: str,

        quantity: float,

        entry_price: float,

    ) -> None:

        self.positions[symbol] = Position(

            symbol=symbol,

            quantity=quantity,

            entry_price=entry_price,
        )

    def remove_position(
        self,
        symbol: str,
    ) -> None:

        self.positions.pop(symbol, None)