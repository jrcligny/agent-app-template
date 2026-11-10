ALTER TABLE "snapshot" ADD COLUMN "environment_name" text;
--> statement-breakpoint
ALTER TABLE "snapshot" ADD COLUMN "config_digest" text;
--> statement-breakpoint
ALTER TABLE "snapshot" ADD COLUMN "code_version" text;
