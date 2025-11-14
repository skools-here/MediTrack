import sqlite3
from datetime import datetime, timezone
from app.config import SQLITE_DB

# Connect to SQLite
conn = sqlite3.connect(SQLITE_DB, check_same_thread=False)
cursor = conn.cursor()

# Create table (unchanged)
cursor.execute("""
CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT DEFAULT (CURRENT_TIMESTAMP),  -- TEXT is fine for ISO strings
    heartRate REAL,
    spo2 REAL,
    temperatureC REAL
)
""")
conn.commit()

# Updated insert_data to store UTC ISO timestamp
def insert_data(heart_rate, spo2, temperature):
    now_utc = datetime.now(timezone.utc).isoformat(timespec='seconds')  # e.g., '2025-11-14T12:34:56+00:00'
    cursor.execute(
        "INSERT INTO health_data (timestamp, heartRate, spo2, temperatureC) VALUES (?, ?, ?, ?)",
        (now_utc, heart_rate, spo2, temperature)
    )
    conn.commit()

# Fetch functions (unchanged, but now timestamps are ISO UTC)
def fetch_latest(limit=10):
    cursor.execute(
        "SELECT timestamp, heartRate, spo2, temperatureC FROM health_data ORDER BY id DESC LIMIT ?", 
        (limit,)
    )
    return cursor.fetchall()

def fetch_latest_one():
    cursor.execute(
        "SELECT timestamp, heartRate, spo2, temperatureC FROM health_data ORDER BY id DESC LIMIT 1"
    )
    return cursor.fetchone()
