"""
PACT-OS
Market Scanner
"""

from __future__ import annotations

from config import WATCHLIST

from models.ticker import Ticker


class MarketScanner:

    def __init__(self, client):

        self.client = client

    def scan(self) -> list[Ticker]:

        markets: list[Ticker] = []

        for symbol in WATCHLIST:

            try:

                orderbook = self.client.depth(
                    symbol=symbol,
                    limit=5,
                )

                trades = self.client.trades(
                    symbol=symbol,
                    limit=1,
                )

                if not trades:
                    continue

                trade = trades[0]

                ticker = Ticker(

                    symbol=symbol,

                    last_price=trade.price,

                    best_bid=orderbook.best_bid,

                    best_ask=orderbook.best_ask,

                    spread=orderbook.spread,

                    spread_percent=orderbook.spread_percent,
                )

                markets.append(ticker)

            except Exception as ex:

                print(f"[Scanner] {symbol} : {ex}")

        return markets