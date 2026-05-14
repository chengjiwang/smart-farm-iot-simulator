import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import { DB_CONFIG } from "./config/db.config";
import { startSubscriber } from "./services/subscriber.service";
import sensorRoutes from "./routes/sensor.routes";
import alertRoutes from "./routes/alert.routes";

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());

app.use("/api/sensors", sensorRoutes);
app.use("/api/alerts", alertRoutes);

async function bootstrap() {
  await mongoose.connect(DB_CONFIG.uri, DB_CONFIG.options);
  console.log("[DB] MongoDB connected");

  // 啟動 MQTT 訂閱者（開始監聽感測器資料）
  startSubscriber();

  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error("[Bootstrap] Fatal error:", err);
  process.exit(1);
});
