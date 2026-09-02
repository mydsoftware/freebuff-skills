"""
PACT-OS - Trade Model
"""

from dataclasses import dataclass


@dataclass(slots=True)
class Trade:
    id: int
    price: float
    quantity: float
    quote_quantity: float
    timestamp: int
    is_buyer_maker: bool

    @classmethod
    def from_api(cls, data: dict) -> "Trade":
        return cls(
            id=int(data["id"]),
            price=float(data["price"]),
            quantity=float(data["qty"]),
            quote_quantity=float(data["quoteQty"]),
            timestamp=int(data["time"]),
            is_buyer_maker=bool(data["isBuyerMaker"]),
        )