import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  password: varchar("password"), // For dummy auth system
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { enum: ["admin", "staff", "manager"] }).notNull().default("staff"),
  branchId: varchar("branch_id"), // Associated branch for staff/manager users
  isActive: text("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Privacy settings table - admin-controlled privacy rules
export const privacySettings = pgTable("privacy_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  settingKey: varchar("setting_key").notNull().unique(), // e.g., 'manager_branch_isolation', 'staff_own_leads_only'
  isEnabled: boolean("is_enabled").default(true),
  description: varchar("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Leads table for rental inquiries
export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fullName: varchar("full_name").notNull(),
  email: varchar("email").notNull(),
  phone: varchar("phone").notNull(),
  location: varchar("location").notNull(),
  vehicleType: varchar("vehicle_type").notNull(),
  vehicleModel: varchar("vehicle_model"),
  rentalStartDate: timestamp("rental_start_date").notNull(),
  rentalEndDate: timestamp("rental_end_date").notNull(),
  rentalPeriodDays: integer("rental_period_days").notNull(),
  status: varchar("status", { enum: ["new", "contacted", "converted", "declined"] }).notNull().default("new"),
  sourceType: varchar("source_type", { enum: ["website", "phone", "email", "social_media", "referral", "walk_in", "partner", "advertisement", "other"] }).notNull().default("website"),
  isArchived: boolean("is_archived").default(false),
  specialRequirements: text("special_requirements"),
  customFields: jsonb("custom_fields").$type<Record<string, string>>().default({}),
  // Privacy and ownership fields
  createdBy: varchar("created_by"), // User ID who created the lead
  assignedBranch: varchar("assigned_branch"), // Branch ID this lead belongs to
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdBy: true,
  assignedBranch: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  rentalStartDate: z.union([z.string().min(1, "Start date is required"), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
  rentalEndDate: z.union([z.string().min(1, "End date is required"), z.date()]).transform((val) => 
    typeof val === 'string' ? new Date(val) : val
  ),
});

export const updateLeadSchema = insertLeadSchema.partial();

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email("Please enter a valid email address"),
  firstName: z.string().min(1, "Please enter a first name").max(50, "First name is too long"),
  lastName: z.string().min(1, "Please enter a last name").max(50, "Last name is too long"),
  role: z.enum(["admin", "manager", "staff"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  isActive: z.enum(["true", "false"], {
    errorMap: () => ({ message: "Please select if the user is active" })
  })
});

export const updateUserSchema = insertUserSchema.partial();

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type PrivacySetting = typeof privacySettings.$inferSelect;
export type InsertPrivacySetting = typeof privacySettings.$inferInsert;

// Field configuration table for customizing required/optional fields
export const fieldConfigurations = pgTable("field_configurations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  fieldName: varchar("field_name").notNull().unique(),
  isRequired: boolean("is_required").default(true),
  isVisible: boolean("is_visible").default(true),
  label: varchar("label").notNull(),
  placeholder: varchar("placeholder"),
  helpText: varchar("help_text"),
  fieldOrder: integer("field_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFieldConfigurationSchema = createInsertSchema(fieldConfigurations).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const updateFieldConfigurationSchema = insertFieldConfigurationSchema.partial();

export type FieldConfiguration = typeof fieldConfigurations.$inferSelect;
export type InsertFieldConfiguration = z.infer<typeof insertFieldConfigurationSchema>;
export type UpdateFieldConfiguration = z.infer<typeof updateFieldConfigurationSchema>;

// Branches table for different Q-Mobility locations
export const branches = pgTable("branches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  address: varchar("address").notNull(),
  city: varchar("city").notNull(),
  phone: varchar("phone").notNull(),
  email: varchar("email").notNull().unique(),
  managerName: varchar("manager_name").notNull(),
  isActive: varchar("is_active").notNull().default("true"),
  generatedPassword: varchar("generated_password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBranchSchema = createInsertSchema(branches).omit({
  id: true,
  generatedPassword: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Please enter a branch name").max(100, "Branch name is too long"),
  address: z.string().min(1, "Please enter a branch address").max(200, "Address is too long"),
  city: z.string().min(1, "Please enter a city").max(50, "City name is too long"),
  phone: z.string().min(1, "Please enter a phone number").max(20, "Phone number is too long"),
  email: z.string().email("Please enter a valid email address"),
  managerName: z.string().min(1, "Please enter the manager's name").max(100, "Manager name is too long"),
  isActive: z.enum(["true", "false"], {
    errorMap: () => ({ message: "Please select if the branch is active" })
  })
});

export const updateBranchSchema = insertBranchSchema.partial();

export type InsertBranch = z.infer<typeof insertBranchSchema>;
export type UpdateBranch = z.infer<typeof updateBranchSchema>;
export type Branch = typeof branches.$inferSelect;

// Branch Users table - Staff members assigned to specific branches
export const branchUsers = pgTable("branch_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  branchId: varchar("branch_id").notNull().references(() => branches.id, { onDelete: "cascade" }),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  email: varchar("email").notNull().unique(),
  generatedPassword: varchar("generated_password").notNull(),
  role: varchar("role").notNull().default("staff"), // staff or manager
  isActive: varchar("is_active").notNull().default("true"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertBranchUserSchema = createInsertSchema(branchUsers).omit({
  id: true,
  generatedPassword: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  branchId: z.string().min(1, "Please select a branch"),
  firstName: z.string().min(1, "Please enter a first name").max(50, "First name is too long"),
  lastName: z.string().min(1, "Please enter a last name").max(50, "Last name is too long"),
  email: z.string().email("Please enter a valid email address"),
  role: z.enum(["staff", "manager"], {
    errorMap: () => ({ message: "Please select a valid role" })
  }),
  isActive: z.enum(["true", "false"], {
    errorMap: () => ({ message: "Please select if the user is active" })
  })
});

export const updateBranchUserSchema = insertBranchUserSchema.partial();

export type InsertBranchUser = z.infer<typeof insertBranchUserSchema>;
export type UpdateBranchUser = z.infer<typeof updateBranchUserSchema>;
export type BranchUser = typeof branchUsers.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type UpdateLead = z.infer<typeof updateLeadSchema>;
export type Lead = typeof leads.$inferSelect;

// Vehicle configuration tables
export const vehicleTypes = pgTable("vehicle_types", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleMakes = pgTable("vehicle_makes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull().unique(),
  typeId: varchar("type_id").notNull().references(() => vehicleTypes.id),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehicleModels = pgTable("vehicle_models", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  makeId: varchar("make_id").notNull().references(() => vehicleMakes.id),
  year: integer("year"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vehiclePlates = pgTable("vehicle_plates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  plateNumber: varchar("plate_number").notNull().unique(),
  modelId: varchar("model_id").notNull().references(() => vehicleModels.id),
  color: varchar("color"),
  status: varchar("status").default("available"), // available, rented, maintenance
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Vehicle schemas
export const insertVehicleTypeSchema = createInsertSchema(vehicleTypes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Please enter a vehicle type name").max(50, "Type name is too long"),
  description: z.string().max(500, "Description is too long").optional()
});

export const insertVehicleMakeSchema = createInsertSchema(vehicleMakes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Please enter a vehicle make name").max(50, "Make name is too long"),
  typeId: z.string().min(1, "Please select a vehicle type")
});

export const insertVehicleModelSchema = createInsertSchema(vehicleModels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  name: z.string().min(1, "Please enter a vehicle model name").max(100, "Model name is too long"),
  makeId: z.string().min(1, "Please select a vehicle make"),
  year: z.number().int().min(1900, "Please enter a valid year").max(new Date().getFullYear() + 5, "Year cannot be too far in the future").optional()
});

export const insertVehiclePlateSchema = createInsertSchema(vehiclePlates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  plateNumber: z.string().min(1, "Please enter a plate number").max(20, "Plate number is too long"),
  modelId: z.string().min(1, "Please select a vehicle model"),
  color: z.string().max(30, "Color name is too long").optional(),
  status: z.enum(["available", "rented", "maintenance"], {
    errorMap: () => ({ message: "Please select a valid status" })
  }).optional()
});

export type VehicleType = typeof vehicleTypes.$inferSelect;
export type InsertVehicleType = z.infer<typeof insertVehicleTypeSchema>;
export type UpdateVehicleType = Partial<InsertVehicleType>;

export type VehicleMake = typeof vehicleMakes.$inferSelect;
export type InsertVehicleMake = z.infer<typeof insertVehicleMakeSchema>;
export type UpdateVehicleMake = Partial<InsertVehicleMake>;

export type VehicleModel = typeof vehicleModels.$inferSelect;
export type InsertVehicleModel = z.infer<typeof insertVehicleModelSchema>;
export type UpdateVehicleModel = Partial<InsertVehicleModel>;

export type VehiclePlate = typeof vehiclePlates.$inferSelect;
export type InsertVehiclePlate = z.infer<typeof insertVehiclePlateSchema>;
export type UpdateVehiclePlate = Partial<InsertVehiclePlate>;

// Bulk upload schemas
export const bulkVehicleUploadSchema = z.object({
  vehicleTypes: z.array(insertVehicleTypeSchema).optional(),
  vehicleMakes: z.array(insertVehicleMakeSchema).optional(),
  vehicleModels: z.array(insertVehicleModelSchema).optional(),
  vehiclePlates: z.array(insertVehiclePlateSchema).optional(),
});

export type BulkVehicleUpload = z.infer<typeof bulkVehicleUploadSchema>;
