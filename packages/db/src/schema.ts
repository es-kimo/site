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
