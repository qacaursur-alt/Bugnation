CREATE TABLE "content_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" varchar,
	"module_id" varchar,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"content" jsonb,
	"file_url" varchar,
	"file_size" integer,
	"duration" integer,
	"order_index" integer DEFAULT 0,
	"is_required" boolean DEFAULT true,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_categories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"icon" varchar,
	"color" varchar,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_subcategories" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category_id" varchar NOT NULL,
	"name" varchar NOT NULL,
	"description" text,
	"icon" varchar,
	"color" varchar,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "module_progress" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"group_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"quiz_passed" boolean DEFAULT false,
	"quiz_score" integer,
	"quiz_attempts" integer DEFAULT 0,
	"time_spent" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"lesson_id" varchar NOT NULL,
	"enrollment_id" varchar NOT NULL,
	"answers" jsonb,
	"score" integer DEFAULT 0,
	"total_questions" integer DEFAULT 0,
	"passed" boolean DEFAULT false,
	"time_spent" integer DEFAULT 0,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" varchar,
	"module_id" varchar,
	"question" text NOT NULL,
	"type" varchar NOT NULL,
	"options" jsonb,
	"correct_answer" jsonb,
	"explanation" text,
	"points" integer DEFAULT 1,
	"order_index" integer DEFAULT 0,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "enrollment_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "user_progress" ALTER COLUMN "lesson_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "category_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "subcategory_id" varchar;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "difficulty" varchar DEFAULT 'beginner';--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "duration" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "max_students" integer;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "start_date" timestamp;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "end_date" timestamp;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "batch_timings" text;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "thumbnail" varchar;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "course_type" varchar DEFAULT 'self_paced';--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "is_live_course" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "google_meet_link" varchar;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "course_group_id" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "difficulty" varchar DEFAULT 'beginner';--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "thumbnail" varchar;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "prerequisites" text[];--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "learning_outcomes" text[];--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "estimated_duration" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "module_id" varchar;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "notification_sent_1_day" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "notification_sent_1_hour" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "course_group_id" varchar;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "requires_quiz" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "quiz_required_to_unlock" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "passing_score" integer DEFAULT 70;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "max_attempts" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "unlock_message" text DEFAULT 'Complete the previous module and pass the quiz to unlock this content.';--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "activated_at" timestamp;--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "payment_status" varchar DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "payment_screenshot" varchar;--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "transaction_id" varchar;--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "payment_notes" text;--> statement-breakpoint
ALTER TABLE "user_group_memberships" ADD COLUMN "admin_notes" text;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "group_id" varchar;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "module_id" varchar;--> statement-breakpoint
ALTER TABLE "user_progress" ADD COLUMN "content_item_id" varchar;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_subcategories" ADD CONSTRAINT "course_subcategories_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_group_id_course_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress" ADD CONSTRAINT "module_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_attempts" ADD CONSTRAINT "quiz_attempts_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_lesson_id_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."lessons"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_questions" ADD CONSTRAINT "quiz_questions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_category_id_course_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."course_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_groups" ADD CONSTRAINT "course_groups_subcategory_id_course_subcategories_id_fk" FOREIGN KEY ("subcategory_id") REFERENCES "public"."course_subcategories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_course_group_id_course_groups_id_fk" FOREIGN KEY ("course_group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "modules" ADD CONSTRAINT "modules_course_group_id_course_groups_id_fk" FOREIGN KEY ("course_group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_group_id_course_groups_id_fk" FOREIGN KEY ("group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_module_id_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_progress" ADD CONSTRAINT "user_progress_content_item_id_content_items_id_fk" FOREIGN KEY ("content_item_id") REFERENCES "public"."content_items"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" DROP COLUMN "category";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "handbook_url";--> statement-breakpoint
ALTER TABLE "lessons" DROP COLUMN "video_url";