import { Router, Request, Response, IRouter } from "express";
import {
  getSensorReadings,
  getLatestReadings,
  getSensorHistory,
} from "../services/sensor.service";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  const { farmId, type, limit, startTime, endTime } = req.query as Record<
    string,
    string
  >;
  const result = await getSensorReadings({
    farmId,
    type,
    limit: limit ? parseInt(limit, 10) : undefined,
    startTime,
    endTime,
  });
  res.json(result);
});

router.get("/latest", async (req: Request, res: Response) => {
  const { farmId } = req.query as Record<string, string>;
  const result = await getLatestReadings(farmId);
  res.json(result);
});

router.get("/:sensorId/history", async (req: Request, res: Response) => {
  const sensorId = String(req.params.sensorId);
  const { limit } = req.query as Record<string, string>;
  const result = await getSensorHistory(
    sensorId,
    limit ? parseInt(limit, 10) : undefined,
  );
  res.json(result);
});

export default router;
