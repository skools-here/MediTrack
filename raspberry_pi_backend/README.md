# **Wearable Health Server (ESP32 → Raspberry Pi)**

A lightweight backend system for real-time health monitoring.
The ESP32 publishes vitals (Heart Rate, SpO₂, Temperature, Steps) over MQTT.
The Raspberry Pi receives the data, stores it in SQLite, and exposes a Flask REST API.

## System Architecture**

**ESP32 → MQTT → Raspberry Pi → SQLite → Flask API**


### **Components**
* **ESP32**
  * Publishes health metrics via MQTT in JSON format.

* **Raspberry Pi**
  * **mqtt_handler.py** — Subscribes to MQTT topic, receives ESP32 data, stores it.
  * **database.py** — SQLite DB + table creation, insert, fetch.
  * **api.py** — Flask REST API exposing `/data`, `/latest`, `/upload`.
  * **main.py** — Runs MQTT and Flask API together.
  

## **Project Structure**
```

app/
  ├── api.py
  ├── mqtt_handler.py
  ├── database.py
  ├── config.py
  ├── __init__.py
mqtt.conf
main.py
README.md
```


## **Configuration**

Edit **`app/config.py`**:

```
MQTT_BROKER = "localhost"
MQTT_PORT   = 1883
MQTT_TOPIC  = "esp32/health"

SQLITE_DB   = "health_data.db"
FLASK_PORT  = 5000
```


## **Run Instructions**

### **Start server**
```bash
python3 main.py
```

### **API Endpoints**
| Route     | Method | Description                 |
| --------- | ------ | --------------------------- |
| `/data`   | GET    | Returns last 10 readings    |
| `/latest` | GET    | Returns most recent reading |
| `/upload` | POST   | Upload JSON data manually   |

Example JSON:

```json
{
  "heartRate": 78,
  "spo2": 97,
  "temperatureC": 36.9,
  "steps": 12
}
```
---

# **Requirements for a fresh Raspberry Pi OS setup**

Below is EVERYTHING needed to make this project run on a clean Raspberry Pi OS installation.

Just run this command for a single setup

```bash
pip install -r requirements.txt
```

**OR**


## **1. System Update**

```bash
sudo apt update && sudo apt upgrade -y
```

## **2. Install Python & Pip**

```bash
sudo apt install python3 python3-pip -y
```

## **3. Install Mosquitto MQTT Broker**

This is required for ESP32 → Pi communication.

```bash
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
sudo systemctl start mosquitto
```

## **4. Install Required Python Packages**

Create a virtual environment:

```bash
python3 -m venv venv
source venv/bin/activate
```

Then install the requirements:

```bash
pip install flask flask-cors paho-mqtt sqlite3-bro  # sqlite included in python3
```

## **7. Run the Server**

```bash
python3 main.py
```

You should see:

```
[System] Starting MQTT listener and web server...
[MQTT] Connected successfully!
Flask API running on port 5000
```
