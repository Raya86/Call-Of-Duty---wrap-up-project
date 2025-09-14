import { getDb } from "../db.js";
import type {
  Soldier,
  SoldierPartial,
  SoldierUpdate,
} from "../types/soldierType.js";

const COLLECTION_NAME = "soldiers";

const createSoldier = async (soldier: Soldier) => {
  return await getDb().collection<Soldier>(COLLECTION_NAME).insertOne(soldier);
};

const getSoldierById = async (id: string) => {
  return await getDb()
    .collection<Soldier>(COLLECTION_NAME)
    .findOne({ _id: id });
};

const getAllSoldiers = async (query: SoldierPartial) => {
  return await getDb()
    .collection<Soldier>(COLLECTION_NAME)
    .find(query)
    .toArray();
};

const deleteSoldierById = async (id: string) => {
  return await getDb()
    .collection<Soldier>(COLLECTION_NAME)
    .deleteOne({ _id: id });
};

const updateSoldier = async (id: string, soldier: SoldierUpdate) => {
  return await getDb()
    .collection<Soldier>(COLLECTION_NAME)
    .updateOne(
      { _id: id },
      { $set: soldier, $currentDate: { updatedAt: true } }
    );
};

export {
  createSoldier,
  getSoldierById,
  getAllSoldiers,
  deleteSoldierById,
  updateSoldier,
};
