"""
PACT-OS
Master Audit Tool
"""

from __future__ import annotations

import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

TOOLS = [

    "compatibility_audit.py",

    "runtime_audit.py",

    "model_audit.py",

    "engine_audit.py",

    "engine_signature_audit.py",

    "analysis_result_audit.py",

    "project_consistency.py",

]

LINE = "=" * 70


def run_tool(name: str) -> bool:

    print()
    print(LINE)

    print(name)

    print(LINE)

    result = subprocess.run(

        [

            sys.executable,

            str(
                PROJECT_ROOT
                / "tools"
                / name
            ),

        ]

    )

    return result.returncode == 0


def main():

    print(LINE)

    print("PACT-OS MASTER AUDIT")

    print(LINE)

    passed = 0

    failed = 0

    for tool in TOOLS:

        if run_tool(tool):

            passed += 1

        else:

            failed += 1

    print()

    print(LINE)

    print("FINAL REPORT")

    print(LINE)

    print(f"Total Tools : {len(TOOLS)}")

    print(f"Passed      : {passed}")

    print(f"Failed      : {failed}")

    if failed == 0:

        print()

        print("PROJECT STATUS : HEALTHY")

    else:

        print()

        print("PROJECT STATUS : NEEDS REVIEW")

    print(LINE)


if __name__ == "__main__":

    main()