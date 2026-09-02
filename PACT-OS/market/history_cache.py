"""
PACT-OS
History Cache
"""

from __future__ import annotations

import time

from models.candle import Candle


class HistoryCache:


    def __init__(
        self,
        ttl: int = 60,
    ) -> None:

        self.ttl = ttl

        self._cache: dict[
            str,
            tuple[
                float,
                list[Candle],
            ]
        ] = {}


    def set(

        self,

        symbol: str,

        candles: list[Candle],

    ) -> None:

        self._cache[symbol] = (

            time.time(),

            candles,

        )


    def get(

        self,

        symbol: str,

    ) -> list[Candle] | None:


        if symbol not in self._cache:

            return None


        created, candles = self._cache[symbol]


        if (

            time.time()

            -

            created

            >

            self.ttl

        ):

            del self._cache[symbol]

            return None


        return candles



    def clear(self) -> None:

        self._cache.clear()



    def contains(

        self,

        symbol: str,

    ) -> bool:

        return (

            self.get(symbol)

            is not None

        )