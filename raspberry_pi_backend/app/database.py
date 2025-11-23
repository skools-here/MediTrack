# app/database.py
import sqlite3
from contextlib import closing
from app.config import SQLITE_DB


def get_connection():
    """
    Create a new SQLite connection for each DB operation.
    check_same_thread=False allows use from different threads.
    """
    return sqlite3.connect(SQLITE_DB, check_same_thread=False)


def init_db():
    """
    Create the health_data table if it doesn't exist.
    Run this once at startup (e.g. from start_flask()).
    """
    with closing(get_connection()) as conn, conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS health_data (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                heartRate REAL,
                spo2 REAL,
                temperatureC REAL,
                steps INTEGER DEFAULT 0
            )
            """
        )


def insert_data(heart_rate, spo2, temperature, steps=0):
    """
    Insert one row into health_data.
    """
    with closing(get_connection()) as conn, conn:
        conn.execute(
            """
            INSERT INTO health_data (heartRate, spo2, temperatureC, steps)
            VALUES (?, ?, ?, ?)
            """,
            (heart_rate, spo2, temperature, steps),
        )


def fetch_latest(limit=10):
    """
    Return last <limit> rows as:
    (timestamp, heartRate, spo2, temperatureC, steps)
    Ordered by id DESC (newest first).
    """
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT timestamp, heartRate, spo2, temperatureC, steps
            FROM health_data
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,),
        )
        rows = cur.fetchall()
    return rows


def fetch_latest_one():
    """
    Return a single latest row or None.
    (timestamp, heartRate, spo2, temperatureC, steps)
    """
    with closing(get_connection()) as conn:
        cur = conn.cursor()
        cur.execute(
            """
            SELECT timestamp, heartRate, spo2, temperatureC, steps
            FROM health_data
            ORDER BY id DESC
            LIMIT 1
            """
        )
        row = cur.fetchone()
    return row
