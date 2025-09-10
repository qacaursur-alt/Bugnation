CREATE TABLE "course_modules" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_group_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"order_index" integer NOT NULL,
	"is_active" boolean DEFAULT true,
	"requires_quiz" boolean DEFAULT false,
	"quiz_required_to_unlock" boolean DEFAULT false,
	"passing_score" integer DEFAULT 70,
	"max_attempts" integer DEFAULT 3,
	"unlock_message" text DEFAULT 'Complete the previous module and pass the quiz to unlock this content.',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "course_tutors" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_group_id" varchar NOT NULL,
	"tutor_id" varchar NOT NULL,
	"assigned_at" timestamp DEFAULT now(),
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_session_materials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"study_material_id" varchar NOT NULL,
	"order_index" integer DEFAULT 0,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "live_session_participants" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" varchar NOT NULL,
	"user_id" varchar NOT NULL,
	"enrollment_id" varchar NOT NULL,
	"joined_at" timestamp DEFAULT now(),
	"left_at" timestamp,
	"duration" integer DEFAULT 0,
	"attendance_status" varchar DEFAULT 'present',
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "module_progress_tracking" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"enrollment_id" varchar NOT NULL,
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
CREATE TABLE "module_quiz_attempts" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"module_id" varchar NOT NULL,
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
CREATE TABLE "module_quiz_questions" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" varchar NOT NULL,
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
CREATE TABLE "module_study_materials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"module_id" varchar NOT NULL,
	"study_material_id" varchar NOT NULL,
	"order_index" integer DEFAULT 0,
	"is_required" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "study_materials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" varchar NOT NULL,
	"course_group_id" varchar NOT NULL,
	"title" varchar NOT NULL,
	"description" text,
	"type" varchar NOT NULL,
	"file_url" varchar,
	"external_url" varchar,
	"file_name" varchar,
	"file_size" integer,
	"duration" integer,
	"thumbnail" varchar,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "enrollment_status" varchar DEFAULT 'open';--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "enrollment_cutoff_date" timestamp;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "is_enrollment_active" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "current_enrollments" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "parent_course_id" varchar;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "is_duplicate" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course_groups" ADD COLUMN "duplicate_of" varchar;--> statement-breakpoint
ALTER TABLE "home_content" ADD COLUMN "featured_course_ids" text[];--> statement-breakpoint
ALTER TABLE "home_content" ADD COLUMN "show_featured_courses" boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "session_status" varchar DEFAULT 'scheduled';--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "tutor_id" varchar;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "max_participants" integer;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "current_participants" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "session_link" varchar;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "session_password" varchar;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "recording_url" varchar;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "notes" text;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD COLUMN "notification_sent_15_min" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "course_modules" ADD CONSTRAINT "course_modules_course_group_id_course_groups_id_fk" FOREIGN KEY ("course_group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tutors" ADD CONSTRAINT "course_tutors_course_group_id_course_groups_id_fk" FOREIGN KEY ("course_group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_tutors" ADD CONSTRAINT "course_tutors_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_materials" ADD CONSTRAINT "live_session_materials_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_materials" ADD CONSTRAINT "live_session_materials_study_material_id_study_materials_id_fk" FOREIGN KEY ("study_material_id") REFERENCES "public"."study_materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_participants" ADD CONSTRAINT "live_session_participants_session_id_live_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."live_sessions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_participants" ADD CONSTRAINT "live_session_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_session_participants" ADD CONSTRAINT "live_session_participants_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress_tracking" ADD CONSTRAINT "module_progress_tracking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress_tracking" ADD CONSTRAINT "module_progress_tracking_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_progress_tracking" ADD CONSTRAINT "module_progress_tracking_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_quiz_attempts" ADD CONSTRAINT "module_quiz_attempts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_quiz_attempts" ADD CONSTRAINT "module_quiz_attempts_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_quiz_attempts" ADD CONSTRAINT "module_quiz_attempts_enrollment_id_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."enrollments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_quiz_questions" ADD CONSTRAINT "module_quiz_questions_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_study_materials" ADD CONSTRAINT "module_study_materials_module_id_course_modules_id_fk" FOREIGN KEY ("module_id") REFERENCES "public"."course_modules"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "module_study_materials" ADD CONSTRAINT "module_study_materials_study_material_id_study_materials_id_fk" FOREIGN KEY ("study_material_id") REFERENCES "public"."study_materials"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_materials" ADD CONSTRAINT "study_materials_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "study_materials" ADD CONSTRAINT "study_materials_course_group_id_course_groups_id_fk" FOREIGN KEY ("course_group_id") REFERENCES "public"."course_groups"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "live_sessions" ADD CONSTRAINT "live_sessions_tutor_id_users_id_fk" FOREIGN KEY ("tutor_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;