"""
PACT-OS
Data Validator Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from models.candle import Candle
from market.data_validator import DataValidator


def main():

    validator = DataValidator()

    candles = [

        Candle(

            symbol="BTCIRT",

            timestamp=1,

            open=100,

            high=120,

            low=90,

            close=110,

            volume=500,

        ),

        Candle(

            symbol="BTCIRT",

            timestamp=2,

            open=-10,

            high=120,

            low=90,

            close=110,

            volume=500,

        ),

    ]


    valid = validator.filter_valid(
        candles
    )


    print("=" * 60)
    print("PACT-OS DATA VALIDATOR")
    print("=" * 60)

    print(
        f"Input  : {len(candles)}"
    )

    print(
        f"Valid  : {len(valid)}"
    )


if __name__ == "__main__":
    main()