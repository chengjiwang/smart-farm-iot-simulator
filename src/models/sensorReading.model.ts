import { Schema, model, Document } from "mongoose";
import { SensorType } from "../types/sensor.types";

export interface ISensorReading extends Document {
  sensorId: string;
  farmId: string;
  type: SensorType;
  value: number;
  unit: string;
  recordedAt: Date;
  createdAt: Date;
}

const SensorReadingSchema = new Schema<ISensorReading>(
  {
    sensorId: { type: String, required: true, index: true },
    farmId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(SensorType), required: true },
    value: { type: Number, required: true },
    unit: { type: String, required: true },
    recordedAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "sensor_readings",
  },
);

export const SensorReading = model<ISensorReading>(
  "SensorReading",
  SensorReadingSchema,
);
