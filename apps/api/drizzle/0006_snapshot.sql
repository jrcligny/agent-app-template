CREATE TABLE "snapshot" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"collection_id" uuid NOT NULL,
	"name" text NOT NULL,
	"revision" integer NOT NULL,
	"submit_key" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "snapshot_name_check" CHECK (length(btrim("name")) > 0),
	CONSTRAINT "snapshot_revision_check" CHECK ("revision" > 0)
);
--> statement-breakpoint
ALTER TABLE "snapshot" ADD CONSTRAINT "snapshot_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX "snapshot_user_revision_unique" ON "snapshot" ("user_id", "revision");
--> statement-breakpoint
CREATE UNIQUE INDEX "snapshot_user_submit_key_unique" ON "snapshot" ("user_id", "submit_key") WHERE "submit_key" IS NOT NULL;
--> statement-breakpoint
CREATE INDEX "snapshot_user_idx" ON "snapshot" USING btree ("user_id");
--> statement-breakpoint
CREATE TABLE "snapshot_member" (
	"snapshot_id" uuid NOT NULL,
	"record_id" uuid NOT NULL,
	"title" text NOT NULL,
	"status" text NOT NULL,
	"category" text NOT NULL,
	"source_updated_at" timestamp with time zone NOT NULL,
	CONSTRAINT "snapshot_member_pkey" PRIMARY KEY ("snapshot_id", "record_id")
);
--> statement-breakpoint
ALTER TABLE "snapshot_member" ADD CONSTRAINT "snapshot_member_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "snapshot_target" (
	"snapshot_id" uuid NOT NULL,
	"category" text NOT NULL,
	"position" integer NOT NULL,
	CONSTRAINT "snapshot_target_pkey" PRIMARY KEY ("snapshot_id", "category")
);
--> statement-breakpoint
ALTER TABLE "snapshot_target" ADD CONSTRAINT "snapshot_target_snapshot_id_fk" FOREIGN KEY ("snapshot_id") REFERENCES "public"."snapshot"("id") ON DELETE cascade ON UPDATE no action;
