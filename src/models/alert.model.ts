import { Schema, model, Document } from "mongoose";
import { SensorType } from "../types/sensor.types";

export interface IAlert extends Document {
  sensorId: string;
  farmId: string;
  type: SensorType;
  value: number;
  threshold: number;
  condition: "above" | "below";
  message: string;
  resolved: boolean;
  triggeredAt: Date;
  createdAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    sensorId: { type: String, required: true, index: true },
    farmId: { type: String, required: true, index: true },
    type: { type: String, enum: Object.values(SensorType), required: true },
    value: { type: Number, required: true },
    threshold: { type: Number, required: true },
    condition: { type: String, enum: ["above", "below"], required: true },
    message: { type: String, required: true },
    resolved: { type: Boolean, default: false },
    triggeredAt: { type: Date, required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: "alerts",
  },
);

export const Alert = model<IAlert>("Alert", AlertSchema);
