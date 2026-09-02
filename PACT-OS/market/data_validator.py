"""
PACT-OS
Historical Data Validator
"""

from __future__ import annotations

from models.candle import Candle


class DataValidator:

    def validate(
        self,
        candle: Candle,
    ) -> bool:

        if candle.open <= 0:
            return False

        if candle.high <= 0:
            return False

        if candle.low <= 0:
            return False

        if candle.close <= 0:
            return False

        if candle.volume < 0:
            return False

        if candle.high < candle.low:
            return False

        if candle.open > candle.high:
            return False

        if candle.open < candle.low:
            return False

        if candle.close > candle.high:
            return False

        if candle.close < candle.low:
            return False

        return True


    def filter_valid(
        self,
        candles: list[Candle],
    ) -> list[Candle]:

        return [

            candle

            for candle in candles

            if self.validate(candle)

        ]