import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import { createSoldier } from "../repositories/soldierRepository.js";
import type { Soldier } from "../types/soldierType.js";
import { RANKS } from "../types/soldierType.js";
import { CustomError } from "../errors/conflictError.js";

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

export { createSoldierHandler };
