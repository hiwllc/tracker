ALTER TABLE "balance" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "balance" ALTER COLUMN "transaction_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "value" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "due_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "paid_at" timestamp with time zone;