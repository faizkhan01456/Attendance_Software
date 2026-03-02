import express from "express";
import { db } from "../db/index.js";
import { attendance } from "../db/schema.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { eq, and } from "drizzle-orm";

const router = express.Router();

/* ================= CHECK-IN ================= */

router.post("/check-in", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const now = new Date();
    const todayDate = now.toISOString().split("T")[0];
    const hour = now.getHours();

    // ❌ Block check-in after 6 PM
    if (hour >= 18) {
      return res.status(400).json({
        message: "Check-in closed after 6 PM ❌",
      });
    }

    // Check existing record
    const existing = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          eq(attendance.date, todayDate)
        )
      );

    if (existing.length > 0) {
      return res.json({ message: "Attendance already marked" });
    }

    let status;

    if (hour < 10) {
      status = "Present";
    } else {
      status = "Late";
    }

    await db.insert(attendance).values({
      userId,
      date: todayDate,
      checkIn: now,
      status,
    });

    res.json({
      message: `Check-in successful (${status}) ✅`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error marking attendance" });
  }
});


/* ================= CHECK-OUT ================= */

router.post("/check-out", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const today = new Date();
    const todayDate = today.toISOString().split("T")[0];

    const record = await db
      .select()
      .from(attendance)
      .where(
        and(
          eq(attendance.userId, userId),
          eq(attendance.date, todayDate)
        )
      );

    if (!record.length) {
      return res.json({ message: "No check-in found for today" });
    }

    if (!record[0].checkIn) {
      return res.json({
        message: "Absent record cannot check-out ❌",
      });
    }

    if (record[0].checkOut) {
      return res.json({ message: "Already checked out" });
    }

    const checkInTime = new Date(record[0].checkIn);
    const checkOutTime = new Date();

    const diffMs = checkOutTime - checkInTime;
    const diffHours = (diffMs / (1000 * 60 * 60)).toFixed(2);

    await db
      .update(attendance)
      .set({
        checkOut: checkOutTime,
      })
      .where(eq(attendance.id, record[0].id));

    res.json({
      message: "Check-out successful ✅",
      workingHours: `${diffHours} hours`,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error during check-out" });
  }
});

export default router;