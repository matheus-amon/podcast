CREATE TYPE "public"."billing_status" AS ENUM('PAID', 'PENDING', 'OVERDUE', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."budget_status" AS ENUM('PLANNED', 'APPROVED', 'PAID', 'PENDING');--> statement-breakpoint
CREATE TYPE "public"."budget_type" AS ENUM('INCOME', 'EXPENSE');--> statement-breakpoint
CREATE TYPE "public"."episode_status" AS ENUM('PLANNED', 'SCRIPTING', 'RECORDED', 'EDITING', 'PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."event_status" AS ENUM('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('RECORDING', 'RELEASE', 'MEETING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."lead_interaction_type" AS ENUM('EMAIL', 'CALL', 'MESSAGE', 'MEETING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."lead_status" AS ENUM('PROSPECT', 'CONTACTED', 'CONFIRMED', 'RECORDED');--> statement-breakpoint
CREATE TYPE "public"."payment_method" AS ENUM('CREDIT_CARD', 'DEBIT_CARD', 'PIX', 'BOLETO', 'BANK_TRANSFER', 'PAYPAL', 'STRIPE');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'REFUNDED', 'CHARGEBACK');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('GUEST', 'HOST', 'PRODUCER');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('TODO', 'IN_PROGRESS', 'DONE');--> statement-breakpoint
CREATE TABLE "agenda" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"type" "event_type" DEFAULT 'MEETING',
	"status" "event_status" DEFAULT 'SCHEDULED',
	"lead_id" integer,
	"episode_id" integer,
	"participants" jsonb,
	"color" text DEFAULT '#3B82F6',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "billing" (
	"id" serial PRIMARY KEY NOT NULL,
	"client_name" text NOT NULL,
	"amount" double precision NOT NULL,
	"due_date" date NOT NULL,
	"status" "billing_status" DEFAULT 'PENDING',
	"invoice_number" text,
	"subscription_plan" text,
	"description" text,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "budget" (
	"id" serial PRIMARY KEY NOT NULL,
	"concept" text NOT NULL,
	"amount" double precision NOT NULL,
	"type" "budget_type" DEFAULT 'EXPENSE',
	"category" text NOT NULL,
	"date" date DEFAULT now(),
	"responsible" text,
	"status" "budget_status" DEFAULT 'PENDING',
	"connected_episode_id" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "budget_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"items" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "episodes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"season" integer DEFAULT 1,
	"number" integer,
	"status" "episode_status" DEFAULT 'PLANNED',
	"publish_date" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "lead_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer NOT NULL,
	"type" "lead_interaction_type" DEFAULT 'OTHER',
	"content" text NOT NULL,
	"date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text,
	"role" "role" DEFAULT 'GUEST',
	"status" "lead_status" DEFAULT 'PROSPECT',
	"source" text DEFAULT 'unknown',
	"assigned_to" text,
	"company" text,
	"position" text,
	"avatar_url" text,
	"bio" text,
	"linkedin_url" text,
	"tags" jsonb,
	"notes" text,
	"last_contact" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"revenue" double precision DEFAULT 0,
	"active_episodes" integer DEFAULT 0,
	"new_leads" integer DEFAULT 0,
	"storage_used" double precision DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"invoice_id" integer NOT NULL,
	"amount" double precision NOT NULL,
	"method" "payment_method" NOT NULL,
	"status" "payment_status" DEFAULT 'PENDING',
	"transaction_id" text,
	"paid_at" timestamp,
	"refunded_at" timestamp,
	"refund_reason" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "production_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer,
	"title" text NOT NULL,
	"status" "task_status" DEFAULT 'TODO',
	"assignee" text,
	"due_date" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" uuid PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"revoked_at" timestamp,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "scripts" (
	"id" serial PRIMARY KEY NOT NULL,
	"episode_id" integer NOT NULL,
	"content" text,
	"version" integer DEFAULT 1,
	"last_edited_by" text,
	"updated_at" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"name" varchar(100) NOT NULL,
	"avatar_url" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"email_verified_at" timestamp,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "whitelabel_config" (
	"id" serial PRIMARY KEY NOT NULL,
	"logo_url" text,
	"primary_color" text DEFAULT '#3B82F6',
	"secondary_color" text DEFAULT '#1E40AF',
	"company_name" text DEFAULT 'Podcast SaaS',
	"subdomain" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agenda" ADD CONSTRAINT "agenda_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_connected_episode_id_episodes_id_fk" FOREIGN KEY ("connected_episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lead_interactions" ADD CONSTRAINT "lead_interactions_lead_id_leads_id_fk" FOREIGN KEY ("lead_id") REFERENCES "public"."leads"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "production_tasks" ADD CONSTRAINT "production_tasks_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scripts" ADD CONSTRAINT "scripts_episode_id_episodes_id_fk" FOREIGN KEY ("episode_id") REFERENCES "public"."episodes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_agenda_start_date" ON "agenda" USING btree ("start_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_agenda_lead_id" ON "agenda" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_agenda_episode_id" ON "agenda" USING btree ("episode_id");--> statement-breakpoint
CREATE INDEX "idx_agenda_status" ON "agenda" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_billing_status" ON "billing" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_billing_due_date" ON "billing" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "idx_billing_invoice_number" ON "billing" USING btree ("invoice_number");--> statement-breakpoint
CREATE INDEX "idx_budget_type" ON "budget" USING btree ("type");--> statement-breakpoint
CREATE INDEX "idx_budget_category" ON "budget" USING btree ("category");--> statement-breakpoint
CREATE INDEX "idx_budget_date" ON "budget" USING btree ("date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_budget_episode_id" ON "budget" USING btree ("connected_episode_id");--> statement-breakpoint
CREATE INDEX "idx_episodes_status" ON "episodes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_episodes_publish_date" ON "episodes" USING btree ("publish_date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_lead_interactions_lead_id" ON "lead_interactions" USING btree ("lead_id");--> statement-breakpoint
CREATE INDEX "idx_lead_interactions_date" ON "lead_interactions" USING btree ("date" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leads_email" ON "leads" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_leads_status" ON "leads" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_leads_created_at" ON "leads" USING btree ("created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "idx_leads_assigned_to" ON "leads" USING btree ("assigned_to");--> statement-breakpoint
CREATE INDEX "idx_leads_source" ON "leads" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_payments_invoice_id" ON "payments" USING btree ("invoice_id");--> statement-breakpoint
CREATE INDEX "idx_payments_status" ON "payments" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payments_transaction_id" ON "payments" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "idx_production_tasks_episode_id" ON "production_tasks" USING btree ("episode_id");--> statement-breakpoint
CREATE INDEX "idx_production_tasks_status" ON "production_tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_user_id" ON "refresh_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_token" ON "refresh_tokens" USING btree ("token");--> statement-breakpoint
CREATE INDEX "idx_refresh_tokens_expires" ON "refresh_tokens" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "idx_users_email" ON "users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_active" ON "users" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_users_deleted" ON "users" USING btree ("deleted_at");