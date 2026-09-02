"""
PACT-OS
Database Vacuum Tool
"""

from __future__ import annotations

import sqlite3
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def main() -> None:

    db_file = PROJECT_ROOT / "pact_os.db"

    if not db_file.exists():

        print("Database not found.")
        return

    before = db_file.stat().st_size

    connection = sqlite3.connect(db_file)

    connection.execute("VACUUM")

    connection.close()

    after = db_file.stat().st_size

    print(LINE)
    print("PACT-OS DATABASE VACUUM")
    print(LINE)
    print()

    print(f"Before : {before / 1024:.2f} KB")
    print(f"After  : {after / 1024:.2f} KB")
    print()

    if after < before:

        saved = (before - after) / 1024

        print(f"Recovered : {saved:.2f} KB")

    else:

        print("Database already optimized.")

    print()
    print(LINE)


if __name__ == "__main__":

    main()