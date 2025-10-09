import { z } from "zod";
import { OutputSoldierSchema } from "./soldierType.js";

/////////////
// SCHEMAS //
/////////////

const geoJSONPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).min(2),
});

const DutyBaseSchema = z
  .object({
    name: z.string().min(3).max(50),
    description: z.string(),
    location: geoJSONPointSchema,
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    constraints: z.array(z.string()).default([]),
    soldiersRequired: z.number(),
    value: z.number().min(0),
    minRank: z.number().int().min(0).max(6).optional(),
    maxRank: z.number().int().min(0).max(6).optional(),
    createdAt: z.coerce.date().default(() => new Date()),
    updatedAt: z.coerce.date().default(() => new Date()),
  })
  .refine((data) => data.startTime.getTime() < data.endTime.getTime(), {
    message: "start date must be before end date",
  })
  .refine((data) => data.startTime.getTime() > new Date().getTime(), {
    message: "start date must be in the future",
  })
  .refine(
    (data) =>
      data.minRank == null ||
      data.maxRank == null ||
      data.minRank < data.maxRank,
    {
      message: "min rank must be in smaller then max rank",
    }
  );

const statusHistorySchema = z.object({
  status: z.string().default("unscheduled"),
  date: z.coerce.date(),
});

const DutyDbInputSchema = DutyBaseSchema.safeExtend({
  soldiers: z.array(OutputSoldierSchema).default([]),
  status: statusHistorySchema.shape.status,
  statusHistory: z.array(statusHistorySchema).optional(),
}).transform((data) => {
  const now = new Date();
  return {
    ...data,
    statusHistory: data.statusHistory?.length
      ? data.statusHistory
      : [{ status: data.status, date: now }],
  };
});

///////////
// TYPES //
///////////

type Duty = z.infer<typeof DutyDbInputSchema>;

export { DutyBaseSchema, DutyDbInputSchema };
export type { Duty };
