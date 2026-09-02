"""
PACT-OS Database Models
"""

from sqlalchemy.orm import DeclarativeBase
from sqlalchemy.orm import Mapped
from sqlalchemy.orm import mapped_column

from sqlalchemy import Float
from sqlalchemy import Integer
from sqlalchemy import String


class Base(DeclarativeBase):
    pass


class MarketSnapshot(Base):

    __tablename__ = "market_snapshot"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
    )

    symbol: Mapped[str] = mapped_column(
        String(20)
    )

    last_price: Mapped[float] = mapped_column(
        Float
    )

    best_bid: Mapped[float] = mapped_column(
        Float
    )

    best_ask: Mapped[float] = mapped_column(
        Float
    )

    spread: Mapped[float] = mapped_column(
        Float
    )

    spread_percent: Mapped[float] = mapped_column(
        Float
    )

    volume: Mapped[float] = mapped_column(
        Float
    )

    timestamp: Mapped[int] = mapped_column(
        Integer
    )