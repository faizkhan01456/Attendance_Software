import { mysqlTable, int, varchar, datetime, date } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

/* ================= USERS TABLE ================= */

export const users = mysqlTable("users", {
  id: int("id").primaryKey().autoincrement(),

  name: varchar("name", { length: 255 }).notNull(),

  email: varchar("email", { length: 255 })
    .notNull()
    .unique(),

  password: varchar("password", { length: 255 }).notNull(),

  role: varchar("role", { length: 50 }).notNull(), // admin or staff

  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});


/* ================= ATTENDANCE TABLE ================= */

export const attendance = mysqlTable("attendance", {
  id: int("id").primaryKey().autoincrement(),

  userId: int("user_id").notNull(),

  date: date("date").notNull(),

  checkIn: datetime("check_in"),

  checkOut: datetime("check_out"),

  status: varchar("status", { length: 50 }), // Present, Absent, Late
});