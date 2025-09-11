import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import {
  createSoldier,
  getSoldierById,
  getAllSoldiers,
  deleteSoldierById,
} from "../repositories/soldierRepository.js";
import {
  SoldierBaseSchema,
  Soldier,
  SoldierId,
  SoldierPartial,
} from "../types/soldierType.js";

const NAME_TO_VALUE = new Map<string, number>([
  ["private", 0],
  ["corporal", 1],
  ["sergeant", 2],
  ["lieutenant", 3],
  ["captain", 4],
  ["major", 5],
  ["colonel", 6],
]);

const VALUE_TO_NAME = new Map<number, string>([
  [0, "private"],
  [1, "corporal"],
  [2, "sergeant"],
  [3, "lieutenant"],
  [4, "captain"],
  [5, "major"],
  [6, "colonel"],
]);

const adjustNameValue = (soldier: Soldier) => {
  if (soldier.rank.name === undefined) {
    soldier.rank.name = VALUE_TO_NAME.get(soldier.rank.value!);
  }

  if (soldier.rank.value === undefined) {
    soldier.rank.value = NAME_TO_VALUE.get(soldier.rank.name?.toLowerCase()!);
  }
};

const createSoldierHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    let soldier = SoldierBaseSchema.parse(req.body);
    adjustNameValue(soldier);
    await createSoldier(soldier);

    return res.status(StatusCodes.CREATED).send(soldier);
  } catch (err: any) {
    if (err.name === "ZodError") {      
      throw err;
    }

    if (err.code === 11000) {
      return res
        .status(StatusCodes.CONFLICT)
        .send({ error: "Soldier already exists" });
    }

    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Internal server error" });
  }
};

const getSoldierHandler = async (
  req: FastifyRequest<{ Params: SoldierId }>,
  res: FastifyReply
) => {
  try {
    const soldier = await getSoldierById(req.params.id);

    if (!soldier) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ error: "Soldier not found" });
    }

    return res.status(StatusCodes.OK).send(soldier);
  } catch {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Internal server error" });
  }
};

const getAllSoldiersHandler = async (
  req: FastifyRequest<{ Querystring: SoldierPartial }>,
  res: FastifyReply
) => {
  try {
    const soldiers = await getAllSoldiers(req.query);

    return res.status(StatusCodes.OK).send(soldiers);
  } catch {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Internal server error" });
  }
};

const deleteSoldierHandler = async (
  req: FastifyRequest<{ Params: SoldierId }>,
  res: FastifyReply
) => {
  try {
    const deleteRes = await deleteSoldierById(req.params.id);

    if (deleteRes.deletedCount === 0) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .send({ error: "Soldier not found" });
    }

    return res.status(StatusCodes.NO_CONTENT).send();
  } catch {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .send({ error: "Internal server error" });
  }
};

export {
  createSoldierHandler,
  getSoldierHandler,
  getAllSoldiersHandler,
  deleteSoldierHandler,
};
