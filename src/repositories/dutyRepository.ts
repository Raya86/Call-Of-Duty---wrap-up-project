import { getDb } from "../db.js";
import type { Duty } from "../types/dutyType.js";

const COLLECTION_NAME = "duties";

const createDuty = async (duty: Duty) =>
  await getDb().collection<Duty>(COLLECTION_NAME).insertOne(duty);

const getDutiesQuery = async (query: Duty) =>
  await getDb().collection<Duty>(COLLECTION_NAME).find(query).toArray();

export { createDuty, getDutiesQuery };
