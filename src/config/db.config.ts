import { ConnectOptions } from "mongoose";

export const DB_CONFIG: { uri: string; options: ConnectOptions } = {
  uri: process.env.MONGODB_URI || "mongodb://localhost:27017/smart-farm",
  options: {},
};
