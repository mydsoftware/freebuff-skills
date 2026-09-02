"""
PACT-OS
Compatibility Audit
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def python_files() -> list[Path]:

    return sorted(
        PROJECT_ROOT.rglob("*.py")
    )


def check_syntax(file: Path) -> tuple[bool, str]:

    try:

        source = file.read_text(
            encoding="utf-8"
        )

        ast.parse(source)

        return True, ""

    except Exception as exc:

        return False, str(exc)


def main() -> None:

    print(LINE)
    print("PACT-OS COMPATIBILITY AUDIT")
    print(LINE)
    print()

    total = 0

    passed = 0

    failed = 0

    for file in python_files():

        if ".venv" in file.parts:

            continue

        total += 1

        ok, message = check_syntax(file)

        relative = file.relative_to(
            PROJECT_ROOT
        )

        if ok:

            passed += 1

            print(f"[ OK ] {relative}")

        else:

            failed += 1

            print(f"[FAIL] {relative}")

            print(f"       {message}")

    print()

    print(LINE)

    print(f"Python Files : {total}")

    print(f"Passed       : {passed}")

    print(f"Failed       : {failed}")

    print(LINE)


if __name__ == "__main__":

    main()