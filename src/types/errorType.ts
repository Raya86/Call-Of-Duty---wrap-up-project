import { z } from "zod";

/////////////
// SCHEMAS //
/////////////

const ErrorSchema = z.object({ error: z.string() });

const BadRequestSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  error: z.string(),
  message: z.string(),
});

const NoContentSchema = z.null();

///////////
// TYPES //
///////////

export { ErrorSchema, BadRequestSchema, NoContentSchema };
