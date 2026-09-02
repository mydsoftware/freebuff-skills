"""
PACT-OS
Database Statistics Tool
"""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def query(cursor, sql: str):

    cursor.execute(sql)

    return cursor.fetchone()[0]


def main() -> None:

    db_file = PROJECT_ROOT / "pact_os.db"

    if not db_file.exists():

        print("Database not found.")
        return

    connection = sqlite3.connect(db_file)

    cursor = connection.cursor()

    total_rows = query(
        cursor,
        "SELECT COUNT(*) FROM market_snapshot",
    )

    total_symbols = query(
        cursor,
        "SELECT COUNT(DISTINCT symbol) FROM market_snapshot",
    )

    first_time = query(
        cursor,
        "SELECT MIN(timestamp) FROM market_snapshot",
    )

    last_time = query(
        cursor,
        "SELECT MAX(timestamp) FROM market_snapshot",
    )

    db_size = db_file.stat().st_size / 1024

    print(LINE)
    print("PACT-OS DATABASE STATISTICS")
    print(LINE)
    print()

    print(f"Database Size : {db_size:.2f} KB")
    print(f"Rows          : {total_rows}")
    print(f"Symbols       : {total_symbols}")
    print(f"First Record  : {first_time}")
    print(f"Last Record   : {last_time}")

    print()

    print("-" * 40)
    print("Rows Per Symbol")
    print("-" * 40)

    cursor.execute(
        """
        SELECT symbol, COUNT(*)
        FROM market_snapshot
        GROUP BY symbol
        ORDER BY symbol
        """
    )

    for symbol, count in cursor.fetchall():

        print(f"{symbol:<10} {count}")

    connection.close()

    print()
    print(LINE)


if __name__ == "__main__":

    main()