"""
PACT-OS
Analysis History Test
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

    result = engine.analyze(
        "BTCIRT"
    )

    print("=" * 70)
    print("PACT-OS ANALYSIS HISTORY TEST")
    print("=" * 70)

    if result is None:

        print("Not enough history.")

        return

    print(
        f"Signal : {result.signal}"
    )

    print(
        f"Score  : {result.score}"
    )

    print(
        f"Support : {result.support:,.0f}"
    )

    print(
        f"Resistance : {result.resistance:,.0f}"
    )


if __name__ == "__main__":
    main()