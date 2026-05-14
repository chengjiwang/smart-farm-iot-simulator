import "dotenv/config";
import mqtt from "mqtt";
import { MQTT_CONFIG } from "../config/mqtt.config";
import { SensorType, SensorPayload } from "../types/sensor.types";

const FARM_IDS = (process.env.FARM_IDS || "farm-A").split(",");
const INTERVAL_MS = parseInt(process.env.PUBLISH_INTERVAL_MS || "5000", 10);

const SENSOR_CONFIGS: Record<
  SensorType,
  { unit: string; normal: [number, number]; anomaly: [number, number] }
> = {
  [SensorType.TEMPERATURE]: {
    unit: "°C",
    normal: [15, 35],
    anomaly: [36, 45],
  },
  [SensorType.HUMIDITY]: { unit: "%", normal: [40, 80], anomaly: [86, 95] },
  [SensorType.SOIL_MOISTURE]: {
    unit: "%",
    normal: [30, 70],
    anomaly: [5, 19],
  },
  [SensorType.EC]: { unit: "mS/cm", normal: [1.0, 3.0], anomaly: [3.6, 5.0] },
};

function randomBetween(min: number, max: number): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

function generateValue(type: SensorType): number {
  const config = SENSOR_CONFIGS[type];
  const isAnomaly = Math.random() < 0.2;
  const [min, max] = isAnomaly ? config.anomaly : config.normal;
  return randomBetween(min, max);
}

export function startPublisher(): void {
  const client = mqtt.connect(MQTT_CONFIG.brokerUrl, {
    port: MQTT_CONFIG.port,
    username: MQTT_CONFIG.username,
    password: MQTT_CONFIG.password,
    clientId: `simulator-${Date.now()}`,
  });

  client.on("connect", () => {
    console.log("[Publisher] Connected to MQTT broker");

    setInterval(() => {
      for (const farmId of FARM_IDS) {
        for (const type of Object.values(SensorType)) {
          const sensorId = `${farmId}-${type}-01`;
          const value = generateValue(type);
          const unit = SENSOR_CONFIGS[type].unit;

          const payload: SensorPayload = {
            sensorId,
            farmId,
            type,
            value,
            unit,
            recordedAt: new Date().toISOString(),
          };

          const topic = `farm/${farmId}/sensor/${type}`;
          client.publish(topic, JSON.stringify(payload), { qos: 1 });
          console.log(`[Publisher] ${topic} -> ${value} ${unit}`);
        }
      }
    }, INTERVAL_MS);
  });

  client.on("error", (err) => {
    console.error("[Publisher] Error:", err);
  });
}

startPublisher();
