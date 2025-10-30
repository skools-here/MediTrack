# ESP32 Firmware - Smart Health Monitor

Firmware for the ESP32 + MAX30102 wearable sensor.

## Dependencies

- SparkFun MAX3010x Sensor Library
  - "SparkFun MAX3010x Sensor Library" [GitHub](https://github.com/knolleary/pubsubclient)
- PubSubClient (MQTT)
  - "PubSubClient" [GitHub](https://github.com/sparkfun/SparkFun_MAX3010x_Sensor_Library)

If using PlatformIO, these install automatically.  
If using Arduino IDE, install manually via **Sketch → Include Library → Manage Libraries...**.

## Upload Steps

1. Connect ESP32.
2. Open 'esp32_max30102_mqtt.ino' in Arduino IDE.
3. Set board to **ESP32 Dev Module**.
4. Flash at 115200 baud rate.

## MQTT Data Format

Data sent to the MQTT broker ('esp32/health') is formatted in:

```json
{
  "heartRate": 82,
  "spo2": 98,
  "temperatureC": 36.5
}
```
