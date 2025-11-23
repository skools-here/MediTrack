from flask import Flask, jsonify, request
from flask_cors import CORS
from app.database import fetch_latest, fetch_latest_one, insert_data, init_db
from app.config import FLASK_PORT

app = Flask(__name__)
CORS(app)


@app.route("/data", methods=["GET"])
def get_data():
    try:
        rows = fetch_latest()

        # Ensure oldest → newest order by timestamp
        try:
            rows = sorted(rows, key=lambda r: r[0])
        except Exception as sort_err:
            print("Warning: failed to sort:", sort_err)

        return jsonify([
            {
                "timestamp": r[0],
                "heartRate": r[1],
                "spo2": r[2],
                "temperatureC": r[3],
                "steps": r[4]
            }
            for r in rows
        ])
    except Exception as e:
        print("Error fetching data:", e)
        return jsonify({"error": "Failed to fetch data"}), 500


@app.route("/latest", methods=["GET"])
def get_latest():
    try:
        row = fetch_latest_one()
        if row:
            return jsonify({
                "timestamp": row[0],
                "heartRate": row[1],
                "spo2": row[2],
                "temperatureC": row[3],
                "steps": row[4]
            })
        return jsonify({"error": "No data yet"}), 404

    except Exception as e:
        print("Error fetching latest:", e)
        return jsonify({"error": "Failed to fetch latest"}), 500


@app.route("/upload", methods=["POST"])
def upload_data():
    try:
        data = request.get_json(force=True)
        heartRate = data.get("heartRate")
        spo2 = data.get("spo2")
        temperatureC = data.get("temperatureC")
        steps = data.get("steps", 0)

        if heartRate is None or spo2 is None or temperatureC is None:
            return jsonify({"error": "Missing required fields"}), 400

        insert_data(
            float(heartRate),
            float(spo2),
            float(temperatureC),
            int(steps)
        )

        print(f"[SQLITE] Stored: HR={heartRate}, SpO2={spo2}, Temp={temperatureC}, Steps={steps}")

        return jsonify({"message": "Data saved successfully"}), 200

    except Exception as e:
        print("Error saving data:", e)
        return jsonify({"error": "Failed to save data"}), 500


def start_flask():
    # ✅ Make sure DB and table exist before starting server
    init_db()
    print(f"Flask API running on port {FLASK_PORT}")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False)


if __name__ == "__main__":
    start_flask()
