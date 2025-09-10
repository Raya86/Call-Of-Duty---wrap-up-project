import type { FastifyInstance } from "fastify";
import {
  BadRequestSchema,
  ErrorSchema,
  OutputSoldierSchema,
  SoldierBaseSchema,
  IdSchema,
  GetSoldierSchema,
  SoldierQuerySchema,
} from "../types/soldierType.js";
import { StatusCodes } from "http-status-codes";
import {
  createSoldierHandler,
  getSoldierHandler,
  getAllSoldiersHandler,
} from "../controllers/soldierController.js";
import z from "zod";

const soldierRouter = async (server: FastifyInstance) => {
  server.post(
    "",
    {
      schema: {
        body: SoldierBaseSchema,
        response: {
          [StatusCodes.CREATED]: OutputSoldierSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.CONFLICT]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    createSoldierHandler
  );
  server.get(
    "/:id",
    {
      schema: {
        params: IdSchema,
        response: {
          [StatusCodes.OK]: OutputSoldierSchema,
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.NOT_FOUND]: ErrorSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getSoldierHandler
  );
  server.get(
    "",
    {
      schema: {
        querystring: SoldierQuerySchema,
        response: {
          [StatusCodes.OK]: z.array(GetSoldierSchema),
          [StatusCodes.BAD_REQUEST]: BadRequestSchema,
          [StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
        },
      },
    },
    getAllSoldiersHandler
  );
};

export { soldierRouter };
