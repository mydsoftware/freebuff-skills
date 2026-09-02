"""
PACT-OS
Database Restore Tool
"""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def main() -> None:

    backup_dir = PROJECT_ROOT / "backups"

    if not backup_dir.exists():

        print("Backup directory not found.")
        return

    backups = sorted(
        backup_dir.glob("*.db"),
        reverse=True,
    )

    if not backups:

        print("No backup found.")
        return

    print(LINE)
    print("PACT-OS DATABASE RESTORE")
    print(LINE)
    print()

    print("Available Backups\n")

    for index, backup in enumerate(backups, start=1):

        print(f"{index}. {backup.name}")

    print()

    try:

        choice = int(
            input("Select backup number: ")
        )

    except ValueError:

        print("Invalid input.")
        return

    if choice < 1 or choice > len(backups):

        print("Invalid selection.")
        return

    selected = backups[choice - 1]

    destination = PROJECT_ROOT / "pact_os.db"

    shutil.copy2(
        selected,
        destination,
    )

    print()

    print(f"Backup      : {selected.name}")
    print(f"Restored To : {destination.name}")

    print()
    print("Restore completed successfully.")
    print()
    print(LINE)


if __name__ == "__main__":

    main()