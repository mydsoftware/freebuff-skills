"""
PACT-OS
Engine Compatibility Audit
"""

from __future__ import annotations

import inspect
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def check_engine(engine_class, required_methods):

    methods = {

        name

        for name, member in inspect.getmembers(
            engine_class,
            inspect.isfunction,
        )

    }

    missing = required_methods - methods

    return methods, missing


def report(title, methods, missing):

    print(title)

    print("-" * 70)

    print(f"Methods : {len(methods)}")

    for method in sorted(methods):

        print(f"  ✓ {method}")

    if missing:

        print()

        print("Missing")

        for item in sorted(missing):

            print(f"  ✗ {item}")

    else:

        print()

        print("Status : OK")

    print()


def main():

    from analysis.volume_engine import VolumeEngine
    from analysis.liquidity import LiquidityEngine
    from analysis.order_flow import OrderFlowEngine
    from analysis.support_resistance import (
        SupportResistanceEngine,
    )
    from analysis.breakout import BreakoutEngine
    from analysis.pullback import PullbackEngine

    print(LINE)
    print("PACT-OS ENGINE AUDIT")
    print(LINE)
    print()

    engines = [

        (
            "VolumeEngine",
            VolumeEngine,
            {"evaluate"},
        ),

        (
            "LiquidityEngine",
            LiquidityEngine,
            {"evaluate"},
        ),

        (
            "OrderFlowEngine",
            OrderFlowEngine,
            {"evaluate"},
        ),

        (
            "SupportResistanceEngine",
            SupportResistanceEngine,
            {"calculate"},
        ),

        (
            "BreakoutEngine",
            BreakoutEngine,
            {"evaluate"},
        ),

        (
            "PullbackEngine",
            PullbackEngine,
            {"evaluate"},
        ),
    ]

    total = 0

    failed = 0

    for title, cls, required in engines:

        methods, missing = check_engine(
            cls,
            required,
        )

        report(
            title,
            methods,
            missing,
        )

        total += 1

        if missing:

            failed += 1

    print(LINE)

    print(f"Engines Checked : {total}")

    print(f"Passed          : {total - failed}")

    print(f"Failed          : {failed}")

    print()

    if failed == 0:

        print("ENGINE AUDIT PASSED")

    else:

        print("ENGINE AUDIT FAILED")

    print(LINE)


if __name__ == "__main__":

    main()