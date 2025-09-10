ALTER TABLE "learning_paths" ADD COLUMN "requires_quiz" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "quiz_required_to_unlock" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "passing_score" integer DEFAULT 70;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "max_attempts" integer DEFAULT 3;--> statement-breakpoint
ALTER TABLE "learning_paths" ADD COLUMN "unlock_message" text DEFAULT 'Complete the previous session and pass the quiz to unlock this content.';