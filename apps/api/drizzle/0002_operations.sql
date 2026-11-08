CREATE TABLE "workbench_settings" (
	"user_id" text PRIMARY KEY NOT NULL,
	"display_name" text NOT NULL,
	"page_size" integer NOT NULL,
	CONSTRAINT "workbench_settings_page_size_check" CHECK ("page_size" in (10, 25, 50))
);
--> statement-breakpoint
ALTER TABLE "workbench_settings" ADD CONSTRAINT "workbench_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "activity_event" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"record_id" uuid,
	"kind" text NOT NULL,
	"summary" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_event" ADD CONSTRAINT "activity_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "activity_event_user_created_idx" ON "activity_event" USING btree ("user_id", "created_at");
--> statement-breakpoint
CREATE TABLE "job" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"outcome" text NOT NULL,
	"status" text NOT NULL,
	"progress" integer NOT NULL,
	"attempt" integer NOT NULL,
	"replaces_job_id" uuid,
	"retried_by_job_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "job_outcome_check" CHECK ("outcome" in ('complete', 'fail')),
	CONSTRAINT "job_status_check" CHECK ("status" in ('queued', 'running', 'succeeded', 'failed', 'cancelled')),
	CONSTRAINT "job_progress_check" CHECK ("progress" >= 0 AND "progress" <= 100)
);
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_replaces_job_id_fk" FOREIGN KEY ("replaces_job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "job" ADD CONSTRAINT "job_retried_by_job_id_fk" FOREIGN KEY ("retried_by_job_id") REFERENCES "public"."job"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "job_user_id_idx" ON "job" USING btree ("user_id");
