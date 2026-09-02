"""
PACT-OS
Project Consistency Checker
"""

from __future__ import annotations

import inspect
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def dataclass_fields(cls) -> set[str]:

    return set(
        cls.__dataclass_fields__.keys()
    )


def print_result(
    title: str,
    missing: set[str],
    extra: set[str],
) -> None:

    print(title)
    print("-" * 70)

    if not missing and not extra:

        print("Status : OK")

        print()

        return

    if missing:

        print("Missing")

        for item in sorted(missing):

            print(f"  ✗ {item}")

        print()

    if extra:

        print("Unused")

        for item in sorted(extra):

            print(f"  ! {item}")

        print()


def main():

    from models.analysis_result import AnalysisResult

    from analysis.volume_engine import VolumeResult
    from analysis.liquidity import LiquidityResult
    from analysis.order_flow import OrderFlowResult

    print(LINE)
    print("PACT-OS PROJECT CONSISTENCY")
    print(LINE)
    print()

    analysis = dataclass_fields(
        AnalysisResult
    )

    volume = dataclass_fields(
        VolumeResult
    )

    liquidity = dataclass_fields(
        LiquidityResult
    )

    orderflow = dataclass_fields(
        OrderFlowResult
    )

    expected_volume = {

        "current_volume",
        "average_volume",
        "volume_ratio",
        "high_volume",
        "status",

    }

    expected_liquidity = {

        "equal_highs",
        "equal_lows",
        "buy_side_liquidity",
        "sell_side_liquidity",
        "liquidity_zone",
        "equal_high_price",
        "equal_low_price",

    }

    expected_orderflow = {

        "buy_volume",
        "sell_volume",
        "delta",
        "imbalance",
        "signal",

    }

    print_result(
        "VolumeResult",
        expected_volume - volume,
        volume - expected_volume,
    )

    print_result(
        "LiquidityResult",
        expected_liquidity - liquidity,
        liquidity - expected_liquidity,
    )

    print_result(
        "OrderFlowResult",
        expected_orderflow - orderflow,
        orderflow - expected_orderflow,
    )

    print("AnalysisResult")

    print("-" * 70)

    print(
        f"Total Fields : {len(analysis)}"
    )

    print()

    print(LINE)
    print("CONSISTENCY CHECK FINISHED")
    print(LINE)


if __name__ == "__main__":

    main()