import { SensorPayload, SensorType } from "../types/sensor.types";
import { Alert } from "../models/alert.model";

const THRESHOLDS: Partial<
  Record<SensorType, { above?: number; below?: number }>
> = {
  [SensorType.TEMPERATURE]: { above: 35, below: 10 },
  [SensorType.HUMIDITY]: { above: 85, below: 30 },
  [SensorType.SOIL_MOISTURE]: { below: 20 },
  [SensorType.EC]: { above: 3.5 },
};

const UNITS: Record<SensorType, string> = {
  [SensorType.TEMPERATURE]: "°C",
  [SensorType.HUMIDITY]: "%",
  [SensorType.SOIL_MOISTURE]: "%",
  [SensorType.EC]: "mS/cm",
};

export async function checkAndCreateAlert(
  payload: SensorPayload,
): Promise<void> {
  const rule = THRESHOLDS[payload.type];
  if (!rule) return;

  const unit = UNITS[payload.type];

  if (rule.above !== undefined && payload.value > rule.above) {
    // 超過上限 → 建立一筆 condition: "above" 的警報
    const message = `${payload.type} 過高：${payload.value}${unit} 超過閾值 ${rule.above}${unit}`;
    console.warn(`[ALERT] ${message}`);
    await Alert.create({
      sensorId: payload.sensorId,
      farmId: payload.farmId,
      type: payload.type,
      value: payload.value,
      threshold: rule.above,
      condition: "above",
      message,
      resolved: false,
      triggeredAt: new Date(payload.recordedAt),
    });
  }

  if (rule.below !== undefined && payload.value < rule.below) {
    // 低於下限 → 建立一筆 condition: "below" 的警報
    const message = `${payload.type} 過低：${payload.value}${unit} 低於閾值 ${rule.below}${unit}`;
    console.warn(`[ALERT] ${message}`);
    await Alert.create({
      sensorId: payload.sensorId,
      farmId: payload.farmId,
      type: payload.type,
      value: payload.value,
      threshold: rule.below,
      condition: "below",
      message,
      resolved: false,
      triggeredAt: new Date(payload.recordedAt),
    });
  }
}
