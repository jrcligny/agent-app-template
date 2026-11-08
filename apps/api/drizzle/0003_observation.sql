CREATE TABLE "observation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"record_id" uuid,
	"fixture_key" text,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"value" integer NOT NULL,
	"observed_at" timestamp with time zone NOT NULL,
	CONSTRAINT "observation_status_check" CHECK ("status" in ('open', 'closed'))
);
--> statement-breakpoint
ALTER TABLE "observation" ADD CONSTRAINT "observation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "observation" ADD CONSTRAINT "observation_record_id_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."record"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "observation_user_fixture_key_unique" ON "observation" ("user_id", "fixture_key") WHERE "fixture_key" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "observation_user_observed_idx" ON "observation" USING btree ("user_id", "observed_at");
