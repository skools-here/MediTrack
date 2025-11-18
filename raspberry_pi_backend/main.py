import threading  # for running mqtt and flask together

import sys, os    # for system paths
sys.path.append(os.path.dirname(__file__)) # adds current folder to pythons import path

# imports the applications 
from app.mqtt_handler import start_mqtt # subscribes to topic recieves esp32 data and mqtt broker start
from app.api import start_flask # flask api server starting

# run only if main is run not from being called
if __name__ == "__main__":
    print("[System] Starting MQTT listener and web server...")

    # start mqtt and flask together, mqtt runs in abckground
    mqtt_thread = threading.Thread(target=start_mqtt, daemon=True)
    mqtt_thread.start()

    start_flask()
