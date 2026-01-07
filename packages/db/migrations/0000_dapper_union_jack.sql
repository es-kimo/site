CREATE TABLE "blocks" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"parentId" varchar(255) NOT NULL,
	"parentType" varchar(255) NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"type" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"authorId" varchar(255) NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"inTrash" boolean DEFAULT false NOT NULL,
	"hasChildren" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "files" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"url" varchar(255) NOT NULL,
	"expiryTime" timestamp,
	"object" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"status" varchar(255),
	"filename" varchar(255),
	"contentType" varchar(255),
	"contentLength" integer
);
--> statement-breakpoint
CREATE TABLE "pages" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"status" varchar(255) DEFAULT 'draft' NOT NULL,
	"title" varchar(255) NOT NULL,
	"spaceId" varchar(255) NOT NULL,
	"parentId" varchar(255),
	"parentType" varchar(255),
	"position" integer DEFAULT 0 NOT NULL,
	"authorId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"inTrash" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "versions" (
	"number" integer DEFAULT 1 NOT NULL,
	"authorId" varchar(255) NOT NULL,
	"message" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"minorEdit" boolean DEFAULT false NOT NULL,
	"contentTypeModified" boolean DEFAULT false NOT NULL,
	"prevVersion" integer DEFAULT 0 NOT NULL,
	"nextVersion" integer DEFAULT 0 NOT NULL
);
