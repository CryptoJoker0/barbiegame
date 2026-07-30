import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const achievementsTable = pgTable("achievements", {
  id: text("id").primaryKey(), // composite: "{address}:{key}"
  playerAddress: text("player_address").notNull(),
  achievementKey: text("achievement_key").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
});

export const insertAchievementSchema = createInsertSchema(achievementsTable);

export type InsertAchievement = z.infer<typeof insertAchievementSchema>;
export type Achievement = typeof achievementsTable.$inferSelect;
