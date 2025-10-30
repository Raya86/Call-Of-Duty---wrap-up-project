import type { FastifyReply, FastifyRequest } from "fastify";
import { StatusCodes } from "http-status-codes";
import type { Duty, DutyId } from "../types/dutyType.js";
import {
  createDuty,
  deleteDutyById,
  getDutiesQuery,
  getDutyById,
  updateConstraints,
  updateDuty,
} from "../repositories/dutyRepository.js";
import { CustomError } from "../errors/conflictError.js";

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

const getDutiesQueryHandler = async (
  req: FastifyRequest<{ Querystring: Duty }>,
  res: FastifyReply
) => {
  try {
    const duties = await getDutiesQuery(req.query);

    return res.status(StatusCodes.OK).send(duties);
  } catch (err: any) {
    throw err;
  }
};

const getDutyByIdHandler = async (
  req: FastifyRequest<{ Params: DutyId }>,
  res: FastifyReply
) => {
  try {
    const duty = await getDutyById(String(req.params.id));

    if (!duty) {
      throw new CustomError(
        "NotFoundError",
        "duty not found",
        StatusCodes.NOT_FOUND
      );
    }

    return res.status(StatusCodes.OK).send(duty);
  } catch (err: any) {
    throw err;
  }
};

const deleteDutyHandler = async (
  req: FastifyRequest<{ Params: DutyId }>,
  res: FastifyReply
) => {
  try {
    const duty = await getDutyById(String(req.params.id));

    if (!duty) {
      throw new CustomError(
        "NotFoundError",
        "duty not found",
        StatusCodes.NOT_FOUND
      );
    }

    if (duty.status === "scheduled") {
      throw new CustomError(
        "MethodNotAllowed",
        "Scheduled duties cannot be removed",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    await deleteDutyById(String(req.params.id));

    return res.status(StatusCodes.NO_CONTENT).send();
  } catch (err: any) {
    throw err;
  }
};

const updateDutyHandler = async (
  req: FastifyRequest<{ Params: DutyId }>,
  res: FastifyReply
) => {
  try {
    let duty = req.body as Duty;
    const unUpdatedDuty = await getDutyById(String(req.params.id));

    if (unUpdatedDuty!.status === "scheduled") {
      throw new CustomError(
        "MethodNotAllowed",
        "Scheduled duties cannot be updated",
        StatusCodes.METHOD_NOT_ALLOWED
      );
    }
    const lastStatus = unUpdatedDuty!.statusHistory?.at(-1)?.status;

    if (duty.status) {
      if (duty.status !== lastStatus) {
        duty.statusHistory = [
          ...(unUpdatedDuty!.statusHistory ?? []),
          { status: duty.status, date: new Date() },
        ];
      }
    }
    const { modifiedCount } = await updateDuty(String(req.params.id), duty);

    if (modifiedCount < 1) {
      throw new CustomError(
        "NotFoundError",
        "duty not found",
        StatusCodes.NOT_FOUND
      );
    }

    return res
      .status(StatusCodes.OK)
      .send(await getDutyById(String(req.params.id)));
  } catch (err: any) {
    throw err;
  }
};

const appendConstraintsHandler = async (
  req: FastifyRequest<{ Params: DutyId }>,
  res: FastifyReply
) => {
  try {
    const duty = req.body as Duty;
    await updateConstraints(String(req.params.id), duty);

    return res
      .status(StatusCodes.OK)
      .send(await getDutyById(String(req.params.id)));
  } catch (err: any) {
    throw err;
  }
};

export {
  createDutyHandler,
  getDutiesQueryHandler,
  getDutyByIdHandler,
  deleteDutyHandler,
  updateDutyHandler,
  appendConstraintsHandler,
};
