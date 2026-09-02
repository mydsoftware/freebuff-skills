"""
PACT-OS
Trade Executor
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ExecutionResult:

    executed: bool

    action: str

    message: str


class TradeExecutor:

    def execute(

        self,

        action: str,

    ) -> ExecutionResult:

        if action == "BUY":

            return ExecutionResult(

                executed=True,

                action="BUY",

                message="Simulated BUY order executed.",
            )

        if action == "SELL":

            return ExecutionResult(

                executed=True,

                action="SELL",

                message="Simulated SELL order executed.",
            )

        return ExecutionResult(

            executed=False,

            action="HOLD",

            message="No order executed.",
        )