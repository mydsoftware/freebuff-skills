"""
PACT-OS
Order Manager
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


@dataclass(slots=True)
class Order:

    symbol: str

    action: str

    quantity: float

    price: float

    created_at: datetime

    status: str = "NEW"


class OrderManager:

    def create(

        self,

        symbol: str,

        action: str,

        quantity: float,

        price: float,

    ) -> Order:

        return Order(

            symbol=symbol,

            action=action,

            quantity=quantity,

            price=price,

            created_at=datetime.now(),

            status="NEW",
        )