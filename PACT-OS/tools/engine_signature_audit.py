"""
PACT-OS
Engine Signature Audit
"""

from __future__ import annotations

import inspect
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def audit(
    title: str,
    cls,
    method_name: str,
) -> bool:

    print(title)
    print("-" * 70)

    if not hasattr(cls, method_name):

        print(f"Missing method : {method_name}")
        print()

        return False

    method = getattr(
        cls,
        method_name,
    )

    signature = inspect.signature(
        method
    )

    print(f"Method    : {method_name}")
    print(f"Signature : {signature}")

    print()

    print("Parameters")

    for parameter in signature.parameters.values():

        print(
            f"  {parameter.name:<15}"
            f"{parameter.kind.name}"
        )

    print()

    if signature.return_annotation is inspect.Signature.empty:

        print("Return Type : NOT SPECIFIED")

    else:

        print(
            f"Return Type : "
            f"{signature.return_annotation}"
        )

    print()

    return True


def main():

    from analysis.volume_engine import VolumeEngine
    from analysis.liquidity import LiquidityEngine
    from analysis.order_flow import OrderFlowEngine
    from analysis.breakout import BreakoutEngine
    from analysis.pullback import PullbackEngine
    from analysis.support_resistance import (
        SupportResistanceEngine,
    )

    print(LINE)
    print("PACT-OS ENGINE SIGNATURE AUDIT")
    print(LINE)
    print()

    total = 0

    passed = 0

    engines = [

        (
            "VolumeEngine",
            VolumeEngine,
            "evaluate",
        ),

        (
            "LiquidityEngine",
            LiquidityEngine,
            "evaluate",
        ),

        (
            "OrderFlowEngine",
            OrderFlowEngine,
            "evaluate",
        ),

        (
            "BreakoutEngine",
            BreakoutEngine,
            "evaluate",
        ),

        (
            "PullbackEngine",
            PullbackEngine,
            "evaluate",
        ),

        (
            "SupportResistanceEngine",
            SupportResistanceEngine,
            "calculate",
        ),
    ]

    for item in engines:

        total += 1

        if audit(*item):

            passed += 1

    print(LINE)

    print(f"Checked : {total}")

    print(f"Passed  : {passed}")

    print(f"Failed  : {total - passed}")

    print()

    print(LINE)


if __name__ == "__main__":

    main()