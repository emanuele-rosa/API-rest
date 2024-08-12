import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { checkSessionIdExists } from "../middlewares/check-session-id-exists";
import { randomUUID } from "node:crypto";

export async function transactionRoutes(app: FastifyInstance) {
  app.get(
    "/",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { session_id } = req.cookies;

      const transactions = await knex("transactions")
        .where("session_id", session_id)
        .select();

      return { transactions };
    }
  );

  app.get(
    "/:id",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const getTransactionParamsSchema = z.object({
        id: z.string().uuid(),
      });

      const { id } = getTransactionParamsSchema.parse(req.params);

      const { session_id } = req.cookies;

      const transaction = await knex("transactions")
        .where({ session_id, id })
        .first();

      return { transaction };
    }
  );

  app.get(
    "/summary",
    {
      preHandler: [checkSessionIdExists],
    },
    async (req, res) => {
      const { session_id } = req.cookies;

      const summary = await knex("transactions")
        .where("session_id", session_id)
        .sum("amount", { as: "amount" })
        .first();

      return { summary };
    }
  );

  app.post("/", async (req, res) => {
    const createTransactionBodySchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(["credit", "debit"]),
    });

    const { title, amount, type } = createTransactionBodySchema.parse(req.body);

    let session_id = req.cookies.session_id;

    if (!session_id) {
      session_id = randomUUID();
      res.cookie("session_id", session_id, {
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });
    }
    console.log(session_id);

    await knex("transactions").insert({
      id: randomUUID(),
      title,
      amount: type === "credit" ? amount : amount * -1,
      session_id: session_id,
    });

    return res.status(201).send("Transaction created");
  });
}
