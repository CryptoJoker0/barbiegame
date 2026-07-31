import { pgTable, text, boolean, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const gamesTable = pgTable("games", {
  id: text("id").primaryKey(), // slug e.g. "slot-machine"
  name: text("name").notNull(),
  shortDescription: text("short_description").notNull().default(""),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  /** Entry fee amount as a decimal string, denominated in feeCurrency */
  entryFee: numeric("entry_fee", { precision: 36, scale: 18 }).notNull().default("0"),
  feeCurrency: text("fee_currency").notNull().default("XEN"),
  /** Human-readable rules (newline-separated) */
  rules: text("rules").notNull().default(""),
  /** Human-readable rewards description */
  rewards: text("rewards").notNull().default(""),
  nftRequired: boolean("nft_required").notNull().default(true),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertGameSchema = createInsertSchema(gamesTable).omit({ createdAt: true });
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof gamesTable.$inferSelect;
