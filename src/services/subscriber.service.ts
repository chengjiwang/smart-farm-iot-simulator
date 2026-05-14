import mqtt from "mqtt";
import { MQTT_CONFIG } from "../config/mqtt.config";
import { SensorPayload } from "../types/sensor.types";
import { SensorReading } from "../models/sensorReading.model";
import { checkAndCreateAlert } from "./alert.service";

export function startSubscriber(): void {
  const client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
    port: MQTT_CONFIG.port,
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    clientId: MQTT_CONFIG.clientId,
  });

  client.on("connect", () => {
    console.log("[MQTT] Subscriber connected");
    client.subscribe("farm/+/sensor/+", (err) => {
      if (err) console.error("[MQTT] Subscribe error:", err);
      else console.log("[MQTT] Subscribed to farm/+/sensor/+");
    });
  });

  client.on("message", async (topic, message) => {
    try {
      const payload: SensorPayload = JSON.parse(message.toString());
      // 存入 sensor_readings collection
      await SensorReading.create({
        sensorId: payload.sensorId,
        farmId: payload.farmId,
        type: payload.type,
        value: payload.value,
        unit: payload.unit,
        recordedAt: new Date(payload.recordedAt),
      });
      console.log(`[MQTT] Saved: ${topic} -> ${payload.value} ${payload.unit}`);
      // 檢查是否需要產生警報
      await checkAndCreateAlert(payload);
    } catch (err) {
      console.error("[MQTT] Message processing error:", err);
    }
  });

  client.on("error", (err) => {
    console.error("[MQTT] Connection error:", err);
  });
}
