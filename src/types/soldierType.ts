import { z } from "zod";

/////////////
// SCHEMAS //
/////////////

const IdSchema = z.object({
  id: z.string().regex(/^\d{7}$/),
});

const RankDbInputSchema = z
  .object({
    name: z.string().optional(),
    value: z.coerce.number().int().min(0).max(6).optional(),
  })
  .refine((schema) => {
    return !(
      (schema.name === undefined && schema.value === undefined) ||
      (schema.name !== undefined && schema.value !== undefined)
    );
  });

const RankDbOutputSchema = z.object({
  name: z.string(),
  value: z.number().int().min(0).max(6),
});

const checkDate = () =>
  z.preprocess((val) => {
    if (val instanceof Date) {
      return val;
    }

    if (typeof val === "string" || typeof val === "number") {
      const d = new Date(val);
      if (!isNaN(d.getTime())) {
        return d;
      }
    }

    return new Date();
  }, z.date());

const SoldierBaseSchema = z.object({
  _id: IdSchema.shape.id,
  name: z.string().min(3).max(50),
  rank: RankDbInputSchema,
  limitations: z
    .array(
      z
        .string()
        .min(1)
        .transform((str) => str.toLowerCase())
    )
    .default([]),
  createdAt: checkDate(),
  updatedAt: checkDate(),
});

const OutputSoldierSchema = SoldierBaseSchema.extend({
  rank: RankDbOutputSchema,
});

const ErrorSchema = z.object({ error: z.string() });

const BadRequestSchema = z.object({
  statusCode: z.number(),
  code: z.string(),
  error: z.string(),
  message: z.string(),
});

const NoContentSchema = z.null();

const limitationsToArray = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split(",")))
  .transform((arr) => arr.map((s) => s.trim().toLowerCase()));

const SoldierQuerySchema = SoldierBaseSchema.extend({
  limitations: limitationsToArray.optional(),
  rankName: z.string().optional(),
  rankValue: z.coerce.number().int().optional(),
})
  .partial()
  .transform((data) => {
    const { rankName, rankValue, limitations, ...rest } = data;

    return {
      ...rest,
      ...(rankName !== undefined ? { ["rank.name"]: rankName } : {}),
      ...(rankValue !== undefined ? { ["rank.value"]: rankValue } : {}),
      ...(limitations !== undefined && limitations.length > 0
        ? { limitations: { $all: limitations } }
        : {}),
    };
  });

const GetSoldierSchema = SoldierBaseSchema.extend({
  rank: RankDbOutputSchema,
});

const SoldierUpdateSchema = SoldierBaseSchema.extend({
  limitations: limitationsToArray.optional(),
}).partial();

///////////
// TYPES //
///////////

type Soldier = z.infer<typeof SoldierBaseSchema>;
type SoldierId = { id: string };
type SoldierPartial = z.infer<typeof SoldierQuerySchema>;
type SoldierUpdate = z.infer<typeof SoldierUpdateSchema>;

export {
  SoldierBaseSchema,
  OutputSoldierSchema,
  ErrorSchema,
  BadRequestSchema,
  NoContentSchema,
  IdSchema,
  SoldierQuerySchema,
  GetSoldierSchema,
  SoldierUpdateSchema,
};
export type { Soldier, SoldierId, SoldierPartial, SoldierUpdate };
