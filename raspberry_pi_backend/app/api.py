from flask import Flask, request, Response
from flask_cors import CORS
from app.database import fetch_latest, fetch_latest_one, insert_data
from app.config import FLASK_PORT
from dicttoxml import dicttoxml
import xml.etree.ElementTree as ET

app = Flask(__name__)
CORS(app)


@app.route("/data", methods=["GET"])
def get_data():
    try:
        rows = fetch_latest()

        records = [
            {
                "timestamp": r[0],
                "heartRate": r[1],
                "spo2": r[2],
                "temperatureC": r[3],
            }
            for r in rows
        ]

        xml_data = dicttoxml(records, custom_root="readings", attr_type=False)
        return Response(xml_data, mimetype="application/xml")

    except Exception as e:
        print("Error fetching data:", e)
        return Response("<error>Failed to fetch data</error>", mimetype="application/xml", status=500)


@app.route("/latest", methods=["GET"])
def get_latest():
    try:
        row = fetch_latest_one()

        if row:
            record = {
                "timestamp": row[0],
                "heartRate": row[1],
                "spo2": row[2],
                "temperatureC": row[3],
            }

            xml_data = dicttoxml(record, custom_root="reading", attr_type=False)
            return Response(xml_data, mimetype="application/xml")

        else:
            return Response("<error>No data yet</error>", mimetype="application/xml", status=404)

    except Exception as e:
        print("Error fetching latest reading:", e)
        return Response("<error>Failed to fetch latest reading</error>", mimetype="application/xml", status=500)


@app.route("/upload", methods=["POST"])
def upload_data():
    try:
        xml_raw = request.data.decode("utf-8")

        root = ET.fromstring(xml_raw)

        heartRate = int(root.find("heartRate").text)
        spo2 = int(root.find("spo2").text)
        temperatureC = float(root.find("temperatureC").text)

        insert_data(heartRate, spo2, temperatureC)

        return Response("<message>Data saved successfully</message>", mimetype="application/xml")

    except Exception as e:
        print("Error saving data:", e)
        return Response("<error>Failed to save data</error>", mimetype="application/xml", status=500)


def start_flask():
    print(f" Flask API running on port {FLASK_PORT}")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=False)


if __name__ == "__main__":
    start_flask()