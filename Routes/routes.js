import express from "express";
import { prisma } from "../prisma/client.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
// import { RecommendationAgent } from "../utils/aiAgent.js";
import { insertRecord, insertRecords } from "../utils/recommender.js";

export const router = express.Router();

router.post("/user/register", async (req, res, next) => {
  try {
    console.log(req.body);
    const { password, name, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 19);
    const user = await prisma.user.create({
      data: {
        password: hashedPassword,
        name,
        email
      }
    });

    if (!user) {
      res.status(401).json({ error: ["Creation Failed"] });
    }

    const token = await jwt.sign(user.id, process.env.JWT);

    res.status(201).json({ token, user });
  } catch (error) {
    next(error);
  }
});
router.post("/user/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      data: {
        email
      }
    });

    if (!bcrypt.compare(password, user.password)) {
      res.status(400).json({ error: ["Unable to Authenticate User"] });
    }
    const token = await jwt.sign(id, process.env.JWT);
    res.status(200).json({ token, user });
  } catch (error) {
    next(error);
  }
});
router.post("/createProperty", async (req, res, next) => {
  try {
    const { name, description, price, city, country, state } = req.body;

    const property = await prisma.property.create({
      data: {
        name,
        description,
        price,
        city,
        country,
        state
      }
    });
    if (!property) {
      res.status(401).json({ error: ["Unable to create property"] });
    }
    insertRecord(property)
    res.status(201).json({ property });
  } catch (error) {
    next(error);
  }
});
router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({
      where: {
        id
      }
    });
    if (!property) {
      res.status(404).json({ error: ["Unable to find property"] });
    }
    res.status(200).json({ property });
  } catch (error) {
    next(error);
  }
});
router.get("/", async (req, res, next) => {
  try {
    const properties = await prisma.property.findMany({});

    if (!properties) {
      res.status(404).json({ error: ["No property found"] });
    }
    res.status(200).json({ properties });
  } catch (error) {
    next(error);
  }
});
router.get("/search", async (req, res, next) => {
  const { query, userId } = req.body
  // const result = await RecommendationAgent({ query, userId })
  res.status(200).json({ result })
})
