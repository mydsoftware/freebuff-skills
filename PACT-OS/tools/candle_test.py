"""
PACT-OS
Candle Model Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from models.candle import Candle

def main():

    candle = Candle(

        symbol="BTCIRT",

        timestamp=0,

        open=100,

        high=120,

        low=95,

        close=115,

        volume=250,

    )

    print("=" * 60)

    print("PACT-OS CANDLE TEST")

    print("=" * 60)

    print(f"Bullish : {candle.bullish}")

    print(f"Bearish : {candle.bearish}")

    print(f"Body    : {candle.body}")

    print(f"Range   : {candle.range}")

    print(f"Middle  : {candle.midpoint}")


if __name__ == "__main__":

    main()