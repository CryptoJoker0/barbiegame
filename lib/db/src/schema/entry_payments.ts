import { pgTable, text, timestamp, numeric, uuid } from "drizzle-orm/pg-core";
import { gamesTable } from "./games";

export const entryPaymentsTable = pgTable("entry_payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  walletAddress: text("wallet_address").notNull(),
  gameId: text("game_id").notNull().references(() => gamesTable.id),
  amount: numeric("amount", { precision: 36, scale: 18 }).notNull(),
  feeCurrency: text("fee_currency").notNull().default("XEN"),
  /** On-chain transaction hash */
  txHash: text("tx_hash").notNull().unique(),
  /** Treasury wallet that received the payment */
  treasuryWallet: text("treasury_wallet").notNull(),
  /** pending | confirmed | failed */
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  confirmedAt: timestamp("confirmed_at"),
});

export type EntryPayment = typeof entryPaymentsTable.$inferSelect;
