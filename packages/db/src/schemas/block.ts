import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const blocksTable = pgTable("blocks", {
  id: varchar({ length: 255 }).primaryKey(),
  parentId: varchar({ length: 255 }).notNull(),
  parentType: varchar({ length: 255 }).notNull(),
  position: integer().notNull().default(0),
  type: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  authorId: varchar({ length: 255 }).notNull(),
  version: integer().notNull().default(1),
  inTrash: boolean().notNull().default(false),
  hasChildren: boolean().notNull().default(false),
});
