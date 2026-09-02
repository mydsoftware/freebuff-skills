"""
PACT-OS
Database Status Tool
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

import os
from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from database.database import Database
from database.models import MarketSnapshot


LINE = "=" * 70


def format_timestamp(value: int | None) -> str:

    if value is None:
        return "-"

    return datetime.fromtimestamp(
        value
    ).strftime("%Y-%m-%d %H:%M:%S")


def main() -> None:

    database = Database()

    print(LINE)
    print("PACT-OS DATABASE STATUS")
    print(LINE)

    db_file = "pact_os.db"

    if os.path.exists(db_file):

        size = os.path.getsize(db_file)

        print(f"Database : {db_file}")
        print(
            f"Size     : "
            f"{size / 1024:.2f} KB"
        )

    else:

        print("Database : NOT FOUND")
        return

    print()

    with Session(database.engine) as session:

        total_rows = session.query(
            func.count(MarketSnapshot.id)
        ).scalar() or 0

        print(f"Total Records : {total_rows}")

        print()
        print("-" * 70)

        symbols = (

            session.query(
                MarketSnapshot.symbol
            )

            .distinct()

            .order_by(
                MarketSnapshot.symbol
            )

            .all()

        )

        if not symbols:

            print("Database is empty.")
            return

        for (symbol,) in symbols:

            rows = (

                session.query(
                    func.count(
                        MarketSnapshot.id
                    )
                )

                .filter(
                    MarketSnapshot.symbol == symbol
                )

                .scalar()

                or 0

            )

            first = (

                session.query(
                    MarketSnapshot
                )

                .filter(
                    MarketSnapshot.symbol == symbol
                )

                .order_by(
                    MarketSnapshot.timestamp.asc()
                )

                .first()

            )

            last = (

                session.query(
                    MarketSnapshot
                )

                .filter(
                    MarketSnapshot.symbol == symbol
                )

                .order_by(
                    MarketSnapshot.timestamp.desc()
                )

                .first()

            )

            print(symbol)

            print(f"Rows        : {rows}")

            print(
                "First       : "
                f"{format_timestamp(first.timestamp if first else None)}"
            )

            print(
                "Last        : "
                f"{format_timestamp(last.timestamp if last else None)}"
            )

            if rows < 35:

                status = "NOT ENOUGH DATA"

            elif rows < 100:

                status = "GOOD"

            else:

                status = "READY"

            print(f"Status      : {status}")

            print("-" * 70)


if __name__ == "__main__":

    main()