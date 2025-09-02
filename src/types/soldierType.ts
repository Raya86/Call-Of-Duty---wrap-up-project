import { z } from "zod";

/////////////
// SCHEMAS //
/////////////

const RankSchema = z
  .object({
    name: z.string().optional(),
    value: z.number().int().min(0).max(6).optional(),
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
  _id: z.string().regex(/^\d{7}$/),
  name: z.string().min(3).max(50),
  rank: RankSchema,
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

///////////
// TYPES //
///////////

type Soldier = z.infer<typeof SoldierBaseSchema>;

export {
  SoldierBaseSchema,
  OutputSoldierSchema,
  ErrorSchema,
  BadRequestSchema,
};
export type { Soldier };
