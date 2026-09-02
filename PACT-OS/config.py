"""
PACT-OS
Configuration
"""

from pathlib import Path

# =====================================================
# Project Paths
# =====================================================

BASE_DIR = Path(__file__).resolve().parent

DATABASE_PATH = BASE_DIR / "database" / "market.db"

# =====================================================
# Collector
# =====================================================

COLLECT_INTERVAL = 5

# =====================================================
# Analysis
# =====================================================

HISTORY_LIMIT = 100

# =====================================================
# Watch List
# =====================================================

WATCHLIST = [
    "BTCIRT",
    "ETHIRT",
    "BNBIRT",
    "SOLIRT",
    "XRPIRT",
    "DOGEIRT",
]