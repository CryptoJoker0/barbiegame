import { pgTable, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const dailyClaimsTable = pgTable("daily_claims", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerAddress: text("player_address").notNull(),
  coinsAwarded: integer("coins_awarded").notNull().default(0),
  cheeseAwarded: integer("cheese_awarded").notNull().default(0),
  claimedAt: timestamp("claimed_at").notNull().defaultNow(),
});

export const insertDailyClaimSchema = createInsertSchema(dailyClaimsTable).omit({
  claimedAt: true,
});

export type InsertDailyClaim = z.infer<typeof insertDailyClaimSchema>;
export type DailyClaim = typeof dailyClaimsTable.$inferSelect;
