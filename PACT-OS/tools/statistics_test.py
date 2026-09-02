"""
PACT-OS
Statistics Engine Test
"""

from __future__ import annotations

import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent


if str(PROJECT_ROOT) not in sys.path:

    sys.path.insert(
        0,
        str(PROJECT_ROOT),
    )


from database.database import Database
from database.repository import CandleRepository

from market.timeframe_aggregator import (
    TimeframeAggregator,
)

from market.statistics import (
    StatisticsEngine,
)


def main():


    database = Database()


    repository = CandleRepository(
        database
    )


    snapshots = repository.last_snapshots(

        symbol="BTCIRT",

        limit=500,

    )


    aggregator = TimeframeAggregator()


    candles = aggregator.build_1m(

        snapshots

    )


    engine = StatisticsEngine()


    stats = engine.calculate(

        candles

    )


    print("=" * 70)

    print("PACT-OS STATISTICS")

    print("=" * 70)


    print(
        f"High : {stats.high:,.0f}"
    )

    print(
        f"Low  : {stats.low:,.0f}"
    )

    print(
        f"Avg Volume : {stats.average_volume:,.2f}"
    )

    print(
        f"VWAP : {stats.vwap:,.0f}"
    )

    print(
        f"Change : {stats.price_change_percent:.2f}%"
    )


if __name__ == "__main__":

    main()