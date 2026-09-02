"""
PACT-OS
History Status
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
from market.history_manager import (
    HistoricalDataManager,
)

from config import WATCHLIST


def main():

    database = Database()

    repository = CandleRepository(
        database
    )

    history = HistoricalDataManager(
        repository
    )

    print("=" * 70)
    print("PACT-OS HISTORY STATUS")
    print("=" * 70)

    print()

    for symbol in WATCHLIST:

        count = history.count(
            symbol
        )

        print(
            f"{symbol:<10}"
            f"{count}"
        )


if __name__ == "__main__":

    main()