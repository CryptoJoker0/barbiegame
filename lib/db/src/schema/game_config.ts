import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gameConfigTable = pgTable("game_config", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  spinCost: integer("spin_cost").notNull().default(10),
  jackpotAmount: integer("jackpot_amount").notNull().default(1000),
  dailyRewardCoins: integer("daily_reward_coins").notNull().default(100),
  dailyRewardCheese: integer("daily_reward_cheese").notNull().default(5),
  bonusSpinCheeseCost: integer("bonus_spin_cheese_cost").notNull().default(5),
  maxDailySpins: integer("max_daily_spins").notNull().default(200),
  maintenanceMode: boolean("maintenance_mode").notNull().default(false),
  announcementBanner: text("announcement_banner"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertGameConfigSchema = createInsertSchema(gameConfigTable).omit({
  updatedAt: true,
});

export type InsertGameConfig = z.infer<typeof insertGameConfigSchema>;
export type GameConfig = typeof gameConfigTable.$inferSelect;
