import json
import paho.mqtt.client as mqtt
from app.config import MQTT_BROKER, MQTT_PORT, MQTT_TOPIC
from app.database import insert_data

def validate_data(hr, spo2):
    return 20 < hr < 220 and 70 < spo2 <= 100

def on_connect(client, userdata, flags, rc):
    if rc == 0:
        print("[MQTT] Connected successfully!")
        client.subscribe(MQTT_TOPIC)
    else:
        print(f"[MQTT] Connection failed: {rc}")

def on_message(client, userdata, msg):
    try:
        data = json.loads(msg.payload.decode())
        hr = float(data.get("heartRate", 0))
        spo2 = float(data.get("spo2", 0))
        temp = float(data.get("temperatureC", 0))
        steps = int(data.get("steps", 0))   # NEW

        if validate_data(hr, spo2):
            insert_data(hr, spo2, temp, steps)   # pass steps
            print(f"[SQLITE] Stored: HR={hr}, SpO2={spo2}, Temp={temp}, Steps={steps}")
        else:
            print(f"[SKIP] Invalid data: HR={hr}, SpO2={spo2}")

    except Exception as e:
        print(f"[ERROR] {e}")

def start_mqtt():
    client = mqtt.Client()
    client.on_connect = on_connect
    client.on_message = on_message
    client.connect(MQTT_BROKER, MQTT_PORT, 60)
    client.loop_forever()
