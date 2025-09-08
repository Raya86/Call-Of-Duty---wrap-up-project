import { afterAll, expect, test, beforeAll } from "vitest";
import { RESET_CONTENT, StatusCodes } from "http-status-codes";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";

let testApp: FastifyInstance;

beforeAll(async () => {
  testApp = await buildApp();
});

/////////////////////////
// test adding soldier //
/////////////////////////

const MOCK_SOLDIER_WITHOUT_RANK_NAME = {
  _id: "1111111",
  name: "test a",
  rank: {
    value: 5,
    name: "major",
  },
  limitations: ["night missions", "high altitude"],
};

const MOCK_SOLDIER_EXTRA_PARAMS = {
  _id: "2222222",
  name: "test b",
  rank: {
    value: 5,
    name: "major",
  },
  limitations: ["night missions", "high altitude"],
};

test("create soldier without rank name ", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/soldiers",
    body: {
      _id: "1111111",
      name: "test a",
      rank: {
        value: 5,
      },
      limitations: ["night miSsions", "high altitude"],
    },
  });

  const { createdAt, updatedAt, ...soldierWithoutDate } = {
    ...res.json(),
  };
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.CREATED);
  expect(soldierWithoutDate).toEqual(MOCK_SOLDIER_WITHOUT_RANK_NAME);
  expect(createdAtDate.getTime()).toBeCloseTo(Date.now(), -2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("create soldier with extra parameters ", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/soldiers",
    body: {
      _id: "2222222",
      name: "test b",
      rank: {
        name: "major",
      },
      limitations: ["night missions", "high altitude"],
      somethingElse: "not suppose to be here",
    },
  });

  const { createdAt, updatedAt, ...soldierWithoutDate } = {
    ...res.json(),
  };
  const createdAtDate = new Date(createdAt);
  const updatedAtDate = new Date(updatedAt);

  expect(res.statusCode).toBe(StatusCodes.CREATED);
  expect(soldierWithoutDate).toEqual(MOCK_SOLDIER_EXTRA_PARAMS);
  expect(createdAtDate.getTime()).toBeCloseTo(Date.now(), -2);
  expect(updatedAtDate.getTime()).toBeCloseTo(Date.now(), -2);
});

test("create soldier with rank name and value - 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/soldiers",
    body: {
      _id: "2222222",
      name: "test b",
      rank: {
        name: "major",
        value: 5,
      },
      limitations: ["night missions", "high altitude"],
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("fail create soldier schema error - missing parameter- 400", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/soldiers",
    body: {
      _id: "2222222",
      rank: {
        name: "major",
      },
      limitations: ["night missions", "high altitude"],
    },
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
});

test("fail create soldier duplicate in db - 409", async () => {
  const res = await testApp.inject({
    method: "POST",
    url: "/soldiers",
    body: {
      _id: "1234567",
      name: "John Doe",
      rank: {
        name: "Captain",
      },
      limitations: ["night missions", "high altitude"],
    },
  });
  expect(res.statusCode).toBe(StatusCodes.CONFLICT);
  expect(res.json()).toEqual({ error: "Soldier already exists" });
});

//////////////////////////
// test getting soldier //
//////////////////////////

const GET_SOLDIER = {
  _id: "1122334",
  name: "Johny a",
  rank: {
    value: 5,
    name: "major",
  },
  limitations: ["night missions", "high altitude"],
  createdAt: "2025-09-01T14:12:14.490Z",
  updatedAt: "2025-09-01T14:12:14.490Z",
};

test("get soldier - Ok", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/soldiers/1122334",
  });

  expect(res.statusCode).toBe(StatusCodes.OK);
  expect(res.json()).toEqual(GET_SOLDIER);
});

test("get soldier - 404", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/soldiers/9999999",
  });

  expect(res.statusCode).toBe(StatusCodes.NOT_FOUND);
  expect(res.json()).toEqual({ error: "Soldier not found" });
});

test("get soldier - 400", async () => {
  const res = await testApp.inject({
    method: "GET",
    url: "/soldiers/12a",
  });

  expect(res.statusCode).toBe(StatusCodes.BAD_REQUEST);
  expect(res.json()).toEqual({
    statusCode: 400,
    code: "FST_ERR_VALIDATION",
    error: "Bad Request",
    message: "params/id Invalid string: must match pattern /^\\d{7}$/",
  });
});

afterAll(async () => {
  await testApp.close();
});
