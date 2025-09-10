CREATE TABLE "faqs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "header_footer_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar NOT NULL,
	"type" varchar NOT NULL,
	"title" varchar,
	"url" varchar,
	"content" text,
	"icon" varchar,
	"target" varchar DEFAULT '_self',
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"meta_title" varchar,
	"meta_description" text,
	"meta_keywords" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "home_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"section" varchar NOT NULL,
	"title" varchar,
	"subtitle" text,
	"description" text,
	"content" jsonb,
	"meta_title" varchar,
	"meta_description" text,
	"meta_keywords" text,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "page_content" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"page" varchar NOT NULL,
	"section" varchar NOT NULL,
	"title" varchar,
	"subtitle" text,
	"description" text,
	"content" jsonb,
	"image" varchar,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"meta_title" varchar,
	"meta_description" text,
	"meta_keywords" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar NOT NULL,
	"role" varchar NOT NULL,
	"company" varchar,
	"image" varchar,
	"content" text NOT NULL,
	"rating" integer DEFAULT 5 NOT NULL,
	"is_active" boolean DEFAULT true,
	"order_index" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
