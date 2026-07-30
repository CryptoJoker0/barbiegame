import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const spinsTable = pgTable("spins", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  playerAddress: text("player_address").notNull(),
  symbols: text("symbols").array().notNull(), // e.g. ['7️⃣','🧀','👑']
  winAmount: integer("win_amount").notNull().default(0),
  cheeseEarned: integer("cheese_earned").notNull().default(0),
  isJackpot: boolean("is_jackpot").notNull().default(false),
  clientSeed: text("client_seed"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSpinSchema = createInsertSchema(spinsTable).omit({
  createdAt: true,
});

export type InsertSpin = z.infer<typeof insertSpinSchema>;
export type Spin = typeof spinsTable.$inferSelect;
