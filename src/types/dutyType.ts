import { z, ZodObject, ZodRawShape } from "zod";
import { OutputSoldierSchema } from "./soldierType.js";
import { ObjectId } from "mongodb";

/////////////
// SCHEMAS //
/////////////

const DutyIdSchema = z.object({
  id: z
    .string()
    .trim()
    .refine((s) => ObjectId.isValid(s))
    .transform((s) => new ObjectId(s)),
});

const geoJSONPointSchema = z.object({
  type: z.literal("Point"),
  coordinates: z.array(z.number()).min(2),
});

const DutyRefinements = <T extends ZodObject<ZodRawShape>>(schema: T) => {
  return schema
    .refine(
      (data: any) => {
        if (data.startTime) {
          return data.startTime.getTime() > new Date().getTime();
        }
        return true;
      },
      { message: "start date must be in the future" }
    )
    .refine(
      (data: any) => {
        if (data.startTime && data.endTime) {
          return data.startTime.getTime() < data.endTime.getTime();
        }
        return true;
      },
      { message: "start date must be before end date" }
    )
    .refine(
      (data: any) =>
        data.minRank == null ||
        data.maxRank == null ||
        data.minRank < data.maxRank,
      { message: "min rank must be smaller than max rank" }
    );
};

const DutyBaseSchema = DutyRefinements(
  z.object({
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

const constraintsToArray = z
  .union([z.array(z.string()), z.string()])
  .transform((v) => (Array.isArray(v) ? v : v.split(",")))
  .transform((arr) => arr.map((s) => s.trim()));

const locationCoordinates = z
  .union([z.string(), z.array(z.union([z.string(), z.number()]))])
  .transform((v) => (Array.isArray(v) ? v : v.split(",")))
  .transform((a) => a.map((x) => (typeof x === "string" ? x.trim() : x)))
  .transform((a) => a.map((x) => (typeof x === "string" ? Number(x) : x)))
  .refine((a) => a.every(Number.isFinite) && a.length >= 2, {})
  .transform(([lon, lat]) => [lon, lat] as [number, number]);

const DutyQuerySchema = DutyBaseSchema.partial()
  .extend({
    constraints: constraintsToArray.optional(),
    locationType: z.string().optional(),
    locationCoordinates: locationCoordinates.optional(),
    createdAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date().optional(),
  })
  .transform((data) => {
    const { locationType, locationCoordinates, constraints, ...rest } = data;

    return {
      ...rest,
      ...(locationType !== undefined
        ? { ["location.type"]: locationType }
        : {}),
      ...(locationCoordinates !== undefined
        ? { ["location.coordinates"]: locationCoordinates as [number, number] }
        : {}),
      ...(constraints !== undefined && constraints.length > 0
        ? { constraints: { $all: constraints } }
        : {}),
    };
  });

const DutyUpdateSchema = DutyRefinements(
  z
    .object({
      ...DutyBaseSchema.shape,
      status: z.string().optional(),
      constraints: constraintsToArray.optional(),
      createdAt: z.coerce.date().optional(),
      updatedAt: z.coerce.date().optional(),
    })
    .partial()
);

///////////
// TYPES //
///////////

type Duty = z.infer<typeof DutyDbInputSchema>;
type DutyId = z.infer<typeof DutyIdSchema>;
type DutyUpdate = z.infer<typeof DutyUpdateSchema>;

export {
  DutyBaseSchema,
  DutyDbInputSchema,
  DutyQuerySchema,
  DutyIdSchema,
  DutyUpdateSchema,
};
export type { Duty, DutyId, DutyUpdate };
