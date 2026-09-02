"""
PACT-OS
Project Information
"""

from __future__ import annotations

import sys
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def count_files(path: Path) -> int:

    count = 0

    for item in path.rglob("*"):

        if item.is_file():

            count += 1

    return count


def count_python_files(path: Path) -> int:

    count = 0

    for item in path.rglob("*.py"):

        count += 1

    return count


def project_size(path: Path) -> int:

    total = 0

    for item in path.rglob("*"):

        if item.is_file():

            total += item.stat().st_size

    return total


def main() -> None:

    print(LINE)
    print("PACT-OS PROJECT INFORMATION")
    print(LINE)
    print()

    print(f"Project : {PROJECT_ROOT.name}")
    print(f"Location: {PROJECT_ROOT}")

    print()

    print(f"Python Files : {count_python_files(PROJECT_ROOT)}")
    print(f"All Files    : {count_files(PROJECT_ROOT)}")

    size = project_size(PROJECT_ROOT)

    print(f"Project Size : {size / 1024:.2f} KB")

    print()

    db = PROJECT_ROOT / "pact_os.db"

    if db.exists():

        modified = datetime.fromtimestamp(
            db.stat().st_mtime
        )

        print("Database")

        print(
            f"Size         : "
            f"{db.stat().st_size / 1024:.2f} KB"
        )

        print(
            f"Last Update  : "
            f"{modified.strftime('%Y-%m-%d %H:%M:%S')}"
        )

    else:

        print("Database : NOT FOUND")

    print()

    print("Folders")

    print("-" * 70)

    for folder in sorted(PROJECT_ROOT.iterdir()):

        if folder.is_dir():

            print(folder.name)

    print()

    print(LINE)
    print("READY")
    print(LINE)


if __name__ == "__main__":

    main()