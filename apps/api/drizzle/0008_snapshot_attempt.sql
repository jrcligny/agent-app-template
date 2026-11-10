CREATE TABLE "snapshot_attempt" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"snapshot_id" uuid NOT NULL,
	"record_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"label" text NOT NULL,
	"attempted_at" timestamp with time zone NOT NULL,
	CONSTRAINT "snapshot_attempt_label_check" CHECK (length(btrim("label")) > 0)
);
--> statement-breakpoint
ALTER TABLE "snapshot_attempt" ADD CONSTRAINT "snapshot_attempt_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "snapshot_attempt" ADD CONSTRAINT "snapshot_attempt_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "snapshot_attempt_item_idx" ON "snapshot_attempt" USING btree ("snapshot_id","record_id");
