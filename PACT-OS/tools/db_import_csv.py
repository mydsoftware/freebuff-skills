"""
PACT-OS
Database Import CSV Tool
"""

from __future__ import annotations

import csv
import sqlite3
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def main() -> None:

    export_dir = PROJECT_ROOT / "exports"

    if not export_dir.exists():

        print("Export directory not found.")
        return

    files = sorted(
        export_dir.glob("*.csv"),
        reverse=True,
    )

    if not files:

        print("No CSV file found.")
        return

    print(LINE)
    print("PACT-OS DATABASE IMPORT")
    print(LINE)
    print()

    print("Available CSV Files\n")

    for index, file in enumerate(files, start=1):

        print(f"{index}. {file.name}")

    print()

    try:

        choice = int(
            input("Select file: ")
        )

    except ValueError:

        print("Invalid input.")
        return

    if choice < 1 or choice > len(files):

        print("Invalid selection.")
        return

    csv_file = files[choice - 1]

    db_file = PROJECT_ROOT / "pact_os.db"

    connection = sqlite3.connect(db_file)

    cursor = connection.cursor()

    cursor.execute(
        "DELETE FROM market_snapshot"
    )

    with open(
        csv_file,
        "r",
        encoding="utf-8-sig",
    ) as file:

        reader = csv.DictReader(file)

        count = 0

        for row in reader:

            cursor.execute(
                """
                INSERT INTO market_snapshot
                (
                    id,
                    symbol,
                    last_price,
                    best_bid,
                    best_ask,
                    spread,
                    spread_percent,
                    volume,
                    timestamp
                )
                VALUES
                (
                    ?,?,?,?,?,?,?,?,?
                )
                """,
                (
                    int(row["id"]),
                    row["symbol"],
                    float(row["last_price"]),
                    float(row["best_bid"]),
                    float(row["best_ask"]),
                    float(row["spread"]),
                    float(row["spread_percent"]),
                    float(row["volume"]),
                    int(row["timestamp"]),
                ),
            )

            count += 1

    connection.commit()

    connection.close()

    print()

    print(f"Imported : {count} rows")

    print()

    print(LINE)


if __name__ == "__main__":

    main()