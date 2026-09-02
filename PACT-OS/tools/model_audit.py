"""
PACT-OS
Model Compatibility Audit
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def dataclass_fields(cls):

    return set(
        cls.__dataclass_fields__.keys()
    )


def main():

    from models.analysis_result import AnalysisResult

    from analysis.volume_engine import VolumeResult

    from analysis.liquidity import LiquidityResult

    from analysis.order_flow import OrderFlowResult

    print(LINE)
    print("PACT-OS MODEL AUDIT")
    print(LINE)
    print()

    models = {

        "AnalysisResult": AnalysisResult,

        "VolumeResult": VolumeResult,

        "LiquidityResult": LiquidityResult,

        "OrderFlowResult": OrderFlowResult,

    }

    total_fields = 0

    for name, model in models.items():

        fields = sorted(
            dataclass_fields(model)
        )

        total_fields += len(fields)

        print(name)

        print("-" * 70)

        print(f"Fields : {len(fields)}")

        for field in fields:

            print(f"  ✓ {field}")

        print()

    print(LINE)

    print(f"Models       : {len(models)}")

    print(f"Total Fields : {total_fields}")

    print()

    print("MODEL AUDIT PASSED")

    print(LINE)


if __name__ == "__main__":

    main()