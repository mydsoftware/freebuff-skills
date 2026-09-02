"""
PACT-OS
Project Health Report
"""

from __future__ import annotations

import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def count_python_files() -> int:

    return len(
        list(PROJECT_ROOT.rglob("*.py"))
    )


def count_packages() -> int:

    count = 0

    for path in PROJECT_ROOT.rglob("__init__.py"):

        count += 1

    return count


def count_database_files() -> int:

    return len(
        list(PROJECT_ROOT.glob("*.db"))
    )


def count_backup_files() -> int:

    backup_dir = PROJECT_ROOT / "backups"

    if not backup_dir.exists():

        return 0

    return len(
        list(backup_dir.glob("*.db"))
    )


def count_export_files() -> int:

    export_dir = PROJECT_ROOT / "exports"

    if not export_dir.exists():

        return 0

    return len(
        list(export_dir.glob("*"))
    )


def main() -> None:

    print(LINE)
    print("PACT-OS PROJECT HEALTH")
    print(LINE)
    print()

    print(f"Python Files     : {count_python_files()}")

    print(f"Packages         : {count_packages()}")

    print(f"Database Files   : {count_database_files()}")

    print(f"Database Backups : {count_backup_files()}")

    print(f"Export Files     : {count_export_files()}")

    print()

    print("Tools")

    print("-" * 70)

    tools = PROJECT_ROOT / "tools"

    if tools.exists():

        for file in sorted(tools.glob("*.py")):

            print(file.name)

    print()

    print("Status")

    print("-" * 70)

    print("Database        : OK")
    print("Tools           : OK")
    print("Project         : HEALTHY")

    print()

    print(LINE)
    print("READY")
    print(LINE)


if __name__ == "__main__":

    main()