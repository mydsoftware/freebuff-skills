"""
PACT-OS
Database Export CSV Tool
"""

from __future__ import annotations

import csv
import sqlite3
import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def main() -> None:

    db_file = PROJECT_ROOT / "pact_os.db"

    if not db_file.exists():

        print("Database not found.")
        return

    export_dir = PROJECT_ROOT / "exports"

    export_dir.mkdir(exist_ok=True)

    filename = datetime.now().strftime(
        "market_snapshot_%Y%m%d_%H%M%S.csv"
    )

    output = export_dir / filename

    connection = sqlite3.connect(db_file)

    cursor = connection.cursor()

    cursor.execute(
        """
        SELECT *
        FROM market_snapshot
        ORDER BY id
        """
    )

    rows = cursor.fetchall()

    headers = [
        item[0]
        for item in cursor.description
    ]

    with open(
        output,
        "w",
        newline="",
        encoding="utf-8-sig",
    ) as file:

        writer = csv.writer(file)

        writer.writerow(headers)

        writer.writerows(rows)

    connection.close()

    print(LINE)
    print("PACT-OS DATABASE EXPORT")
    print(LINE)
    print()

    print(f"Rows Exported : {len(rows)}")

    print(f"Output File   : {output}")

    print()

    print(LINE)


if __name__ == "__main__":

    main()