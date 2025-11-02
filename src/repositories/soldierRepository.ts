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

const getSoldiersQuery = async (query: SoldierPartial) => {
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

const updateLimitations = async (
  id: string,
  soldierLimitations: SoldierUpdate
) =>
  await getDb()
    .collection<Soldier>(COLLECTION_NAME)
    .updateOne(
      { _id: id },
      {
        $addToSet: { limitations: { $each: soldierLimitations.limitations } },
        $currentDate: { updatedAt: true },
      }
    );

const SOLDIERS = [
  {
    _id: "1122334",
    name: "Johny a",
    rank: {
      value: 5,
      name: "major",
    },
    limitations: ["night missions", "high altitude"],
    createdAt: new Date("2025-09-01T14:12:14.490Z"),
    updatedAt: new Date("2025-09-01T14:12:14.490Z"),
  },
  {
    _id: "1234567",
    name: "John Doe",
    rank: {
      name: "Captain",
      value: 4,
    },
    limitations: ["night missions", "high altitude"],
    createdAt: new Date("2025-09-02T13:17:52.376Z"),
    updatedAt: new Date("2025-09-02T13:17:52.376Z"),
  },
  {
    _id: "1234568",
    name: "check array",
    rank: {
      value: 3,
      name: "lieutenant",
    },
    limitations: ["food", "standing"],
    createdAt: new Date("2025-09-10T12:29:40.048Z"),
    updatedAt: new Date("2025-09-10T12:29:40.048Z"),
  },
];

const insertAllSoldiers = async () =>
  await getDb().collection<Soldier>(COLLECTION_NAME).insertMany(SOLDIERS);

const deleteAllSoldiers = async () =>
  await getDb().collection<Soldier>(COLLECTION_NAME).deleteMany({});

export {
  createSoldier,
  getSoldierById,
  getSoldiersQuery,
  deleteSoldierById,
  updateSoldier,
  updateLimitations,
  insertAllSoldiers,
  deleteAllSoldiers,
};
