export const MQTT_CONFIG = {
  brokerUrl: process.env.MQTT_BROKER_URL || "mqtts://localhost",
  port: parseInt(process.env.MQTT_PORT || "8883", 10),
  username: process.env.MQTT_USERNAME || "",
  password: process.env.MQTT_PASSWORD || "",
  clientId: `smart-farm-${Date.now()}`,
};
