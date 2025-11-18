# app/database.py
import sqlite3
from app.config import SQLITE_DB

# NOTE: keep check_same_thread=False if you're using threads (Flask + MQTT listener).
conn = sqlite3.connect(SQLITE_DB, check_same_thread=False)
cursor = conn.cursor()

# Create table with steps column (idempotent)
cursor.execute("""
CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    heartRate REAL,
    spo2 REAL,
    temperatureC REAL,
    steps INTEGER DEFAULT 0
)
""")
conn.commit()

def insert_data(heart_rate, spo2, temperature, steps=0):
    cursor.execute(
        "INSERT INTO health_data (heartRate, spo2, temperatureC, steps) VALUES (?, ?, ?, ?)",
        (heart_rate, spo2, temperature, steps)
    )
    conn.commit()

def fetch_latest(limit=10):
    cursor.execute(
        "SELECT timestamp, heartRate, spo2, temperatureC, steps FROM health_data ORDER BY id DESC LIMIT ?",
        (limit,)
    )
    return cursor.fetchall()

def fetch_latest_one():
    cursor.execute(
        "SELECT timestamp, heartRate, spo2, temperatureC, steps FROM health_data ORDER BY id DESC LIMIT 1"
    )
    return cursor.fetchone()
