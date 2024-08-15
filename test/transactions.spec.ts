import { it, beforeAll, afterAll, describe, expect } from "vitest";
import { exec, execSync } from "node:child_process";
import request from "supertest";
import { app } from "../src/app";
import { beforeEach } from "node:test";

describe("Transactions routes", () => {
  beforeAll(async () => {
    execSync("npm run knex migrate:latest");
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    execSync("npm run knex:migrate:rollback --all");
    execSync("npm run knex:migrate:lastest");
  });

  it("should be able list all transactions", async () => {
    const createTransactionResponse = await request(app.server)
      .post("/transactions")
      .send({
        title: "Salario",
        amount: 5000,
        type: "credit",
      })
      .expect(201);

    const cookies = createTransactionResponse.headers["set-cookie"];

    const listTransactionsResponse = await request(app.server)
      .get("/transactions")
      .set("Cookie", cookies)
      .expect(200);

    expect(listTransactionsResponse.body.transactions).toEqual([
      expect.objectContaining({
        title: "Salario",
        amount: 5000,
      }),
    ]);
  });
});
