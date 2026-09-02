"""
PACT-OS
Historical Statistics Engine
"""

from __future__ import annotations

from dataclasses import dataclass

from models.candle import Candle


@dataclass(slots=True)
class MarketStatistics:

    high: float

    low: float

    average_volume: float

    vwap: float

    price_change_percent: float


class StatisticsEngine:


    def calculate(

        self,

        candles: list[Candle],

    ) -> MarketStatistics:


        if not candles:

            return MarketStatistics(

                high=0.0,

                low=0.0,

                average_volume=0.0,

                vwap=0.0,

                price_change_percent=0.0,

            )


        high = max(

            candle.high

            for candle in candles

        )


        low = min(

            candle.low

            for candle in candles

        )


        total_volume = sum(

            candle.volume

            for candle in candles

        )


        average_volume = (

            total_volume

            / len(candles)

        )


        volume_sum = 0.0

        price_volume_sum = 0.0


        for candle in candles:

            typical_price = (

                candle.high

                + candle.low

                + candle.close

            ) / 3


            price_volume_sum += (

                typical_price

                * candle.volume

            )


            volume_sum += candle.volume



        if volume_sum == 0:

            vwap = 0.0

        else:

            vwap = (

                price_volume_sum

                / volume_sum

            )


        first_price = candles[0].close

        last_price = candles[-1].close


        if first_price == 0:

            change = 0.0

        else:

            change = (

                (last_price - first_price)

                / first_price

            ) * 100



        return MarketStatistics(

            high=high,

            low=low,

            average_volume=average_volume,

            vwap=vwap,

            price_change_percent=change,

        )