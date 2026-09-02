"""
PACT-OS
Database Backup Tool
"""

from __future__ import annotations

import shutil
import sys
from datetime import datetime
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

    backup_dir = PROJECT_ROOT / "backups"

    backup_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime(
        "%Y%m%d_%H%M%S"
    )

    backup_file = backup_dir / (
        f"pact_os_{timestamp}.db"
    )

    shutil.copy2(
        db_file,
        backup_file,
    )

    print(LINE)
    print("PACT-OS DATABASE BACKUP")
    print(LINE)
    print()

    print(f"Source      : {db_file}")

    print(f"Destination : {backup_file}")

    print(
        f"Size        : "
        f"{backup_file.stat().st_size / 1024:.2f} KB"
    )

    print()

    print("Backup completed successfully.")

    print()

    print(LINE)


if __name__ == "__main__":

    main()