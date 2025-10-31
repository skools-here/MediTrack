# Wearable Health Server (ESP32 → Raspberry Pi)

The Raspberry Pi collects real-time health data from an ESP32 over MQTT,
stores it in an SQLite database, and exposes a Flask REST API for visualization.

## Components

- **ESP32** publishes heart rate, SpO₂, temperature via MQTT.
- **Raspberry Pi** runs:
  - MQTT listener (`mqtt_handler.py`)
  - SQLite storage (`database.py`)
  - Flask REST API (`api.py`)

## Run Instructions

```bash
git clone https://github.com/<your-username>/wearable-health-server.git
cd wearable-health-server
pip3 install -r requirements.txt
python3 main.py
```

## Configurations

Edit settings in app/config.py (MQTT broker, ports, DB path, etc.)
