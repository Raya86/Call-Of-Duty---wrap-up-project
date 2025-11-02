import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { StatusCodes } from "http-status-codes";
import z from "zod";
import {
	appendLimitationsHandler,
	createSoldierHandler,
	deleteSoldierHandler,
	getSoldierHandler,
	getSoldiersQueryHandler,
	updateSoldierHandler,
} from "../controllers/soldierController.js";
import {
	BadRequestSchema,
	ErrorSchema,
	GetSoldierSchema,
	IdSchema,
	NoContentSchema,
	OutputSoldierSchema,
	SoldierBaseSchema,
	SoldierQuerySchema,
	SoldierUpdateSchema,
} from "../types/soldierType.js";

const soldierRouter = async (app: FastifyInstance) => {
	const server = app.withTypeProvider<ZodTypeProvider>();
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
		createSoldierHandler,
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
		getSoldierHandler,
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
		getSoldiersQueryHandler,
	);
	server.delete(
		"/:id",
		{
			schema: {
				params: IdSchema,
				response: {
					[StatusCodes.NO_CONTENT]: NoContentSchema,
					[StatusCodes.BAD_REQUEST]: BadRequestSchema,
					[StatusCodes.NOT_FOUND]: ErrorSchema,
					[StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
				},
			},
		},
		deleteSoldierHandler,
	);
	server.patch(
		"/:id",
		{
			schema: {
				body: SoldierUpdateSchema,
				response: {
					[StatusCodes.OK]: OutputSoldierSchema,
					[StatusCodes.BAD_REQUEST]: BadRequestSchema,
					[StatusCodes.NOT_FOUND]: ErrorSchema,
					[StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
				},
			},
		},
		updateSoldierHandler,
	);
	server.put(
		"/:id/limitations",
		{
			schema: {
				params: IdSchema,
				body: SoldierUpdateSchema,
				response: {
					[StatusCodes.OK]: OutputSoldierSchema,
					[StatusCodes.BAD_REQUEST]: BadRequestSchema,
					[StatusCodes.NOT_FOUND]: ErrorSchema,
					[StatusCodes.INTERNAL_SERVER_ERROR]: ErrorSchema,
				},
			},
		},
		appendLimitationsHandler,
	);
};

export { soldierRouter };
