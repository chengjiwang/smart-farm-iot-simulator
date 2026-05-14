export enum SensorType {
  TEMPERATURE = "temperature",
  HUMIDITY = "humidity",
  SOIL_MOISTURE = "soil_moisture",
  EC = "ec",
}

export interface SensorPayload {
  sensorId: string;
  farmId: string;
  type: SensorType;
  value: number;
  unit: string;
  recordedAt: string;
}
