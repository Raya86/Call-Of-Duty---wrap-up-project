import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { RANKS } from "../types/soldierType.js";
import type {
  Soldier,
  SoldierId,
  SoldierPartial,
} from "../types/soldierType.js";
import { CustomError } from "../errors/conflictError.js";
import {
  createSoldier,
  getSoldierById,
  getSoldiersQuery,
  deleteSoldierById,
} from "../repositories/soldierRepository.js";

const adjustNameValue = (soldier: Soldier) => {
  if (soldier.rank.name === undefined) {
    soldier.rank.name = RANKS[soldier.rank.value as keyof typeof RANKS];
  }

  if (soldier.rank.value === undefined) {
    soldier.rank.value = Number(
      Object.keys(RANKS).find(
        (key) =>
          RANKS[key as unknown as keyof typeof RANKS] === soldier.rank.name
      )
    );
  }
};

const createSoldierHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    let soldier = req.body as Soldier;
    adjustNameValue(soldier);
    await createSoldier(soldier);

    return res.status(StatusCodes.CREATED).send(soldier);
  } catch (err: any) {
    if (err.name === "ZodError") {
      throw err;
    }

    if (err.code === 11000) {
      throw new CustomError(
        "ConflictError",
        "soldier already exists",
        StatusCodes.CONFLICT
      );
    }
  }
};

const getSoldierHandler = async (
  req: FastifyRequest<{ Params: SoldierId }>,
  res: FastifyReply
) => {
  try {
    const soldier = await getSoldierById(req.params.id);

    if (!soldier) {
      throw new CustomError(
        "NotFoundError",
        "soldier not found",
        StatusCodes.NOT_FOUND
      );
    }

    return res.status(StatusCodes.OK).send(soldier);
  } catch (err: any) {
    throw err;
  }
};

const getSoldiersQueryHandler = async (
  req: FastifyRequest<{ Querystring: SoldierPartial }>,
  res: FastifyReply
) => {
  try {
    const soldiers = await getSoldiersQuery(req.query);

    return res.status(StatusCodes.OK).send(soldiers);
  } catch (err: any) {
    throw err;
  }
};

const deleteSoldierHandler = async (
  req: FastifyRequest<{ Params: SoldierId }>,
  res: FastifyReply
) => {
  try {
    const deleteRes = await deleteSoldierById(req.params.id);

    if (deleteRes.deletedCount === 0) {
      throw new CustomError(
        "NotFoundError",
        "soldier not found",
        StatusCodes.NOT_FOUND
      );
    }

    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (err: any) {
    throw err;
  }
};

export {
  createSoldierHandler,
  getSoldierHandler,
  getSoldiersQueryHandler,
  deleteSoldierHandler,
};
