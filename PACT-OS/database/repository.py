"""
PACT-OS
Candle Repository
"""

from __future__ import annotations

from database.database import Database

from models.trade import Trade

from database.models import MarketSnapshot

class CandleRepository:

    def __init__(
        self,
        database: Database,
    ):

        self.database = database

    def last_prices(
        self,
        symbol: str,
        limit: int,
    ) -> list[float]:

        return self.database.last_prices(
            symbol=symbol,
            limit=limit,
        )

    def last_volumes(
        self,
        symbol: str,
        limit: int,
    ) -> list[float]:

        return self.database.last_volumes(
            symbol=symbol,
            limit=limit,
        )

    def last_trades(
        self,
        symbol: str,
        limit: int,
    ) -> list[Trade]:

        return self.database.last_trades(
            symbol=symbol,
            limit=limit,
        )

    def last_snapshots(
        self,
        symbol: str,
        limit: int = 500,
    ) -> list[MarketSnapshot]:

        return self.database.last_snapshots(
            symbol=symbol,
            limit=limit,
        )


    def count(
        self,
        symbol: str,
        limit: int = 1_000_000,
    ) -> int:

        return len(

            self.last_snapshots(
                symbol=symbol,
                limit=limit,
            )

        )


    def latest(
        self,
        symbol: str,
    ) -> MarketSnapshot | None:

        rows = self.last_snapshots(
            symbol=symbol,
            limit=1,
        )

        if rows:
            return rows[-1]

        return None