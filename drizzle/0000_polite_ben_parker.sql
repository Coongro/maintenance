CREATE TABLE "module_maintenance_work_orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"building_id" uuid,
	"unit_id" uuid,
	"reported_by_contact_id" uuid,
	"vendor_contact_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"priority" text NOT NULL,
	"category" text,
	"status" text NOT NULL,
	"paid_by" text,
	"reported_at" text,
	"scheduled_at" text,
	"completed_at" text,
	"estimated_cost" numeric,
	"cost" numeric,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE INDEX "idx_work_orders_status" ON "module_maintenance_work_orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_work_orders_building" ON "module_maintenance_work_orders" USING btree ("building_id");--> statement-breakpoint
CREATE INDEX "idx_work_orders_unit" ON "module_maintenance_work_orders" USING btree ("unit_id");