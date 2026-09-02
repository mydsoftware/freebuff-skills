"""
PACT-OS Database
"""

from __future__ import annotations

import time

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from database.models import Base, MarketSnapshot
from models.ticker import Ticker


class Database:
    """
    SQLite database helper.
    """

    def __init__(
        self,
        db_path: str = "sqlite:///pact_os.db",
    ) -> None:

        self.engine = create_engine(
            db_path,
            echo=False,
        )

        Base.metadata.create_all(
            self.engine
        )

    def session(self) -> Session:

        return Session(
            self.engine
        )

    def save_market(
        self,
        ticker: Ticker,
        volume: float = 0.0,
    ) -> None:

        with Session(self.engine) as session:

            snapshot = MarketSnapshot(

                symbol=ticker.symbol,

                last_price=ticker.last_price,

                best_bid=ticker.best_bid,

                best_ask=ticker.best_ask,

                spread=ticker.spread,

                spread_percent=ticker.spread_percent,

                volume=volume,

                timestamp=int(time.time()),
            )

            session.add(snapshot)

            session.commit()

    def save_markets(
        self,
        tickers: list[Ticker],
        volumes: dict[str, float] | None = None,
    ) -> None:

        now = int(time.time())

        volumes = volumes or {}

        with Session(self.engine) as session:

            snapshots = []

            for ticker in tickers:

                snapshots.append(

                    MarketSnapshot(

                        symbol=ticker.symbol,

                        last_price=ticker.last_price,

                        best_bid=ticker.best_bid,

                        best_ask=ticker.best_ask,

                        spread=ticker.spread,

                        spread_percent=(
                            ticker.spread_percent
                        ),

                        volume=volumes.get(
                            ticker.symbol,
                            0.0,
                        ),

                        timestamp=now,
                    )
                )

            session.add_all(
                snapshots
            )

            session.commit()

    def last_snapshots(
        self,
        symbol: str,
        limit: int = 100,
    ) -> list[MarketSnapshot]:

        with Session(self.engine) as session:

            rows = (

                session.query(
                    MarketSnapshot
                )

                .filter(
                    MarketSnapshot.symbol == symbol
                )

                .order_by(
                    MarketSnapshot.id.desc()
                )

                .limit(limit)

                .all()
            )

            rows.reverse()

            return rows

    def last_prices(
        self,
        symbol: str,
        limit: int = 100,
    ) -> list[float]:

        rows = self.last_snapshots(
            symbol,
            limit,
        )

        return [
            row.last_price
            for row in rows
        ]

    def last_volumes(
        self,
        symbol: str,
        limit: int = 100,
    ) -> list[float]:

        rows = self.last_snapshots(
            symbol,
            limit,
        )

        return [
            row.volume
            for row in rows
        ]

    def clear(self) -> None:

        with Session(self.engine) as session:

            session.query(
                MarketSnapshot
            ).delete()

            session.commit()

    def last_trades(
        self,
        symbol: str,
        limit: int = 200,
    ):

        from exchange.tabdeal_client import TabdealClient

        client = TabdealClient()

        return client.trades(
            symbol=symbol,
            limit=limit,
        )