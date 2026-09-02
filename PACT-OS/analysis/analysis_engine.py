"""
PACT-OS
Analysis Engine
"""

from __future__ import annotations

from analysis.breakout import BreakoutEngine
from analysis.breakout_filter import BreakoutFilter
from analysis.pullback import PullbackEngine
from analysis.volume_engine import VolumeEngine
from analysis.liquidity import LiquidityEngine
from analysis.indicators import IndicatorPipeline
from analysis.signal_engine import evaluate
from analysis.support_resistance import (
    SupportResistanceEngine,
)

from config import HISTORY_LIMIT

from database.repository import CandleRepository

from models.analysis_result import AnalysisResult

from analysis.order_flow import OrderFlowEngine

from market.history_manager import HistoricalDataManager

from analysis.analysis_cache import AnalysisCache

class AnalysisEngine:

    def __init__(
        self,
        repository: CandleRepository,
    ):

        self.repository = repository

        self.history = HistoricalDataManager(
            repository
        )

        self.support_resistance = (
            SupportResistanceEngine()
        )

        self.breakout = (
            BreakoutEngine()
        )

        self.breakout_filter = (
            BreakoutFilter()
        )

        self.pullback = (
            PullbackEngine()
        )

        self.volume = (
            VolumeEngine()
        )

        self.liquidity = (
            LiquidityEngine()
        )

        self.order_flow = (
            OrderFlowEngine()
        )

        self.analysis_cache = AnalysisCache()
        
    def analyze(
        self,
        symbol: str,
    ) -> AnalysisResult | None:

        candles = self.history.candles(
            symbol=symbol,
            limit=HISTORY_LIMIT,
        )

        if len(candles) < 35:
            return None

        prices = [
            candle.close
            for candle in candles
        ]

        volumes = [
            candle.volume
            for candle in candles
        ]

        if len(prices) < 35:
            return None

        indicators = IndicatorPipeline.from_prices(
            prices,
        )

        sr = self.support_resistance.calculate(
            prices,
        )

        current_price = prices[-1]

        breakout = self.breakout.evaluate(

            current_price=current_price,

            support=sr.support,

            resistance=sr.resistance,
        )

        if breakout.breakout_up:

            breakout_filter = (
                self.breakout_filter.validate(
                    current_price=current_price,
                    level=sr.resistance,
                )
            )

        elif breakout.breakout_down:

            breakout_filter = (
                self.breakout_filter.validate(
                    current_price=current_price,
                    level=sr.support,
                )
            )

        else:

            breakout_filter = (
                self.breakout_filter.validate(
                    current_price=current_price,
                    level=current_price,
                )
            )

        if breakout.breakout_up:

            pullback = self.pullback.evaluate(

                current_price=current_price,

                level=sr.resistance,
            )

        elif breakout.breakout_down:

            pullback = self.pullback.evaluate(

                current_price=current_price,

                level=sr.support,
            )

        else:

            pullback = self.pullback.evaluate(

                current_price=current_price,

                level=current_price,
            )

        volume = self.volume.evaluate(
            volumes
        )

        trades = self.repository.last_trades(
            symbol=symbol,
            limit=200,
        )

        order_flow = self.order_flow.evaluate(
            trades
        )

        liquidity = self.liquidity.evaluate(
            prices
        )

        signal_result = evaluate(

            ema9=indicators.ema9,

            ema21=indicators.ema21,

            rsi14=indicators.rsi,

            macd=indicators.macd,

            signal=indicators.signal,

            breakout_valid=breakout_filter.valid,

            pullback_detected=pullback.detected,

            high_volume=volume.high_volume,

            buy_side_liquidity=liquidity.buy_side_liquidity,

            sell_side_liquidity=liquidity.sell_side_liquidity,

            order_flow_signal=order_flow.signal,
        )

        return AnalysisResult(

            # ======================================
            # Symbol
            # ======================================

            symbol=symbol,

            # ======================================
            # Indicators
            # ======================================

            ema9=indicators.ema9,
            ema21=indicators.ema21,

            rsi=indicators.rsi,

            macd=indicators.macd,
            signal_line=indicators.signal,
            histogram=indicators.histogram,

            # ======================================
            # Support / Resistance
            # ======================================

            support=sr.support,
            resistance=sr.resistance,

            distance_to_support=(
                sr.distance_to_support
            ),

            distance_to_resistance=(
                sr.distance_to_resistance
            ),

            # ======================================
            # Breakout
            # ======================================

            breakout_up=breakout.breakout_up,

            breakout_down=breakout.breakout_down,

            breakout_status=breakout.status,

            # ======================================
            # Breakout Filter
            # ======================================

            breakout_valid=(
                breakout_filter.valid
            ),

            breakout_distance_percent=(
                breakout_filter.distance_percent
            ),

            breakout_threshold=(
                breakout_filter.threshold_percent
            ),

            # ======================================
            # Pullback
            # ======================================

            pullback_detected=(
                pullback.detected
            ),

            pullback_status=(
                pullback.status
            ),

            pullback_distance_percent=(
                pullback.distance_percent
            ),

            # ======================================
            # Volume
            # ======================================

            current_volume=(
                volume.current_volume
            ),

            average_volume=(
                volume.average_volume
            ),

            volume_ratio=(
                volume.volume_ratio
            ),

            high_volume=(
                volume.high_volume
            ),

            volume_status=(
                volume.status
            ),

            # ======================================
            # Liquidity
            # ======================================

            equal_highs=(
                liquidity.equal_highs
            ),

            equal_lows=(
                liquidity.equal_lows
            ),

            buy_side_liquidity=(
                liquidity.buy_side_liquidity
            ),

            sell_side_liquidity=(
                liquidity.sell_side_liquidity
            ),

            liquidity_zone=(
                liquidity.liquidity_zone
            ),

            equal_high_price=(
                liquidity.equal_high_price
            ),

            equal_low_price=(
                liquidity.equal_low_price
            ),

            # ======================================
            # Order Flow
            # ======================================

            buy_volume=(
                order_flow.buy_volume
            ),

            sell_volume=(
                order_flow.sell_volume
            ),

            delta=(
                order_flow.delta
            ),

            imbalance=(
                order_flow.imbalance
            ),

            order_flow_signal=(
                order_flow.signal
            ),

            # ======================================
            # Final Result
            # ======================================

            score=signal_result["score"],

            signal=signal_result["signal"],

            ema_signal=signal_result["details"]["ema"],

            rsi_signal=signal_result["details"]["rsi"],

            macd_signal=signal_result["details"]["macd"],
        )