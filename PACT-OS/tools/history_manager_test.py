"""
PACT-OS
History Manager Cache Test
"""

from __future__ import annotations

import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from database.database import Database
from database.repository import CandleRepository

from market.history_manager import HistoricalDataManager

def main():

    database = Database()

    repository = CandleRepository(
        database
    )


    history = HistoricalDataManager(
        repository
    )


    print("=" * 70)
    print("PACT-OS HISTORY CACHE TEST")
    print("=" * 70)


    first = history.candles(
        "BTCIRT",
        500,
    )


    second = history.candles(
        "BTCIRT",
        500,
    )


    print(
        f"First Load : {len(first)}"
    )


    print(
        f"Cache Load : {len(second)}"
    )


    print(
        f"Same Object : {first is second}"
    )


if __name__ == "__main__":

    main()