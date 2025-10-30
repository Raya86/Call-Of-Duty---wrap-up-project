import { getDb } from "../db.js";
import type { Duty, DutyUpdate } from "../types/dutyType.js";
import { ObjectId } from "mongodb";

const COLLECTION_NAME = "duties";

const createDuty = async (duty: Duty) =>
  await getDb().collection<Duty>(COLLECTION_NAME).insertOne(duty);

const getDutiesQuery = async (query: Duty) =>
  await getDb().collection<Duty>(COLLECTION_NAME).find(query).toArray();

const getDutyById = async (id: string) =>
  await getDb()
    .collection<Duty>(COLLECTION_NAME)
    .findOne({ _id: new ObjectId(id) });

const deleteDutyById = async (id: string) =>
  await getDb()
    .collection<Duty>(COLLECTION_NAME)
    .deleteOne({ _id: new ObjectId(id) });

const updateDuty = async (id: string, duty: DutyUpdate) =>
  await getDb()
    .collection<Duty>(COLLECTION_NAME)
    .updateOne(
      { _id: new ObjectId(id) },
      { $set: duty, $currentDate: { updatedAt: true } }
    );

const updateConstraints = async (id: string, dutyConstraints: DutyUpdate) =>
  await getDb()
    .collection<Duty>(COLLECTION_NAME)
    .updateOne(
      { _id: new ObjectId(id) },
      {
        $addToSet: { constraints: { $each: dutyConstraints.constraints } },
        $currentDate: { updatedAt: true },
      }
    );

export {
  createDuty,
  getDutiesQuery,
  getDutyById,
  deleteDutyById,
  updateDuty,
  updateConstraints,
};
