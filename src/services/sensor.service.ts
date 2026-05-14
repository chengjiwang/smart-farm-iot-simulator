import { SensorReading } from "../models/sensorReading.model";

export async function getSensorReadings(query: {
  farmId?: string;
  type?: string;
  limit?: number;
  startTime?: string;
  endTime?: string;
}) {
  const filter: Record<string, unknown> = {};
  if (query.farmId) filter.farmId = query.farmId;
  if (query.type) filter.type = query.type;
  if (query.startTime || query.endTime) {
    filter.recordedAt = {};
    if (query.startTime)
      (filter.recordedAt as Record<string, Date>).$gte = new Date(
        query.startTime,
      );
    if (query.endTime)
      (filter.recordedAt as Record<string, Date>).$lte = new Date(
        query.endTime,
      );
  }

  const limit = query.limit ?? 20;
  const [data, total] = await Promise.all([
    SensorReading.find(filter).sort({ recordedAt: -1 }).limit(limit).lean(),
    SensorReading.countDocuments(filter),
  ]);
  return { data, total };
}

export async function getLatestReadings(farmId?: string) {
  const match: Record<string, unknown> = {};
  if (farmId) match.farmId = farmId;

  const data = await SensorReading.aggregate([
    { $match: match },
    { $sort: { recordedAt: -1 } },
    {
      $group: {
        _id: "$sensorId",
        doc: { $first: "$$ROOT" },
      },
    },
    { $replaceRoot: { newRoot: "$doc" } },
  ]);
  return { data };
}

export async function getSensorHistory(sensorId: string, limit = 50) {
  const data = await SensorReading.find({ sensorId })
    .sort({ recordedAt: -1 })
    .limit(limit)
    .lean();
  return { data };
}
