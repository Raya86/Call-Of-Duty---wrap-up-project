import fastify from "fastify";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";

const server = fastify();

server.route({
  method: "GET",
  url: "/health",
  schema: {
    response: {
      [StatusCodes.OK]: {
        type: "object",
        properties: {
          status: { type: "string" },
        },
      },
    },
  },
  handler: (_request, reply) =>{
    reply.send({ status: "ok" });
  },
});

const PORT = Number(process.env.PORT) || 3000;
server.listen({ port: PORT }, (err, address) => {
  if (err) {
    console.error(err);
    process.exitCode = 1
  }
});
