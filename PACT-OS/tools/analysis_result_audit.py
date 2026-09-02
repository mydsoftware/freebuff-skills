"""
PACT-OS
AnalysisResult Audit
"""

from __future__ import annotations

import ast
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent

if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))


LINE = "=" * 70


def analysis_result_fields() -> set[str]:

    from models.analysis_result import AnalysisResult

    return set(
        AnalysisResult.__dataclass_fields__.keys()
    )


def constructor_keywords() -> set[str]:

    path = (
        PROJECT_ROOT
        / "analysis"
        / "analysis_engine.py"
    )

    tree = ast.parse(
        path.read_text(
            encoding="utf-8"
        )
    )

    keywords = set()

    class Visitor(ast.NodeVisitor):

        def visit_Call(self, node):

            if (
                isinstance(node.func, ast.Name)
                and node.func.id == "AnalysisResult"
            ):

                for keyword in node.keywords:

                    keywords.add(
                        keyword.arg
                    )

            self.generic_visit(node)

    Visitor().visit(tree)

    return keywords


def main():

    print(LINE)
    print("PACT-OS ANALYSIS RESULT AUDIT")
    print(LINE)
    print()

    model_fields = analysis_result_fields()

    engine_fields = constructor_keywords()

    print(
        f"AnalysisResult Fields : {len(model_fields)}"
    )

    print(
        f"Engine Arguments      : {len(engine_fields)}"
    )

    print()

    missing = sorted(
        engine_fields - model_fields
    )

    unused = sorted(
        model_fields - engine_fields
    )

    if missing:

        print("Missing In Model")
        print("-" * 70)

        for item in missing:

            print(f"✗ {item}")

        print()

    if unused:

        print("Unused Model Fields")
        print("-" * 70)

        for item in unused:

            print(f"! {item}")

        print()

    if not missing and not unused:

        print("Status : PERFECT MATCH")

    print()

    print(LINE)


if __name__ == "__main__":

    main()