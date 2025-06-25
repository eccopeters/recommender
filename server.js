import express from "express";
import "dotenv/config";
import { errorHandler } from "./Middleware/errorHandler.js";
import { prisma } from "./prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { GoogleRoutesAPI } from "@langchain/community/tools/google_routes";
import { router } from "./Routes/routes.js"
import { getIndex } from "./utils/recommender.js";
import { tryCatch } from "bullmq";

const app = express();

app.use(express.json())

app.use("/telementry", async (req, res, next) => {
  try {
    const { eventType, userId, query, propertyId } = req.body
    const telementry = await prisma.telementry.create({
      data: {
        eventType,
        propertyId,
        query,
        user: {
          connect: {
            id: req.body.userId
          }
        }
      }
    });
    res.status(200).json({ telementry })
  } catch (error) {
    next(error);
  }
});

app.use("/", router)

app.use(errorHandler);

async function initiateIndex() {
  try {
    const index = await getIndex()

    console.log("index: " + index)
  } catch (error) {
    console.log(error)
    setTimeout(10000, initiateIndex)
  }

}
initiateIndex()
await prisma
  .$connect()
  .then(() => {
    console.log("Database connected Successfully!");
    app.listen(2020, () => {
      console.log("Server running on Port: 2020");
    });
  })
  .catch((error) => {
    console.log(error);
  });
