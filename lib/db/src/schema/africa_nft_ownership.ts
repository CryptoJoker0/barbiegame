import { pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

/**
 * Tracks AFRICA NFT ownership by wallet address.
 *
 * This is the database-side source of truth used by the "database" NFT
 * verification provider.  When the on-chain contract is deployed, the
 * "blockchain" provider will supersede this table without any UI changes.
 */
export const africaNftOwnership = pgTable("africa_nft_ownership", {
  id:            text("id").primaryKey(),           // e.g. "{wallet}:{token_id}"
  walletAddress: text("wallet_address").notNull(),  // lower-cased EVM address
  tokenId:       text("token_id").notNull(),
  collection:    text("collection").notNull().default("AFRICA_NFT"),
  metadata:      text("metadata"),                  // optional JSON blob
  nftCount:      integer("nft_count").notNull().default(1),
  createdAt:     timestamp("created_at").notNull().defaultNow(),
  updatedAt:     timestamp("updated_at").notNull().defaultNow(),
});
