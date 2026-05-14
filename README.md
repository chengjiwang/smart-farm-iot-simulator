# smart-farm-iot-simulator

智慧農場 IoT 感測器模擬平台，模擬溫度、濕度、土壤濕度與 EC 值等感測器資料的收集、儲存與即時告警系統。

## Tech Stack

- **Runtime：** Node.js + TypeScript
- **Web Framework：** Express 5
- **Message Broker：** MQTT (HiveMQ Cloud)
- **Database：** MongoDB + Mongoose
- **Package Manager：** pnpm

## 系統架構

```
┌─────────────────────┐     MQTT Publish      ┌─────────────────┐
│  Sensor Simulator   │  ─────────────────►   │                 │
│  (publisher.ts)     │                        │  HiveMQ Cloud   │
│                     │                        │  MQTT Broker    │
│  - 溫度 sensor      │                        │                 │
│  - 濕度 sensor      │  ◄─────────────────    │                 │
│  - 土壤濕度 sensor  │     MQTT Subscribe     └─────────────────┘
│  - EC值 sensor      │                               │
└─────────────────────┘                               │ Subscribe
                                                       ▼
                                        ┌─────────────────────────┐
                                        │   Node.js Subscriber    │
                                        │   (subscriber.ts)       │
                                        │                         │
                                        │  - 接收資料             │
                                        │  - 資料驗證             │
                                        │  - 觸發告警邏輯         │
                                        │  - 寫入 MongoDB         │
                                        └───────────┬─────────────┘
                                                    │
                                        ┌───────────▼─────────────┐
                                        │   Express REST API      │
                                        │   (server.ts)           │
                                        │                         │
                                        │  GET  /api/sensors      │
                                        │  GET  /api/alerts       │
                                        │  PATCH /api/alerts/:id  │
                                        └───────────┬─────────────┘
                                                    │
                                        ┌───────────▼─────────────┐
                                        │       MongoDB           │
                                        │                         │
                                        │  sensor_readings        │
                                        │  alerts                 │
                                        └─────────────────────────┘
```

## 專案結構

```
smart-farm-iot-simulator/
├── src/
│   ├── config/
│   │   ├── mqtt.config.ts        # MQTT Broker 連線設定
│   │   └── db.config.ts          # MongoDB 連線設定
│   ├── models/
│   │   ├── sensorReading.model.ts
│   │   └── alert.model.ts
│   ├── services/
│   │   ├── subscriber.service.ts  # MQTT 訂閱邏輯
│   │   ├── alert.service.ts       # 告警判斷邏輯
│   │   └── sensor.service.ts      # DB 查詢邏輯
│   ├── routes/
│   │   ├── sensor.routes.ts
│   │   └── alert.routes.ts
│   ├── simulator/
│   │   └── publisher.ts           # 感測器模擬發布
│   ├── types/
│   │   └── sensor.types.ts
│   └── server.ts                  # Express App 入口
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 快速開始

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 設定環境變數

複製 `.env.example` 並填入實際設定：

```bash
cp .env.example .env
```

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# MQTT (HiveMQ Cloud)
MQTT_BROKER_URL=mqtts://xxxx.hivemq.cloud
MQTT_PORT=8883
MQTT_USERNAME=your_username
MQTT_PASSWORD=your_password

# Server
PORT=3000

# Simulator
PUBLISH_INTERVAL_MS=5000   # 每 5 秒發一筆
FARM_IDS=farm-A,farm-B     # 模擬的農場清單
```

### 3. 啟動 API Server

```bash
# 開發模式（hot reload）
pnpm dev

# 正式模式
pnpm build && pnpm start
```

### 4. 啟動感測器模擬器

```bash
# 開發模式（hot reload）
pnpm dev:simulator

# 正式模式
pnpm start:simulator
```

## REST API

### Sensors

| Method | Endpoint                         | 說明                       |
| ------ | -------------------------------- | -------------------------- |
| GET    | `/api/sensors`                   | 查詢感測器資料（支援篩選） |
| GET    | `/api/sensors/latest`            | 取得每個感測器最新一筆資料 |
| GET    | `/api/sensors/:sensorId/history` | 取得特定感測器歷史資料     |

**GET `/api/sensors` Query Params**

| 參數        | 說明                 | 預設值 |
| ----------- | -------------------- | ------ |
| `farmId`    | 篩選農場             | —      |
| `type`      | 篩選感測器類型       | —      |
| `limit`     | 筆數限制             | `20`   |
| `startTime` | 起始時間（ISO 8601） | —      |
| `endTime`   | 結束時間（ISO 8601） | —      |

### Alerts

| Method | Endpoint                       | 說明                     |
| ------ | ------------------------------ | ------------------------ |
| GET    | `/api/alerts`                  | 查詢告警紀錄（支援篩選） |
| PATCH  | `/api/alerts/:alertId/resolve` | 將告警標記為已處理       |

**GET `/api/alerts` Query Params**

| 參數       | 說明                             | 預設值 |
| ---------- | -------------------------------- | ------ |
| `farmId`   | 篩選農場                         | —      |
| `resolved` | 篩選處理狀態（`true` / `false`） | —      |
| `limit`    | 筆數限制                         | `20`   |

## MQTT Topic 設計

```
farm/{farmId}/sensor/{sensorType}
```

**範例：**

```
farm/farm-A/sensor/temperature
farm/farm-A/sensor/humidity
farm/farm-A/sensor/soil_moisture
farm/farm-A/sensor/ec
```

**Payload 格式（JSON）：**

```json
{
  "sensorId": "farm-A-temp-01",
  "farmId": "farm-A",
  "type": "temperature",
  "value": 28.5,
  "unit": "°C",
  "recordedAt": "2026-05-13T10:00:00.000Z"
}
```

## 感測器模擬資料範圍

| 感測器   | 正常範圍  | 告警閾值                   | 單位  |
| -------- | --------- | -------------------------- | ----- |
| 溫度     | 15 – 35   | > 35（過高）/ < 10（過低） | °C    |
| 空氣濕度 | 40 – 80   | > 85（過高）/ < 30（過低） | %     |
| 土壤濕度 | 30 – 70   | < 20（過乾）               | %     |
| EC 值    | 1.0 – 3.0 | > 3.5（過高）              | mS/cm |

> 模擬器以 80% 機率產生正常值，20% 機率產生異常值以觸發告警。

## License

MIT License
