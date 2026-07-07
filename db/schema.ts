import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const cases = sqliteTable("cases", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  severity: text("severity").notNull(), // "rug" | "drain" | "theft" | "suspicious"
  visibility: text("visibility").notNull().default("public"), // "public" | "private"
  ownerWallet: text("owner_wallet").notNull(),
  blobUrls: text("blob_urls").notNull().default("[]"), // JSON array of Shelby blob URLs
  tags: text("tags").notNull().default("[]"), // JSON array of tag strings
  createdAt: integer("created_at").notNull().default(sql`(unixepoch())`),
});

export type Case = typeof cases.$inferSelect;
export type NewCase = typeof cases.$inferInsert;