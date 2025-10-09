import { getDb } from "../db.js";
import type { Duty } from "../types/dutyType.js";

const COLLECTION_NAME = "duties";

const createDuty = async (duty: Duty) => {
  return await getDb().collection<Duty>(COLLECTION_NAME).insertOne(duty);
};

export { createDuty };
