import express from "express";
import { db } from "../db/index.js";
import { attendance, users } from "../db/schema.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { isAdmin } from "../middleware/roleMiddleware.js";
import { eq } from "drizzle-orm";

const router = express.Router();

/* ================= ALL ATTENDANCE ================= */

router.get("/all-attendance", verifyToken, isAdmin, async (req, res) => {
  try {
    const data = await db
      .select({
        id: attendance.id,
        name: users.name,
        date: attendance.date,
        checkIn: attendance.checkIn,
        checkOut: attendance.checkOut,
        status: attendance.status,
      })
      .from(attendance)
      .leftJoin(users, eq(attendance.userId, users.id));

    res.json(data);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error fetching attendance" });
  }
});

export default router;