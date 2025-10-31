import sqlite3
from app.config import SQLITE_DB

conn = sqlite3.connect(SQLITE_DB, check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS health_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    heartRate REAL,
    spo2 REAL,
    temperatureC REAL
)
""")
conn.commit()

def insert_data(heart_rate, spo2, temperature):
    cursor.execute(
        "INSERT INTO health_data (heartRate, spo2, temperatureC) VALUES (?, ?, ?)",
        (heart_rate, spo2, temperature)
    )
    conn.commit()

def fetch_latest(limit=10):
    cursor.execute("SELECT timestamp, heartRate, spo2, temperatureC FROM health_data ORDER BY id DESC LIMIT ?", (limit,))
    return cursor.fetchall()

def fetch_latest_one():
    cursor.execute("SELECT timestamp, heartRate, spo2, temperatureC FROM health_data ORDER BY id DESC LIMIT 1")
    return cursor.fetchone()