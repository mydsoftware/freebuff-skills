"""
PACT-OS
Candle Builder Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.database import Database
from database.repository import CandleRepository

from market.candle_builder import CandleBuilder


def main():

    database = Database()

    repository = CandleRepository(
        database
    )

    builder = CandleBuilder()

    symbol = "BTCIRT"

    snapshots = repository.last_snapshots(
        symbol=symbol,
        limit=20,
    )

    candle = builder.build(
        snapshots
    )

    print("=" * 70)
    print("PACT-OS CANDLE BUILDER")
    print("=" * 70)

    if candle is None:

        print("No Data")
        return

    print(f"Symbol : {candle.symbol}")
    print(f"Open   : {candle.open:,.0f}")
    print(f"High   : {candle.high:,.0f}")
    print(f"Low    : {candle.low:,.0f}")
    print(f"Close  : {candle.close:,.0f}")
    print(f"Volume : {candle.volume:,.2f}")


if __name__ == "__main__":

    main()