"""
PACT-OS
Runtime Compatibility Audit
"""

from __future__ import annotations

import inspect
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def check_analysis_result():

    from models.analysis_result import AnalysisResult

    return set(
        AnalysisResult.__dataclass_fields__.keys()
    )


def check_volume_result():

    from analysis.volume_engine import VolumeResult

    return set(
        VolumeResult.__dataclass_fields__.keys()
    )


def check_repository():

    from database.repository import CandleRepository

    methods = {

        name

        for name, member in inspect.getmembers(
            CandleRepository,
            inspect.isfunction,
        )

    }

    required = {

        "last_prices",
        "last_volumes",
        "last_trades",

    }

    return required - methods


def main():

    print(LINE)
    print("PACT-OS RUNTIME AUDIT")
    print(LINE)
    print()

    analysis_fields = check_analysis_result()

    print("AnalysisResult")
    print("-" * 70)

    print(f"Fields : {len(analysis_fields)}")

    print()

    volume_fields = check_volume_result()

    print("VolumeResult")
    print("-" * 70)

    for field in sorted(volume_fields):

        print(field)

    print()

    missing = check_repository()

    print("Repository")
    print("-" * 70)

    if missing:

        print("Missing Methods")

        for item in sorted(missing):

            print(f" - {item}")

    else:

        print("All required methods found.")

    print()

    print(LINE)
    print("AUDIT COMPLETED")
    print(LINE)


if __name__ == "__main__":

    main()