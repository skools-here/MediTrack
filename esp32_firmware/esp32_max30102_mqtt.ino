#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "heartRate.h"
#include <WiFi.h>
#include <PubSubClient.h>

MAX30105 particleSensor;

const char* ssid = "ifon";
const char* password = "niftylake";
const char* mqtt_server = "172.20.10.4";
const int mqtt_port = 1883;
const char* topic = "esp32/health";

WiFiClient espClient;
PubSubClient client(espClient);

//buffers for storage of ir and red
uint32_t irBuffer[100]; 
uint32_t redBuffer[100];

int32_t bufferLength;   //data length
int32_t spo2;
int8_t validSPO2;
int32_t heartRate;
int8_t validHeartRate;

void connectWiFi() {
  Serial.print("Connecting to WiFi ");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi connected! IP: " + WiFi.localIP().toString());
}

void reconnectMQTT() {
  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_MAX30102")) {
      Serial.println("connected!");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5s");
      delay(5000);
    }
  }
}

void setup() {
  Serial.begin(115200);
  delay(1000);
  Serial.println("Initializing MAX30102 sensor...");

  Wire.begin(21, 22);    //SDA=21, SCL=22 pins
  Wire.setClock(400000); //clock to 400kHz

  //initialize sensor
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    Serial.println("MAX30102 not found. Please check wiring!");
    while (1) {
      delay(1000);
    }
  }

  // turn on sensor
  byte ledBrightness = 80;  // 0 = Off to 255 = 50mA
  byte sampleAverage = 4;
  byte ledMode = 2;         // 1 = Red only, 2 = Red + IR
  byte sampleRate = 100;    // Hz
  int pulseWidth = 411;     // 69, 118, 215, 411
  int adcRange = 16384;      // 2048, 4096, 8192, 16384

  particleSensor.setup(ledBrightness, sampleAverage, ledMode, sampleRate, pulseWidth, adcRange);
  particleSensor.enableDIETEMPRDY();  //temperature sensor on 

  connectWiFi();
  client.setServer(mqtt_server, mqtt_port);

  Serial.println("sensor initialized");
  Serial.println("place finger on the sensor");
  delay(2000);
}

void loop() {
  if(!client.connected()) reconnectMQTT();
  client.loop();

  bufferLength = 100;  //stores 4 seconds of samples running at 25sps
  delay(1000);

  //starting 100 samples
  for (byte i = 0; i < bufferLength; i++) {
    while (particleSensor.available() == false)
      particleSensor.check(); //wait for new data

    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();

    Serial.print("red=");
    Serial.print(redBuffer[i]);
    Serial.print(", ir=");
    Serial.println(irBuffer[i]);
  }

  //initial value
  maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);

  while (true) {
    for (byte i = 25; i < 100; i++) {
      redBuffer[i - 25] = redBuffer[i];
      irBuffer[i - 25] = irBuffer[i];
    }

    // Take 25 new samples
    for (byte i = 75; i < 100; i++) {
      while (particleSensor.available() == false)
        particleSensor.check();

      redBuffer[i] = particleSensor.getRed();
      irBuffer[i] = particleSensor.getIR();
      particleSensor.nextSample();

      // Display values
      Serial.print("red=");
      Serial.print(redBuffer[i]);
      Serial.print(", ir=");
      Serial.print(irBuffer[i]);

      Serial.print(", HR=");
      Serial.print(heartRate);
      Serial.print(", HRvalid=");
      Serial.print(validHeartRate);

      Serial.print(", SPO2=");
      Serial.print(spo2);
      Serial.print(", SPO2valid=");
      Serial.print(validSPO2);

      //new temperature reading every 25 cycles
      if (i % 25 == 0) {
        float tempC = particleSensor.readTemperature();
        float tempF = particleSensor.readTemperatureF();

        String payload = "{";
        payload += "\"heartRate\":" + String(heartRate) + ",";
        payload += "\"spo2\":" + String(spo2) + ",";
        payload += "\"temperatureC\":" + String(tempC, 2);
        payload += "}";

        // Publish via MQTT
        // only send if valid
        if (validSPO2 && validHeartRate) {
          String payload = "{";
          payload += "\"heartRate\":" + String(heartRate) + ",";
          payload += "\"spo2\":" + String(spo2) + ",";
          payload += "\"temperatureC\":" + String(tempC, 2);
          payload += "}";

          if (client.publish(topic, payload.c_str())) {
              Serial.println("\n✅ Published valid data: " + payload);
          } else {
              Serial.println("\n⚠️ Publish failed!");
          }
        } else {
            Serial.println("⚠️ Invalid reading, skipping publish...");
        }

        Serial.print(", TempC=");
        Serial.print(tempC, 2);
        Serial.print(", TempF=");
        Serial.print(tempF, 2);
      }

      Serial.println();
      delay(20);
    }

    //recalculate the heartrate
    maxim_heart_rate_and_oxygen_saturation(irBuffer, bufferLength, redBuffer, &spo2, &validSPO2, &heartRate, &validHeartRate);
  }
}