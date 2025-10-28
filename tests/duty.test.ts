import { afterAll, expect, test, beforeAll } from "vitest";
import { StatusCodes } from "http-status-codes";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import {
  createDuty,
  deleteDutyById,
  getDutiesQuery,
} from "../src/repositories/dutyRepository.js";

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

////////////////////////////////
// test getting duty by query //
////////////////////////////////

const DUTIES = [
  {
    name: "test query",
    description:
      "Oversee and secure the northern gate area during nighttime operations.",
    location: {
      type: "Point",
      coordinates: [40.7818, 40.0853],
    },
    startTime: "2026-10-09T22:00:00.000Z",
    endTime: "2026-10-10T06:00:00.000Z",
    constraints: ["check a", "Check b"],
    soldiersRequired: 3,
    value: 2,
    minRank: 2,
    maxRank: 4,
    createdAt: "2025-10-09T07:44:11.625Z",
    updatedAt: "2025-10-09T07:44:11.625Z",
    soldiers: [],
    status: "unscheduled",
    statusHistory: [
      {
        status: "unscheduled",
        date: "2025-10-09T07:44:11.627Z",
      },
    ],
  },
  {
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
    createdAt: "2025-10-09T07:44:11.645Z",
    updatedAt: "2025-10-09T07:44:11.645Z",
    soldiers: [],
    status: "unscheduled",
    statusHistory: [
      {
        status: "unscheduled",
        date: "2025-10-09T07:44:11.645+00:00",
      },
    ],
  },
];

test("get duty by query - name", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?name=test query",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual([DUTIES[0]]);
});

test("get duty by query - constraints", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?constraints=check a, Check b",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual([DUTIES[0]]);
});

test("get duty by query - location coordinates", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?locationCoordinates=40.7818,40.0853",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual([DUTIES[0]]);
});

test("get duty by query - constraints wrong order", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?constraints=Check b, check a",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual([DUTIES[0]]);
});

test("get duty by query - no result", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?&name=Johny",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual([]);
});

test("get duty - 400", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties?location=40.7818,40.0853",
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  expect(res.json()).toEqual({
    statusCode: 400,
    code: "FST_ERR_VALIDATION",
    error: "Bad Request",
    message:
      "querystring/location Invalid input: expected object, received string",
  });
});

///////////////////////
// test getting duty //
///////////////////////

test("get duty - Ok", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties/68e767cbc06741a252443e2b",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual(DUTIES[0]);
});

test("get duty - 404", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties/68e767cbc06741a252443e2a",
  });

  expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  expect(res.json()).toEqual({ error: "Not Found" });
});

test("get duty - 400", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/duties/12a",
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  expect(res.json()).toEqual({
    statusCode: 400,
    code: "FST_ERR_VALIDATION",
    error: "Bad Request",
    message: "params/id Invalid input",
  });
});

////////////////////////
// test deleting duty //
////////////////////////

test("delete duty - Ok", async () => {
  createDuty({
    name: "made to be deleted",
    description: "check Southeaster Base",
    location: {
      type: "Point",
      coordinates: [15.7818, 5.0853],
    },
    startTime: new Date("2025-10-13T22:00:00.000Z"),
    endTime: new Date("2025-10-17T06:00:00.000Z"),
    constraints: [],
    soldiersRequired: 1,
    value: 2,
    minRank: 2,
    createdAt: new Date("2025-10-09T07:44:11.645Z"),
    updatedAt: new Date("2025-10-09T07:44:11.645Z"),
    soldiers: [],
    status: "unscheduled",
    statusHistory: [
      {
        status: "unscheduled",
        date: new Date("2025-10-09T07:44:11.645+00:00"),
      },
    ],
  });

  const duty = (await getDutiesQuery({ name: "made to be deleted" } as any))[0];

  const res = await testApp.inject({
    method: "DELETE",
    url: `/duties/${duty._id.toString()}`,
  });

  expect(res.statusCode).toBe(StatusCodes.NO_CONTENT);
});

test("delete duty - 404", async () => {
  const res = await testApp.inject({
    method: "DELETE",
    url: "/duties/68e767cbc06741a252443e2a",
  });

  expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  expect(res.json()).toEqual({ error: "Not Found" });
});

test("delete duty - 400", async () => {
  const res = await testApp.inject({
    method: "DELETE",
    url: "/duties/111a11",
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  expect(res.json()).toEqual({
    statusCode: 400,
    code: "FST_ERR_VALIDATION",
    error: "Bad Request",
    message: "params/id Invalid input",
  });
});

test("delete scheduled duty - 405", async () => {
  const res = await testApp.inject({
    method: "DELETE",
    url: "/duties/69032892c7505d567db38ab5",
  });

  expect(res.statusCode).toBe(StatusCodes.METHOD_NOT_ALLOWED);
  expect(res.json()).toEqual({
    statusCode: 405,
    error: "Method Not Allowed",
    message: "Scheduled duties cannot be removed",
  });
});

////////////////////////
// test updating duty //
////////////////////////

const MOCK_UPDATED_DUTY_1 = {
  name: "test update",
  description:
    "Oversee and secure the northern gate area during nighttime operations.",
  location: {
    type: "Point",
    coordinates: [60.7818, 60.0853],
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
  createdAt: "2025-10-19T11:49:56.346Z",
  soldiers: [],
  status: "unscheduled",
  statusHistory: [
    {
      status: "unscheduled",
      date: "2025-10-19T11:49:56.348Z",
    },
  ],
};

const MOCK_UPDATED_DUTY_2 = {
  name: "test update 2",
  description:
    "Oversee and secure the northern gate area during nighttime operations.",
  location: {
    type: "Point",
    coordinates: [60.7818, 60.0853],
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
  createdAt: "2025-10-19T11:49:56.346Z",
  soldiers: [],
  status: "unscheduled",
  statusHistory: [
    {
      status: "unscheduled",
      date: "2025-10-19T11:49:56.348Z",
    },
  ],
};

const MOCK_UPDATED_DUTY_3 = {
  name: "made to be deleted after update",
  description: "LALA",
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
  createdAt: "2025-10-09T07:44:11.645Z",
  soldiers: [],
  status: "scheduled",
  statusHistory: [
    {
      status: "unscheduled",
      date: "2025-10-09T07:44:11.645Z",
    },
    {
      status: "scheduled",
      date: expect.anything(),
    },
  ],
};

test("update duty", async () => {
  const res = await testApp.inject({
    method: "PATCH",
    url: "/duties/68f4d06452296c5ce4ec5c7c",
    body: {
      name: "test update",
      location: {
        type: "Point",
        coordinates: [60.7818, 60.0853],
      },
    },
  });

  const { updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(dutyWithoutDate).toEqual(MOCK_UPDATED_DUTY_1);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("update duty with extra parameters ", async () => {
  const res = await testApp.inject({
    method: "PATCH",
    url: "/duties/68f4d06452296c5ce4ec5c7c",
    body: {
      _id: "68f4d06452296c5ce4ec5c7c",
      name: "test update 2",
      somethingElse: "not suppose to be here",
    },
  });

  const { updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(dutyWithoutDate).toEqual(MOCK_UPDATED_DUTY_2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("update duty with start time after end time - 400", async () => {
  const res = await testApp.inject({
    method: "PATCH",
    url: "/duties/68f4d06452296c5ce4ec5c7c",
    body: {
      startTime: "2026-10-11T22:00:00.000Z",
      endTime: "2026-10-10T06:00:00.000Z",
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("update duty with _id - id does't change", async () => {
  const res = await testApp.inject({
    method: "PATCH",
    url: "/duties/68f4d06452296c5ce4ec5c7c",
    body: {
      _id: "68f4d06452296c5ce4ec5c7a",
    },
  });

  const { updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(dutyWithoutDate).toEqual(MOCK_UPDATED_DUTY_2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("update duty - update schedule history", async () => {
  await createDuty({
    name: "made to be deleted after update",
    description: "LALA",
    location: {
      type: "Point",
      coordinates: [15.7818, 5.0853],
    },
    startTime: new Date("2026-10-13T22:00:00.000Z"),
    endTime: new Date("2026-10-17T06:00:00.000Z"),
    constraints: [],
    soldiersRequired: 1,
    value: 2,
    minRank: 2,
    createdAt: new Date("2025-10-09T07:44:11.645Z"),
    updatedAt: new Date("2025-10-09T07:44:11.645Z"),
    soldiers: [],
    status: "unscheduled",
    statusHistory: [
      {
        status: "unscheduled",
        date: new Date("2025-10-09T07:44:11.645+00:00"),
      },
    ],
  });

  const duty = (
    await getDutiesQuery({ name: "made to be deleted after update" } as any)
  )[0];

  const res = await testApp.inject({
    method: "PATCH",
    url: `/duties/${duty._id.toString()}`,
    body: {
      status: "scheduled",
    },
  });

  const { updatedAt, ...dutyWithoutDate } = {
    ...res.json(),
  };
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(dutyWithoutDate).toEqual(MOCK_UPDATED_DUTY_3);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);

  await deleteDutyById(duty._id.toString());
});

afterAll(async () => {
  await testApp.close();
});
