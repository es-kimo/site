import { boolean, integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const versionsTable = pgTable("versions", {
  number: integer().notNull().default(1),
  authorId: varchar({ length: 255 }).notNull(),
  message: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  minorEdit: boolean().notNull().default(false),
  contentTypeModified: boolean().notNull().default(false),
  prevVersion: integer().notNull().default(0),
  nextVersion: integer().notNull().default(0),
});
