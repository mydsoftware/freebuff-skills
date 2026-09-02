"""
PACT-OS
Trade Journal
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime


@dataclass(slots=True)
class JournalEntry:

    symbol: str

    action: str

    quantity: float

    price: float

    timestamp: datetime

    status: str


@dataclass(slots=True)
class TradeJournal:

    entries: list[JournalEntry] = field(
        default_factory=list
    )

    def add(

        self,

        symbol: str,

        action: str,

        quantity: float,

        price: float,

        status: str,

    ) -> None:

        self.entries.append(

            JournalEntry(

                symbol=symbol,

                action=action,

                quantity=quantity,

                price=price,

                status=status,

                timestamp=datetime.now(),

            )

        )

    @property
    def total_trades(self) -> int:

        return len(self.entries)