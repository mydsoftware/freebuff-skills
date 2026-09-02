"""
PACT-OS
History Cache Test
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from market.history_cache import HistoryCache
from models.candle import Candle



def main():

    cache = HistoryCache(
        ttl=60
    )


    candles = [

        Candle(

            symbol="BTCIRT",

            timestamp=1,

            open=100,

            high=120,

            low=90,

            close=110,

            volume=500,

        )

    ]


    cache.set(

        "BTCIRT",

        candles,

    )


    result = cache.get(
        "BTCIRT"
    )


    print("=" * 60)

    print("PACT-OS HISTORY CACHE")

    print("=" * 60)


    print(
        f"Cached : {result is not None}"
    )


    print(
        f"Count : {len(result)}"
    )



if __name__ == "__main__":

    main()