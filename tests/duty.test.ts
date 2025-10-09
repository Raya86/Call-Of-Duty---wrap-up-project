import { afterAll, expect, test, beforeAll } from "vitest";
import { StatusCodes } from "http-status-codes";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";

let testApp: FastifyInstance;

beforeAll(async () => {
  testApp = await buildApp();
});

//////////////////////
// test adding duty //
//////////////////////

const MOCK_DUTY = {
  name: "Night Watch - North Gate",
  description:
    "Oversee and secure the northern gate area during nighttime operations.",
  location: {
    type: "Point",
    coordinates: [34.7818, 32.0853],
  },
  startTime: "2026-10-09T22:00:00.000Z",
  endTime: "2026-10-10T06:00:00.000Z",
  constraints: [
    "Requires at least one officer with clearance level 2",
    "Soldiers must have completed night training",
  ],
  soldiersRequired: 3,
  value: 2,
  minRank: 2,
  maxRank: 4,
  soldiers: [],
  status: "unscheduled",
  statusHistory: [
    {
      status: "unscheduled",
      date: new Date(),
    },
  ],
};

const MOCK_DUTY_EXTRA_PARAMS = {
  name: "Morning lookout - Southeaster Base",
  description: "check Southeaster Base",
  location: {
    type: "Point",
    coordinates: [15.7818, 5.0853],
  },
  startTime: "2026-10-13T22:00:00.000Z",
  endTime: "2026-10-17T06:00:00.000Z",
  constraints: [],
  soldiersRequired: 1,
  value: 2,
  minRank: 2,
  soldiers: [],
  status: "unscheduled",
  statusHistory: [
    {
      status: "unscheduled",
      date: new Date(),
    },
  ],
};

test("create duty - ok", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      name: "Night Watch - North Gate",
      description:
        "Oversee and secure the northern gate area during nighttime operations.",
      location: {
        type: "Point",
        coordinates: [34.7818, 32.0853],
      },
      startTime: "2026-10-09T22:00:00Z",
      endTime: "2026-10-10T06:00:00Z",
      constraints: [
        "Requires at least one officer with clearance level 2",
        "Soldiers must have completed night training",
      ],
      soldiersRequired: 3,
      value: 2,
      minRank: 2,
      maxRank: 4,
    },
  });

  const { createdAt, updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.CREATED);
  expect(dutyWithoutDate).toMatchObject({
    ...MOCK_DUTY,
    statusHistory: [
      expect.objectContaining({
        status: "unscheduled",
        date: expect.any(String),
      }),
    ],
  });
  expect(createdAtDate.getTime()).toBeCloseTo(Date.now(), -2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("create duty with extra parameters - ok", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      name: "Morning lookout - Southeaster Base",
      description: "check Southeaster Base",
      location: {
        type: "Point",
        coordinates: [15.7818, 5.0853],
      },
      startTime: "2026-10-13T22:00:00.000Z",
      endTime: "2026-10-17T06:00:00.000Z",
      soldiersRequired: 1,
      value: 2,
      minRank: 2,
      addAlsoThis: "not suppose to be here",
    },
  });

  const { createdAt, updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.CREATED);
  expect(dutyWithoutDate).toMatchObject({
    ...MOCK_DUTY_EXTRA_PARAMS,
    statusHistory: [
      expect.objectContaining({
        status: "unscheduled",
        date: expect.any(String),
      }),
    ],
  });
  expect(createdAtDate.getTime()).toBeCloseTo(Date.now(), -2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("create duty with start date after end date - 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      name: "Night Watch - North Gate",
      description:
        "Oversee and secure the northern gate area during nighttime operations.",
      location: {
        type: "Point",
        coordinates: [34.7818, 32.0853],
      },
      startTime: "2025-10-15T22:00:00Z",
      endTime: "2025-10-10T06:00:00Z",
      constraints: [
        "Requires at least one officer with clearance level 2",
        "Soldiers must have completed night training",
      ],
      soldiersRequired: 3,
      value: 2,
      minRank: 2,
      maxRank: 4,
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("create duty with start date in the past- 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      name: "Night Watch - North Gate",
      description:
        "Oversee and secure the northern gate area during nighttime operations.",
      location: {
        type: "Point",
        coordinates: [34.7818, 32.0853],
      },
      startTime: "2025-09-15T22:00:00Z",
      endTime: "2025-10-10T06:00:00Z",
      constraints: [
        "Requires at least one officer with clearance level 2",
        "Soldiers must have completed night training",
      ],
      soldiersRequired: 3,
      value: 2,
      minRank: 2,
      maxRank: 4,
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("fail create duty schema error - missing parameter - 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      location: {
        type: "Point",
        coordinates: [15.7818, 5.0853],
      },
      startTime: "2025-10-13T22:00:00.000Z",
      endTime: "2025-10-17T06:00:00.000Z",
      soldiersRequired: 1,
      value: 2,
      minRank: 2,
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("create duty with min rank bigger then max rank - 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/duties",
    body: {
      name: "Night Watch - North Gate",
      description:
        "Oversee and secure the northern gate area during nighttime operations.",
      location: {
        type: "Point",
        coordinates: [34.7818, 32.0853],
      },
      startTime: "2025-10-15T22:00:00Z",
      endTime: "2025-10-10T06:00:00Z",
      constraints: [
        "Requires at least one officer with clearance level 2",
        "Soldiers must have completed night training",
      ],
      soldiersRequired: 3,
      value: 2,
      minRank: 5,
      maxRank: 2,
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

afterAll(async () => {
  await testApp.close();
});
