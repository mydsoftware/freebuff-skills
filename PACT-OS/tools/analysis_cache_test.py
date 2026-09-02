"""
PACT-OS
Analysis Cache Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from database.database import Database
from database.repository import CandleRepository

from analysis.analysis_engine import AnalysisEngine


def main():

    database = Database()

    repository = CandleRepository(
        database
    )

    engine = AnalysisEngine(
        repository
    )

    first = engine.analyze(
        "BTCIRT"
    )

    second = engine.analyze(
        "BTCIRT"
    )

    print("=" * 70)
    print("PACT-OS ANALYSIS CACHE")
    print("=" * 70)

    print(
        f"Cache Hit : {first is second}"
    )


if __name__ == "__main__":
    main()