"""
PACT-OS
Watchlist Engine
"""

from dataclasses import dataclass, field


@dataclass(slots=True)
class Watchlist:

    symbols: list[str] = field(default_factory=list)


class WatchlistEngine:

    def __init__(self) -> None:

        self.watchlist = Watchlist()

    def load(
        self,
        symbols: list[str],
    ) -> None:

        self.watchlist.symbols = list(symbols)

    def add(
        self,
        symbol: str,
    ) -> None:

        if symbol not in self.watchlist.symbols:

            self.watchlist.symbols.append(symbol)

    def remove(
        self,
        symbol: str,
    ) -> None:

        if symbol in self.watchlist.symbols:

            self.watchlist.symbols.remove(symbol)

    def contains(
        self,
        symbol: str,
    ) -> bool:

        return symbol in self.watchlist.symbols

    def all(self) -> list[str]:

        return self.watchlist.symbols.copy()

    @property
    def count(self) -> int:

        return len(self.watchlist.symbols)