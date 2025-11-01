from flask import Flask, jsonify, request
from flask_cors import CORS
from app.datebase import fetch_latest, fetch_latest_one, insert_reading
from app.config import FLASK_PORT

app = Flask(__name__)
CORS(app)  

@app.route("/data", methods=["GET"])
def get_data():
    try:
        rows = fetch_latest()
        return jsonify([
            {
                "timestamp": r[0],
                "heartRate": r[1],
                "spo2": r[2],
                "temperatureC": r[3],
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
            })
        else:
            return jsonify({"error": "No data yet"}), 404
    except Exception as e:
        print("Error fetching latest reading:", e)
        return jsonify({"error": "Failed to fetch latest reading"}), 500

@app.route("/upload", methods=["POST"])
def upload_data():
    try:
        data = request.get_json(force=True)
        heartRate = data.get("heartRate")
        spo2 = data.get("spo2")
        temperatureC = data.get("temperatureC")

        if heartRate is None or spo2 is None or temperatureC is None:
            return jsonify({"error": "Missing required fields"}), 400

        insert_reading(heartRate, spo2, temperatureC)

        return jsonify({"message": "Data saved successfully"}), 200
    except Exception as e:
        print("Error saving data:", e)
        return jsonify({"error": "Failed to save data"}), 500


def start_flask():
    print(f" Flask API running on port {FLASK_PORT}")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False)


if __name__ == "__main__":
    start_flask()
