"""
PACT-OS
Timeframe Aggregator Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.database import Database
from database.repository import CandleRepository

from market.timeframe_aggregator import TimeframeAggregator


def main():

    database = Database()

    repository = CandleRepository(database)

    snapshots = repository.last_snapshots(

        symbol="BTCIRT",

        limit=500,

    )

    aggregator = TimeframeAggregator()

    candles = aggregator.build_1m(

        snapshots

    )

    print("=" * 70)
    print("PACT-OS TIMEFRAME TEST")
    print("=" * 70)

    print(f"Snapshots : {len(snapshots)}")
    print(f"1m Candles: {len(candles)}")

    if candles:

        last = candles[-1]

        print()
        print("Last Candle")
        print(f"Open   : {last.open:,.0f}")
        print(f"High   : {last.high:,.0f}")
        print(f"Low    : {last.low:,.0f}")
        print(f"Close  : {last.close:,.0f}")
        print(f"Volume : {last.volume:,.2f}")

    candles_1m = aggregator.build_1m(
        snapshots
    )

    candles_5m = aggregator.build_5m(
        candles_1m
    )

    candles_15m = aggregator.build_15m(
        candles_1m
    )

    candles_1h = aggregator.build_1h(
        candles_1m
    )

    print("=" * 70)
    print("PACT-OS TIMEFRAME TEST")
    print("=" * 70)

    print(f"Snapshots : {len(snapshots)}")
    print(f"1m : {len(candles_1m)}")
    print(f"5m : {len(candles_5m)}")
    print(f"15m: {len(candles_15m)}")
    print(f"1h : {len(candles_1h)}")


if __name__ == "__main__":
    main()