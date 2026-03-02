import express from "express";
import bcrypt from "bcrypt";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";

const router = express.Router();

/* CREATE STAFF (Admin Only) */

router.post("/create", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: "staff",
    });

    res.json({ message: "Staff created successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error creating staff" });
  }
});

export default router;