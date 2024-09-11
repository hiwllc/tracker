ALTER TABLE "transactions" ADD COLUMN "reference" uuid;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "next_due_at" timestamp with time zone;