import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const pagesTable = pgTable("pages", {
  id: varchar({ length: 255 }).primaryKey(),
  status: varchar({ length: 255 }).notNull().default("draft"),
  title: varchar({ length: 255 }).notNull(),
  spaceId: varchar({ length: 255 }).notNull(),
  parentId: varchar({ length: 255 }),
  parentType: varchar({ length: 255 }),
  position: integer().notNull().default(0),
  authorId: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  version: integer().notNull().default(1),
  inTrash: boolean().notNull().default(false),
});
