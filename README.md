# **Wearable Health Monitoring System**
---
A full-stack IoT system for real-time health monitoring using **ESP32**, **MAX30102**, **Raspberry Pi**, **MQTT**, **SQLite**, **Flask**, and a **React-based dashboard**.

It streams heart rate, SpO₂, temperature, and steps from a wearable device to a Raspberry Pi, stores the data locally, and visualizes it in a beautiful web UI.

---

# **System Architecture**
---

```
 ┌────────┐     I2C      ┌──────────────┐     MQTT      ┌───────────────┐
 │ MAX30102│────────────▶│    ESP32     │──────────────▶│  Mosquitto     │
 └────────┘              │  Firmware    │               │ (MQTT Broker)  │
                         └──────────────┘               └──────┬─────────┘
                                                               │
                                               SQLite Store ◀──┘
                                               (Flask Backend)
                                                               │
                                                               ▼
                                                    React Dashboard (Live UI)
```

---

# **Project Structure**
---

```
/
├── esp32/                  # ESP32 firmware
│   └── esp32_max30102_mqtt.ino
│
├── raspberry-pi/           # Backend server (MQTT + SQLite + Flask)
│   ├── main.py
│   ├── requirements.txt
│   └── app/
│       ├── api.py
│       ├── mqtt_handler.py
│       ├── database.py
│       └── config.py
│
└── web-dashboard/          # React + Vite frontend
    ├── src/
    │   ├── pages/
    │   │   ├── Dashboard.tsx
    │   │   ├── Devices.tsx
    │   │   ├── History.tsx
    │   │   ├── Index.tsx
    │   │   └── NotFound.tsx
    │   └── components/health/
    │       ├── VitalCard.tsx
    │       ├── LiveChart.tsx
    │       └── HealthStatusCard.tsx
    └── package.json
```

---

# **1. ESP32 Firmware**
---

### **Features**

* Reads Heart Rate & SpO₂ using MAX30102
* Reads temperature sensor
* Step counter (optional)
* Publishes values via MQTT as JSON

### **MQTT Topic**

```
esp32/health
```

### **MQTT Payload Format**

```json
{
  "heartRate": 82,
  "spo2": 98,
  "temperatureC": 36.5,
  "steps": 24
}
```

### **Dependencies**

* SparkFun MAX3010x Sensor Library
* PubSubClient

Install via Arduino IDE → Library Manager.

Upload at **115200 baud**.

---

# **2. Raspberry Pi Backend**
---

Runs three key services:

### **MQTT Listener**

Receives ESP32 readings and stores them in SQLite.

### **SQLite Database**

Stores timestamped health data.

### **Flask REST API**

Used by the dashboard to fetch live and historical vitals.

---

## **Setup on a fresh Raspberry Pi OS**
---

### 1) Update

```bash
sudo apt update && sudo apt upgrade -y
```

### 2) Install Mosquitto (MQTT broker)

```bash
sudo apt install mosquitto mosquitto-clients -y
sudo systemctl enable mosquitto
```

### 3) Install Python & dependencies

```bash
sudo apt install python3 python3-pip -y
pip install -r requirements.txt
```

### **requirements.txt**

```
flask
flask-cors
paho-mqtt
```

### 4) Run backend

```bash
python3 main.py
```

### Flask API runs at:

```
http://<raspberry-pi-ip>:5000
```

---

# **Backend API Documentation**
---

### **GET /latest**

Returns the most recent reading.

### **GET /data**

Returns the last 10 readings.

### **POST /upload**

Manual data insert.

Payload:

```json
{
  "heartRate": 75,
  "spo2": 98,
  "temperatureC": 36.8,
  "steps": 4
}
```

---

#**3. Web Dashboard (React + Tailwind + ShadCN)**
---

A modern, responsive UI showing:

- Live heart rate + SpO₂
- Step count
- Real-time charts
- Device management
- Health evaluation (healthy / caution / critical)
- History export to CSV

---

## **Setup**
---

### 1) Install dependencies

```bash
npm install
```

### 2) Run dev server

```bash
npm run dev
```

The dashboard will be available at:

```
http://localhost:5173
```

Make sure your Raspberry Pi backend is running on:

```
http://localhost:5000
(or replace API_BASE_URL)
```

---

# **Health Evaluation Logic**
---

Values flagged as:

* **Healthy**
* **Caution**
* **Critical**

Used in:

* Dashboard alerts
* Status badges
* CSV export

---

# **Configuration**
---

Backend config:
`raspberry-pi/app/config.py`

```
MQTT_BROKER = "localhost"
MQTT_PORT = 1883
MQTT_TOPIC = "esp32/health"

SQLITE_DB = "health_data.db"
FLASK_PORT = 5000
```

Dashboard config:
`src/pages/Dashboard.tsx`

```
const API_BASE_URL = "http://localhost:5000";
```

Change these if hosting on different devices.

---

# 🧑‍💻 **Author**
---

Built with ❤️ for learning, IoT experimentation, and health-tech prototyping.

