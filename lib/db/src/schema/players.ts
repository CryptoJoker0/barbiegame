import { pgTable, text, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const playersTable = pgTable("players", {
  address: text("address").primaryKey(),
  nickname: text("nickname"),
  totalSpins: integer("total_spins").notNull().default(0),
  totalWins: integer("total_wins").notNull().default(0),
  totalWinnings: integer("total_winnings").notNull().default(0),
  highScore: integer("high_score").notNull().default(0),
  cheeseCollected: integer("cheese_collected").notNull().default(0),
  bestStreak: integer("best_streak").notNull().default(0),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlayerSchema = createInsertSchema(playersTable).omit({
  createdAt: true,
  updatedAt: true,
});

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof playersTable.$inferSelect;
