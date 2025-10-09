import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import type { Duty } from "../types/dutyType.js";
import { createDuty } from "../repositories/dutyRepository.js";

const createDutyHandler = async (req: FastifyRequest, res: FastifyReply) => {
  try {
    const duty = req.body as Duty;
    await createDuty(duty);

    return res.status(StatusCodes.CREATED).send(duty);
  } catch (err: any) {
    if (err.name === "ZodError") {
      throw err;
    }
  }
};

export { createDutyHandler };
