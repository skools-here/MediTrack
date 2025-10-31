import threading
from app.mqtt_handler import start_mqtt
from app.api import start_flask

if __name__ == "__main__":
    print("[System] Starting MQTT listener and web server...")

    mqtt_thread = threading.Thread(target=start_mqtt, daemon=True)
    mqtt_thread.start()

    start_flask()
