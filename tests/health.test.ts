import { afterAll, expect, test, beforeAll, vi, afterEach } from "vitest";
import { StatusCodes } from "http-status-codes";
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/app.js";
import { closeDB } from "../src/db.js";

let testApp: FastifyInstance;

beforeAll(async () => {
  testApp = await buildApp();
});

afterEach(() => {
  vi.restoreAllMocks();
});

test("test health check endpoint - successful", async () => {
  const response = await testApp.inject({ method: "GET", url: "/health" });
  expect(response.statusCode).toBe(StatusCodes.OK);
  expect(response.json()).toEqual({ status: "ok" });
});

test("test health/db check endpoint - successful", async () => {
  const response = await testApp.inject({ method: "GET", url: "/health/db" });
  expect(response.statusCode).toBe(StatusCodes.OK);
  expect(response.json()).toEqual({ status: "connected" });
});

test("test health/db check endpoint - error", async () => {
  await closeDB();
  const response = await testApp.inject({ method: "GET", url: "/health/db" });
  expect(response.statusCode).toBe(StatusCodes.SERVICE_UNAVAILABLE);
  expect(response.json()).toEqual({ status: "not connected" });
});

afterAll(async () => {
  await testApp.close();
});
