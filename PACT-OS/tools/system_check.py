"""
PACT-OS
System Check
"""

from __future__ import annotations

import sys
import sqlite3
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


from config import WATCHLIST

LINE = "=" * 70


def check_database() -> bool:

    db = PROJECT_ROOT / "pact_os.db"

    if not db.exists():

        print("[ERROR] Database not found.")
        return False

    try:

        sqlite3.connect(db).close()

        print("[ OK ] Database")

        return True

    except Exception as exc:

        print(f"[ERROR] Database : {exc}")

        return False


def check_watchlist() -> bool:

    if not WATCHLIST:

        print("[ERROR] WATCHLIST is empty.")

        return False

    print(f"[ OK ] WATCHLIST ({len(WATCHLIST)} symbols)")

    return True


def check_folders() -> bool:

    required = [

        "analysis",
        "database",
        "decision",
        "exchange",
        "journal",
        "market",
        "models",
        "portfolio",
        "risk",
        "tools",
    ]

    ok = True

    for folder in required:

        path = PROJECT_ROOT / folder

        if path.exists():

            print(f"[ OK ] {folder}")

        else:

            print(f"[ERROR] {folder}")

            ok = False

    return ok


def main() -> None:

    print(LINE)
    print("PACT-OS SYSTEM CHECK")
    print(LINE)
    print()

    results = [

        check_database(),
        check_watchlist(),
        check_folders(),

    ]

    print()

    print(LINE)

    if all(results):

        print("SYSTEM STATUS : OK")

    else:

        print("SYSTEM STATUS : WARNING")

    print(LINE)


if __name__ == "__main__":

    main()