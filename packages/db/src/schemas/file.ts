import { integer, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const filesTable = pgTable("files", {
  id: varchar({ length: 255 }).primaryKey(),
  url: varchar({ length: 255 }).notNull(),
  expiryTime: timestamp(),
  object: varchar({ length: 255 }).notNull(),
  createdAt: timestamp().notNull().defaultNow(),
  status: varchar({ length: 255 }),
  filename: varchar({ length: 255 }),
  contentType: varchar({ length: 255 }),
  contentLength: integer(),
});
