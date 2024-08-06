CREATE TABLE IF NOT EXISTS "balance" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"balance" integer NOT NULL,
	"transaction_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
