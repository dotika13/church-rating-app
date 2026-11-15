DO $$ BEGIN
 CREATE TYPE "public"."architectural_style" AS ENUM('gothic', 'romanesque', 'baroque', 'neoclassical', 'modern', 'brutalist', 'byzantine', 'renaissance', 'art_nouveau', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."denomination" AS ENUM('catholic', 'protestant', 'orthodox', 'other', 'ecumenical');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."heritage_status" AS ENUM('unesco', 'national', 'local', 'none');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "churches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"denomination" "denomination",
	"address" text,
	"lat" double precision NOT NULL,
	"lng" double precision NOT NULL,
	"year_built" integer,
	"architectural_style" "architectural_style",
	"website" text,
	"service_times" text,
	"description" text,
	"patron_saint" text,
	"heritage_status" "heritage_status" DEFAULT 'none',
	"organ_builder" text,
	"organ_specs" text,
	"capacity" integer,
	"wheelchair_accessible" boolean,
	"parking_info" text,
	"virtual_tour_url" text,
	"created_by" uuid,
	"group_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "group_members" (
	"group_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "group_members_group_id_user_id_pk" PRIMARY KEY("group_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "groups" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"invite_code" text NOT NULL,
	"created_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "groups_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"storage_path" text NOT NULL,
	"mime_type" text NOT NULL,
	"caption" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"display_name" text,
	"avatar_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ratings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"exterior" integer NOT NULL,
	"interior" integer NOT NULL,
	"surroundings" integer NOT NULL,
	"acoustics" integer NOT NULL,
	"has_organ" boolean DEFAULT false NOT NULL,
	"organ_rating" integer,
	"vibe" integer NOT NULL,
	"visit_date" date,
	"time_spent_minutes" integer,
	"companions_reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "churches" ADD CONSTRAINT "churches_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "churches" ADD CONSTRAINT "churches_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_group_id_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "group_members" ADD CONSTRAINT "group_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "groups" ADD CONSTRAINT "groups_created_by_profiles_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."profiles"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "media" ADD CONSTRAINT "media_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_users_id_fk" FOREIGN KEY ("id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_church_id_churches_id_fk" FOREIGN KEY ("church_id") REFERENCES "public"."churches"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ratings" ADD CONSTRAINT "ratings_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "churches_group_id_idx" ON "churches" USING btree ("group_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "churches_created_by_idx" ON "churches" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "churches_lat_lng_idx" ON "churches" USING btree ("lat","lng");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "churches_name_search_idx" ON "churches" USING btree ("name");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "group_members_user_id_idx" ON "group_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "groups_invite_code_idx" ON "groups" USING btree ("invite_code");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "groups_created_by_idx" ON "groups" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_church_id_idx" ON "media" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "media_user_id_idx" ON "media" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "profiles_display_name_idx" ON "profiles" USING btree ("display_name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "ratings_church_user_unique" ON "ratings" USING btree ("church_id","user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ratings_church_id_idx" ON "ratings" USING btree ("church_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "ratings_user_id_idx" ON "ratings" USING btree ("user_id");
--> statement-breakpoint
CREATE MATERIALIZED VIEW "church_aggregates" AS
SELECT
  c.id AS church_id,
  COUNT(r.id) AS rating_count,
  ROUND(AVG(r.exterior)::numeric, 2) AS avg_exterior,
  ROUND(AVG(r.interior)::numeric, 2) AS avg_interior,
  ROUND(AVG(r.surroundings)::numeric, 2) AS avg_surroundings,
  ROUND(AVG(r.acoustics)::numeric, 2) AS avg_acoustics,
  ROUND(AVG(r.organ_rating) FILTER (WHERE r.has_organ)::numeric, 2) AS avg_organ,
  ROUND(AVG(r.vibe)::numeric, 2) AS avg_vibe,
  ROUND((
    AVG(r.exterior) + AVG(r.interior) + AVG(r.surroundings) +
    AVG(r.acoustics) + AVG(r.vibe) +
    AVG(r.organ_rating) FILTER (WHERE r.has_organ)
  ) / (5 + COUNT(r.organ_rating) FILTER (WHERE r.has_organ))::numeric, 2) AS overall_score
FROM churches c
LEFT JOIN ratings r ON r.church_id = c.id
GROUP BY c.id;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "church_aggregates_church_id_idx" ON "church_aggregates" USING btree ("church_id");