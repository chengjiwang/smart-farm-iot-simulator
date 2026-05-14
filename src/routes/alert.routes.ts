import { Router, Request, Response, IRouter } from "express";
import { Alert } from "../models/alert.model";

const router: IRouter = Router();

router.get("/", async (req: Request, res: Response) => {
  const { farmId, resolved, limit } = req.query as Record<string, string>;
  const filter: Record<string, unknown> = {};
  if (farmId) filter.farmId = farmId;
  if (resolved !== undefined) filter.resolved = resolved === "true";

  const parsedLimit = limit ? parseInt(limit, 10) : 20;
  const [data, total] = await Promise.all([
    Alert.find(filter).sort({ triggeredAt: -1 }).limit(parsedLimit).lean(),
    Alert.countDocuments(filter),
  ]);
  res.json({ data, total });
});

router.patch("/:alertId/resolve", async (req: Request, res: Response) => {
  const { alertId } = req.params;
  const alert = await Alert.findByIdAndUpdate(
    alertId,
    { resolved: true },
    { new: true },
  ).lean();
  if (!alert) {
    res.status(404).json({ message: "Alert not found" });
    return;
  }
  res.json({ data: alert });
});

export default router;
