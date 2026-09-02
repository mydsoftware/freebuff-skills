"""
PACT-OS - Order Book Model
"""

from dataclasses import dataclass


@dataclass(slots=True)
class OrderBook:
    bids: list
    asks: list

    @property
    def best_bid(self) -> float:
        return float(self.bids[0][0])

    @property
    def best_ask(self) -> float:
        return float(self.asks[0][0])

    @property
    def spread(self) -> float:
        return self.best_ask - self.best_bid

    @property
    def spread_percent(self) -> float:
        return (self.spread / self.best_bid) * 100

    @classmethod
    def from_api(cls, data: dict):
        return cls(
            bids=data["bids"],
            asks=data["asks"],
        )