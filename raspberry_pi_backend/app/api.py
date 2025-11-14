from flask import Flask, jsonify
from app.database import fetch_latest, fetch_latest_one
from app.config import FLASK_PORT

app = Flask(__name__)

@app.route("/data")
def get_data():
    rows = fetch_latest()
    return jsonify([
        {"timestamp": r[0], "heartRate": r[1], "spo2": r[2], "temperatureC": r[3]}
        for r in rows
    ])

<<<<<<< Updated upstream
@app.route("/latest")
=======
        records = [
            {
                "timestamp": r[0],
                "heartRate": r[1],
                "spo2": r[2],
                "temperatureC": r[3],
            }
            for r in rows
        ]
        return jsonify(records), 200



    except Exception as e:
        print("Error fetching data:", e)
        return jsonify({"error": "Failed to fetch data"}), 500



@app.route("/latest", methods=["GET"])
>>>>>>> Stashed changes
def get_latest():
    row = fetch_latest_one()
    if row:
        return jsonify({
            "timestamp": row[0],
            "heartRate": row[1],
            "spo2": row[2],
            "temperatureC": row[3]
        })
    return jsonify({"error": "No data yet"})

def start_flask():
<<<<<<< Updated upstream
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False)
=======
    print(f" Flask API running on port {FLASK_PORT}")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False)


if __name__ == "__main__":
    start_flask()
>>>>>>> Stashed changes
