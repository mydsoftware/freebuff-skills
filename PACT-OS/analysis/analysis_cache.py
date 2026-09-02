"""
PACT-OS
Analysis Cache
"""

from __future__ import annotations

import time

from models.analysis_result import AnalysisResult


class AnalysisCache:

    def __init__(
        self,
        ttl: int = 60,
    ) -> None:

        self.ttl = ttl

        self._cache: dict[
            str,
            tuple[
                float,
                AnalysisResult,
            ]
        ] = {}

    def get(
        self,
        symbol: str,
    ) -> AnalysisResult | None:

        item = self._cache.get(symbol)

        if item is None:
            return None

        created, result = item

        if time.time() - created > self.ttl:

            del self._cache[symbol]

            return None

        return result

    def set(
        self,
        symbol: str,
        result: AnalysisResult,
    ) -> None:

        self._cache[symbol] = (
            time.time(),
            result,
        )

    def clear(self) -> None:

        self._cache.clear()