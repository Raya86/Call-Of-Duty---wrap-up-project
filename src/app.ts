import fastify from "fastify";
import {
	serializerCompiler,
	validatorCompiler,
	type ZodTypeProvider,
} from "fastify-type-provider-zod";
import { closeDB, connectDB } from "./db.js";
import { healthRouter } from "./routes/healthRouter.js";
import { soldierRouter } from "./routes/soldierRouter.js";

const buildApp = async () => {
	const app = fastify({
		logger: {
			level: process.env.LOG_LEVEL ?? "info",
		},
	}).withTypeProvider<ZodTypeProvider>();

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	app.addHook("onReady", async () => {
		await connectDB();
		app.log.info("MongoDB connected");
	});
	app.addHook("onClose", async () => {
		await closeDB();
		app.log.info("MongoDB connection closed");
	});

	app.register(healthRouter, { prefix: "health" });
	app.register(soldierRouter, { prefix: "soldiers" });

	return app;
};

export { buildApp };
