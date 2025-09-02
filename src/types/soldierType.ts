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

const SoldierBaseSchema = z.object({
  _id: z.string().regex(/^\d{7}$/),
  name: z.string().min(3).max(50),
  rank: RankSchema,
  limitations: z
    .array(z.string().transform((str) => str.toLowerCase()))
    .default([]),
  createdAt: z.coerce.date().default(() => new Date()),
  updatedAt: z.coerce.date().default(() => new Date()),
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

const RANKS = {
  0: "private",
  1: "corporal",
  2: "sergeant",
  3: "lieutenant",
  4: "captain",
  5: "major",
  6: "colonel",
} as const;
type Soldier = z.infer<typeof SoldierBaseSchema>;

export {
  RANKS,
  SoldierBaseSchema,
  OutputSoldierSchema,
  ErrorSchema,
  BadRequestSchema,
};
export type { Soldier };
