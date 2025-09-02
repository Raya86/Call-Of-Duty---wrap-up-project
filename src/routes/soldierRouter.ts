import type { FastifyInstance } from "fastify";
import { createSoldierHandler } from "../controllers/soldierController.js";
import {
  BadRequestSchema,
  ErrorSchema,
  OutputSoldierSchema,
  SoldierBaseSchema,
} from "../types/soldierType.js";
import { StatusCodes } from "http-status-codes";

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
};

export { soldierRouter };
