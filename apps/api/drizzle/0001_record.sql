CREATE TABLE "record" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"summary" text NOT NULL,
	"body" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "record_status_check" CHECK ("status" in ('open', 'closed')),
	CONSTRAINT "record_reason_check" CHECK (("status" = 'open' AND "reason" IS NULL) OR ("status" = 'closed' AND "reason" IS NOT NULL AND length(btrim("reason")) > 0))
);
--> statement-breakpoint
ALTER TABLE "record" ADD CONSTRAINT "record_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "record_user_id_idx" ON "record" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE "record_permission" (
	"user_id" text PRIMARY KEY NOT NULL,
	"can_view" boolean NOT NULL,
	"can_delete" boolean NOT NULL
);
--> statement-breakpoint
ALTER TABLE "record_permission" ADD CONSTRAINT "record_permission_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
