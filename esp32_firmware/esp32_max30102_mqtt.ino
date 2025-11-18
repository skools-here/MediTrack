#include <Wire.h>
#include "MAX30105.h"
#include "spo2_algorithm.h"
#include "heartRate.h"
#include <WiFi.h>
#include <PubSubClient.h>
#include <U8g2lib.h>
#include <MPU6050_light.h>

//max30102
MAX30105 particleSensor;
uint32_t irBuffer[100], redBuffer[100];
int32_t bufferLength, spo2, heartRate;
int8_t validSPO2, validHeartRate;

//mpu6050
MPU6050 mpu(Wire);
unsigned long lastStep = 0;
int stepCount = 0;
float stepThreshold = 1.25;

//oled
U8G2_SH1106_128X64_NONAME_F_HW_I2C u8g2(U8G2_R0);

//wifi and mqtt
const char* ssid = "ifon";
const char* password = "niftylake";
const char* mqtt_server = "172.20.10.4";
const int mqtt_port = 1883;
const char* topic = "esp32/health";

WiFiClient espClient;
PubSubClient client(espClient); //for mqtt client handle

//oled show message
void showMessage(String msg) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tf);
  u8g2.setCursor(0, 20);
  u8g2.print(msg);
  u8g2.sendBuffer();
}

//wifi and mqtt setup
void connectWiFi() {
  showMessage("Connecting WiFi...");
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(300);
  }
  
  showMessage("WiFi Connected!");
  delay(800);
}

void reconnectMQTT() {
  while (!client.connected()) {   
    showMessage("Connecting MQTT...");
    if (client.connect("ESP32_MAX30102")) {
      showMessage("MQTT Connected!");
      delay(800);
      return;
    }

    //MQTT error code
    int err = client.state();
    Serial.print("MQTT Error: ");
    Serial.println(err);

    //display error on OLED
    u8g2.clearBuffer();
    u8g2.setFont(u8g2_font_6x12_tf);
    u8g2.setCursor(0, 12);  
    u8g2.print("MQTT Failed!");

    u8g2.setCursor(0, 26);
    u8g2.print("Error Code: ");
    u8g2.print(err);

    u8g2.setCursor(0, 40);
    u8g2.print("Retrying...");

    u8g2.sendBuffer();
    delay(2000);
  }
}

//step detect
void detectSteps() {
  //read new data
  mpu.update();
  
  //overall acceleration magnitude
  float magnitude = sqrt(
    pow(mpu.getAccX(), 2) +
    pow(mpu.getAccY(), 2) +
    pow(mpu.getAccZ(), 2)
  );

  //if acceleration is greater than threshold and 300 milliseconds have passed before last step
  if (magnitude > stepThreshold && millis() - lastStep > 300) {
    stepCount++;
    //debounce timer reset
    lastStep = millis();
  }
}

//oled data printing
void displayOLED(int hr, int spo2Val, float temp, int steps) {
  u8g2.clearBuffer();
  u8g2.setFont(u8g2_font_6x12_tf);

  u8g2.setCursor(0, 12);
  u8g2.print("HR: ");
  u8g2.print(hr);
 
  u8g2.setCursor(0, 24);
  u8g2.print("SPO2: ");
  u8g2.print(spo2Val);
 
  u8g2.setCursor(0, 36);
  u8g2.print("Temp: ");
  u8g2.print(temp, 1);
  u8g2.print("C");
 
  u8g2.setCursor(0, 48);
  u8g2.print("Steps: ");
  u8g2.print(steps);

  u8g2.sendBuffer();
}

//setup
void setup() {
  Serial.begin(115200);
  Wire.begin(21, 22);    //i2c pins
  Wire.setClock(100000); //i2c clock setting

  u8g2.begin();

  //initialize max30102
  if (!particleSensor.begin(Wire, I2C_SPEED_FAST)) {
    showMessage("MAX30102 NOT FOUND!");
    while (1);
  }
  particleSensor.setup(80, 4, 2, 100, 411, 16384); //data reading values
  particleSensor.enableDIETEMPRDY();  //temperature sensor enable

  //initialize mpu6050
  showMessage("Initializing MPU...");
  if (mpu.begin() != 0) {
    showMessage("MPU ERROR!");
    while (1);
  }

  //calibrates the mpu when turning on
  mpu.calcOffsets();
  delay(500);

  //starting wifi and mqtt
  connectWiFi();
  client.setServer(mqtt_server, mqtt_port);

  delay(1500);
  showMessage("Place Finger...");
}

//loop
void loop() {
  if (!client.connected()) reconnectMQTT();
  client.loop();

  //mpu new data read
  mpu.update();
  detectSteps();

  //500 ms delay between readings
  static unsigned long lastSample = 0;
  if (millis() - lastSample < 500) {  
    displayOLED(heartRate, spo2, particleSensor.readTemperature(), stepCount);
    return;
  }
  lastSample = millis();

  //buffer for the max30102 sensor
  bufferLength = 100;

  for (byte i = 0; i < bufferLength; i++) {
    while (!particleSensor.available()) particleSensor.check();

    //saving values in the buffer
    redBuffer[i] = particleSensor.getRed();
    irBuffer[i] = particleSensor.getIR();
    particleSensor.nextSample();

    //keeps counting during the hearbeat sampling
    mpu.update();
    detectSteps();
  }
  
  //calculates heartrate
  maxim_heart_rate_and_oxygen_saturation(
    irBuffer, bufferLength, redBuffer,
    &spo2, &validSPO2, &heartRate, &validHeartRate
  );

  float tempC = particleSensor.readTemperature();

  //creates payload and publishes to topic via pubsubclient
  if (validHeartRate && validSPO2) {
    String payload = "{";
    payload += "\"heartRate\":" + String(heartRate) + ",";
    payload += "\"spo2\":" + String(spo2) + ",";
    payload += "\"temperatureC\":" + String(tempC, 2) + ",";
    payload += "\"steps\":" + String(stepCount);
    payload += "}";
    client.publish(topic, payload.c_str());
  }

  displayOLED(heartRate, spo2, tempC, stepCount);
}
