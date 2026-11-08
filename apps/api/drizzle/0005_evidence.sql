CREATE TABLE "record_section" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"parent_id" uuid,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"link" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "record_section" ADD CONSTRAINT "record_section_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."record"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "record_section" ADD CONSTRAINT "record_section_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "record_section" ADD CONSTRAINT "record_section_parent_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."record_section"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "record_artifact" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"record_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"file_name" text NOT NULL,
	"media_type" text NOT NULL,
	"byte_size" integer NOT NULL,
	"content_base64" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "record_artifact" ADD CONSTRAINT "record_artifact_record_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."record"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "record_artifact" ADD CONSTRAINT "record_artifact_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "record_artifact_record_idx" ON "record_artifact" USING btree ("record_id");
