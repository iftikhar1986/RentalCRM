import {
  users,
  leads,
  branches,
  branchUsers,
  vehicleTypes,
  vehicleMakes,
  vehicleModels,
  vehiclePlates,
  fieldConfigurations,
  privacySettings,
  type User,
  type UpsertUser,
  type InsertUser,
  type UpdateUser,
  type Lead,
  type InsertLead,
  type UpdateLead,
  type Branch,
  type InsertBranch,
  type UpdateBranch,
  type BranchUser,
  type InsertBranchUser,
  type UpdateBranchUser,
  type VehicleType,
  type InsertVehicleType,
  type UpdateVehicleType,
  type VehicleMake,
  type InsertVehicleMake,
  type UpdateVehicleMake,
  type VehicleModel,
  type InsertVehicleModel,
  type UpdateVehicleModel,
  type VehiclePlate,
  type InsertVehiclePlate,
  type UpdateVehiclePlate,
  type FieldConfiguration,
  type InsertFieldConfiguration,
  type UpdateFieldConfiguration,
  type PrivacySetting,
  type InsertPrivacySetting,
} from "@shared/schema";
import { db } from "./db";
import { eq, ilike, or, and, desc, asc, count, sql, gte, inArray } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations - mandatory for Replit Auth
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User management operations  
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createStaffUser(userData: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  updateUserPassword(id: string, password: string): Promise<void>;
  updateUserStatus(id: string, isActive: string): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  // Profile management operations
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getCurrentPassword(id: string): Promise<string | null>;
  changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean>;
  updateProfileImage(id: string, file: Express.Multer.File): Promise<string>;
  
  // Lead operations
  getLeads(filters?: {
    search?: string;
    status?: string;
    dateRange?: string;
    vehicleType?: string;
    location?: string;
    assignedBranch?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    archived?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
    userId?: string;
    userRole?: string;
    userBranchId?: string;
  }): Promise<{
    leads: Lead[];
    total: number;
  }>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead, createdBy?: string, assignedBranch?: string): Promise<Lead>;
  updateLead(id: string, lead: UpdateLead): Promise<Lead>;
  deleteLead(id: string): Promise<void>;
  archiveLead(id: string): Promise<Lead>;
  bulkArchiveLeads(leadIds: string[]): Promise<void>;
  bulkDeleteLeads(leadIds: string[]): Promise<void>;
  bulkUpdateLeadStatus(leadIds: string[], status: string): Promise<void>;
  getLeadStats(): Promise<{
    total: number;
    converted: number;
    pending: number;
    declined: number;
  }>;
  
  // Analytics operations
  getAnalytics(): Promise<any>;
  
  // Branch operations
  getBranches(): Promise<Branch[]>;
  getBranch(id: string): Promise<Branch | undefined>;
  getBranchByEmail(email: string): Promise<Branch | undefined>;
  createBranch(branch: InsertBranch): Promise<Branch>;
  updateBranch(id: string, updates: UpdateBranch): Promise<Branch>;
  updateBranchStatus(id: string, isActive: string): Promise<Branch>;
  deleteBranch(id: string): Promise<void>;
  
  // Branch User operations
  getBranchUsers(branchId: string): Promise<BranchUser[]>;
  getAllBranchUsers(): Promise<BranchUser[]>;
  getBranchUserByEmail(email: string): Promise<BranchUser | undefined>;
  createBranchUser(branchUser: InsertBranchUser): Promise<BranchUser>;
  updateBranchUserStatus(id: string, isActive: string): Promise<BranchUser>;
  deleteBranchUser(id: string): Promise<void>;

  // Vehicle management operations
  // Vehicle Types
  getVehicleTypes(): Promise<VehicleType[]>;
  getAllVehicleTypes(): Promise<VehicleType[]>;
  getVehicleType(id: string): Promise<VehicleType | undefined>;
  createVehicleType(vehicleType: InsertVehicleType): Promise<VehicleType>;
  updateVehicleType(id: string, vehicleType: UpdateVehicleType): Promise<VehicleType>;
  deleteVehicleType(id: string): Promise<void>;

  // Vehicle Makes
  getVehicleMakes(): Promise<VehicleMake[]>;
  getAllVehicleMakes(): Promise<VehicleMake[]>;
  getVehicleMake(id: string): Promise<VehicleMake | undefined>;
  createVehicleMake(vehicleMake: InsertVehicleMake): Promise<VehicleMake>;
  updateVehicleMake(id: string, vehicleMake: UpdateVehicleMake): Promise<VehicleMake>;
  deleteVehicleMake(id: string): Promise<void>;

  // Vehicle Models
  getVehicleModels(): Promise<VehicleModel[]>;
  getAllVehicleModels(): Promise<VehicleModel[]>;
  getVehicleModel(id: string): Promise<VehicleModel | undefined>;
  createVehicleModel(vehicleModel: InsertVehicleModel): Promise<VehicleModel>;
  updateVehicleModel(id: string, vehicleModel: UpdateVehicleModel): Promise<VehicleModel>;
  deleteVehicleModel(id: string): Promise<void>;

  // Vehicle Plates
  getVehiclePlates(): Promise<VehiclePlate[]>;
  getAllVehiclePlates(): Promise<VehiclePlate[]>;
  getVehiclePlate(id: string): Promise<VehiclePlate | undefined>;
  createVehiclePlate(vehiclePlate: InsertVehiclePlate): Promise<VehiclePlate>;
  updateVehiclePlate(id: string, vehiclePlate: UpdateVehiclePlate): Promise<VehiclePlate>;
  deleteVehiclePlate(id: string): Promise<void>;

  // Field configuration operations
  getFieldConfigurations(): Promise<FieldConfiguration[]>;
  createFieldConfiguration(data: InsertFieldConfiguration): Promise<FieldConfiguration>;
  updateFieldConfiguration(id: string, data: UpdateFieldConfiguration): Promise<FieldConfiguration>;
  deleteFieldConfiguration(id: string): Promise<void>;
  getFieldConfigurationByName(fieldName: string): Promise<FieldConfiguration | undefined>;

  // Bulk vehicle operations
  bulkUploadVehicles(data: {
    vehicleTypes?: InsertVehicleType[];
    vehicleMakes?: InsertVehicleMake[];
    vehicleModels?: InsertVehicleModel[];
    vehiclePlates?: InsertVehiclePlate[];
  }): Promise<{
    vehicleTypes: VehicleType[];
    vehicleMakes: VehicleMake[];
    vehicleModels: VehicleModel[];
    vehiclePlates: VehiclePlate[];
    summary: {
      typesCreated: number;
      makesCreated: number;
      modelsCreated: number;
      platesCreated: number;
    };
  }>;

  // Privacy settings operations
  getPrivacySettings(): Promise<PrivacySetting[]>;
  updatePrivacySetting(id: string, isEnabled: boolean): Promise<PrivacySetting>;
  getPrivacySettingByKey(key: string): Promise<PrivacySetting | undefined>;
  
  // First admin protection
  isFirstAdminUser(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations - mandatory for Replit Auth
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // User management operations
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(asc(users.createdAt));
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createStaffUser(userData: InsertUser & { password: string }): Promise<User> {
    // Hash the provided password (using simple base64 encoding for demo - in production, use proper bcrypt)
    const hashedPassword = Buffer.from(userData.password).toString('base64');
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword, // Store hashed password
      })
      .returning();
    
    return user;
  }

  async updateUserStatus(id: string, isActive: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Profile management operations
  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async updateUserPassword(id: string, password: string): Promise<void> {
    // Hash/encode the password using base64 for consistency with existing system
    const hashedPassword = Buffer.from(password).toString('base64');
    
    await db
      .update(users)
      .set({ password: hashedPassword, updatedAt: new Date() })
      .where(eq(users.id, id));
  }

  async getCurrentPassword(id: string): Promise<string | null> {
    if (!id) {
      return null;
    }

    console.log("getCurrentPassword called with id:", id);

    // Check if this is a branch manager
    if (id.startsWith("branch-")) {
      const branchId = id.replace("branch-", "");
      const [branch] = await db.select().from(branches).where(eq(branches.id, branchId));
      return branch?.generatedPassword || null;
    }

    // Check if this is a branch user
    if (id.startsWith("branch-user-")) {
      const branchUserId = id.replace("branch-user-", "");
      const [branchUser] = await db.select().from(branchUsers).where(eq(branchUsers.id, branchUserId));
      return branchUser?.generatedPassword || null;
    }

    // Handle database users (base64-encoded passwords)
    const [user] = await db.select().from(users).where(eq(users.id, id));
    if (user?.password) {
      try {
        return Buffer.from(user.password, 'base64').toString();
      } catch (error) {
        return user.password;
      }
    }

    return null;
  }

  async changePassword(id: string, currentPassword: string, newPassword: string): Promise<boolean> {
    // Validate input parameters
    if (!id || !currentPassword || !newPassword) {
      console.error("changePassword: Missing required parameters", { id: !!id, currentPassword: !!currentPassword, newPassword: !!newPassword });
      return false;
    }

    console.log("changePassword called with id:", id);

    // Check if this is a branch manager (ID format: branch-{branchId})
    if (id.startsWith("branch-")) {
      const branchId = id.replace("branch-", "");
      const [branch] = await db.select().from(branches).where(eq(branches.id, branchId));
      
      if (!branch) {
        return false;
      }

      // Validate current password for branch manager
      if (branch.generatedPassword !== currentPassword) {
        return false;
      }

      // Update branch manager password
      await db
        .update(branches)
        .set({ generatedPassword: newPassword, updatedAt: new Date() })
        .where(eq(branches.id, branchId));

      return true;
    }

    // Check if this is a branch user (ID format: branch-user-{branchUserId})
    if (id.startsWith("branch-user-")) {
      const branchUserId = id.replace("branch-user-", "");
      const [branchUser] = await db.select().from(branchUsers).where(eq(branchUsers.id, branchUserId));
      
      if (!branchUser) {
        return false;
      }

      // Validate current password for branch user
      if (branchUser.generatedPassword !== currentPassword) {
        return false;
      }

      // Update branch user password
      await db
        .update(branchUsers)
        .set({ generatedPassword: newPassword, updatedAt: new Date() })
        .where(eq(branchUsers.id, branchUserId));

      return true;
    }

    // Handle admin-created users (stored in users table with base64-encoded passwords)
    const [user] = await db.select().from(users).where(eq(users.id, id));
    
    if (!user) {
      return false;
    }

    // Decode the stored password and compare
    let storedPassword = '';
    if (user.password) {
      try {
        storedPassword = Buffer.from(user.password, 'base64').toString();
      } catch (error) {
        // If decoding fails, treat as plain text for backward compatibility
        storedPassword = user.password;
      }
    }

    if (storedPassword !== currentPassword) {
      return false;
    }

    // Encode the new password and update
    const encodedNewPassword = Buffer.from(newPassword).toString('base64');
    await db
      .update(users)
      .set({ password: encodedNewPassword, updatedAt: new Date() })
      .where(eq(users.id, id));

    return true;
  }

  async updateProfileImage(id: string, file: Express.Multer.File): Promise<string> {
    // In a real application, you would upload this to a cloud storage service
    // For this demo, we'll simulate the upload and store a reference
    const imageUrl = `/uploads/profile/${id}_${Date.now()}_${file.originalname}`;
    
    // Update user's profile image URL
    await db
      .update(users)
      .set({ profileImageUrl: imageUrl, updatedAt: new Date() })
      .where(eq(users.id, id));

    return imageUrl;
  }

  // Lead operations
  async getLeads(filters?: {
    search?: string;
    status?: string;
    dateRange?: string;
    vehicleType?: string;
    location?: string;
    assignedBranch?: string;
    assignedTo?: string;
    startDate?: string;
    endDate?: string;
    archived?: string;
    createdBy?: string;
    limit?: number;
    offset?: number;
    // Privacy filters
    userId?: string;
    userRole?: string;
    userBranchId?: string;
  }): Promise<{
    leads: Lead[];
    total: number;
  }> {
    let query = db.select().from(leads);
    let countQuery = db.select({ count: count() }).from(leads);

    const conditions: any[] = [];

    if (filters?.search) {
      const searchCondition = or(
        ilike(leads.fullName, `%${filters.search}%`),
        ilike(leads.email, `%${filters.search}%`),
        ilike(leads.phone, `%${filters.search}%`),
        ilike(leads.vehicleType, `%${filters.search}%`),
        ilike(leads.vehicleModel, `%${filters.search}%`),
        ilike(leads.location, `%${filters.search}%`)
      );
      conditions.push(searchCondition);
    }

    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(leads.status, filters.status as any));
    }

    if (filters?.vehicleType && filters.vehicleType !== "all") {
      conditions.push(eq(leads.vehicleType, filters.vehicleType));
    }

    if (filters?.location && filters.location !== "all") {
      conditions.push(ilike(leads.location, `%${filters.location}%`));
    }

    // Branch-specific filters
    if (filters?.assignedBranch && filters.assignedBranch !== "all") {
      conditions.push(eq(leads.assignedBranch, filters.assignedBranch));
    }

    if (filters?.assignedTo && filters.assignedTo !== "all") {
      conditions.push(eq(leads.createdBy, filters.assignedTo));
    }

    // Filter by specific staff member (for staff performance tracking)
    if (filters?.createdBy && filters.createdBy !== "all") {
      conditions.push(eq(leads.createdBy, filters.createdBy));
    }

    // Filter by archived status
    const isArchived = filters?.archived === "true";
    conditions.push(eq(leads.isArchived, isArchived));

    // Apply privacy-based filtering based on admin-configured settings
    if (filters?.userId && filters?.userRole) {
      if (filters.userRole === 'admin') {
        // Admin can see all leads - no additional filter
      } else {
        // Check if admin-created leads should be visible to all branches and staff
        const adminLeadsVisibleSetting = await this.getPrivacySettingByKey('admin_leads_visible_to_all');
        const adminLeadsVisible = adminLeadsVisibleSetting?.isEnabled || false;
        
        // Get all admin user IDs for checking admin-created leads
        const adminUsers = await db.select({ id: users.id }).from(users).where(eq(users.role, 'admin'));
        const adminUserIds = adminUsers.map(admin => admin.id);
        
        if (filters.userRole === 'manager' && filters.userBranchId) {
          // Check if manager branch isolation is enabled
          const branchIsolationSetting = await this.getPrivacySettingByKey('manager_branch_isolation');
          if (branchIsolationSetting?.isEnabled) {
            if (adminLeadsVisible && adminUserIds.length > 0) {
              // Allow admin-created leads OR branch-assigned leads
              const adminLeadConditions = adminUserIds.map(adminId => eq(leads.createdBy, adminId));
              conditions.push(
                or(
                  eq(leads.assignedBranch, filters.userBranchId),
                  ...adminLeadConditions // Admin-created leads are visible
                )
              );
            } else {
              // Only branch-assigned leads
              conditions.push(eq(leads.assignedBranch, filters.userBranchId));
            }
          }
        } else if (filters.userRole === 'staff') {
          // Check if staff own leads only is enabled
          const ownLeadsOnlySetting = await this.getPrivacySettingByKey('staff_own_leads_only');
          if (ownLeadsOnlySetting?.isEnabled) {
            if (adminLeadsVisible && adminUserIds.length > 0) {
              // Allow own leads OR admin-created leads
              const adminLeadConditions = adminUserIds.map(adminId => eq(leads.createdBy, adminId));
              conditions.push(
                or(
                  eq(leads.createdBy, filters.userId),
                  ...adminLeadConditions // Admin-created leads are visible
                )
              );
            } else {
              // Only own leads
              conditions.push(eq(leads.createdBy, filters.userId));
            }
          } else {
            // Staff can see branch leads - check if admin leads should also be visible
            const branchLeadsAccessSetting = await this.getPrivacySettingByKey('staff_branch_leads_access');
            
            if (adminLeadsVisible && adminUserIds.length > 0) {
              // If admin leads should be visible, add them to the conditions
              const adminLeadConditions = adminUserIds.map(adminId => eq(leads.createdBy, adminId));
              
              if (branchLeadsAccessSetting?.isEnabled && filters.userBranchId) {
                // Allow branch leads OR admin-created leads
                conditions.push(
                  or(
                    eq(leads.assignedBranch, filters.userBranchId),
                    ...adminLeadConditions // Admin-created leads are visible
                  )
                );
              } else {
                // Only admin-created leads (no branch restriction)
                conditions.push(or(...adminLeadConditions));
              }
            } else if (branchLeadsAccessSetting?.isEnabled && filters.userBranchId) {
              // Only branch leads (no admin leads)
              conditions.push(eq(leads.assignedBranch, filters.userBranchId));
            }
            // If neither admin leads nor branch access is enabled, staff see no leads
          }
        }
      }
    }

    // Handle custom date range
    if (filters?.startDate && filters?.endDate) {
      const startDate = new Date(filters.startDate);
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999); // End of day
      
      conditions.push(gte(leads.createdAt, startDate));
      conditions.push(sql`${leads.createdAt} <= ${endDate.toISOString()}`);
    } else if (filters?.dateRange && filters.dateRange !== "all") {
      const now = new Date();
      let startDate: Date;
      
      switch (filters.dateRange) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'quarter':
          const quarterStart = Math.floor(now.getMonth() / 3) * 3;
          startDate = new Date(now.getFullYear(), quarterStart, 1);
          break;
        default:
          startDate = new Date(0);
      }
      
      if (startDate.getTime() > 0) {
        conditions.push(gte(leads.createdAt, startDate));
      }
    }

    if (conditions.length > 0) {
      const condition = conditions.length === 1 ? conditions[0] : and(...conditions);
      query = query.where(condition) as any;
      countQuery = countQuery.where(condition) as any;
    }

    query = query.orderBy(desc(leads.createdAt)) as any;

    if (filters?.limit) {
      query = query.limit(filters.limit) as any;
    }

    if (filters?.offset) {
      query = query.offset(filters.offset) as any;
    }

    const [leadsResult, totalResult] = await Promise.all([
      query,
      countQuery
    ]);

    // Apply data masking based on privacy settings
    const processedLeads = await this.applyPrivacyFiltering(leadsResult, filters);

    return {
      leads: processedLeads,
      total: totalResult[0]?.count || 0
    };
  }

  // Apply privacy-based data masking and filtering
  private async applyPrivacyFiltering(leads: Lead[], filters?: any): Promise<Lead[]> {
    if (!filters?.userRole || filters.userRole === 'admin') {
      return leads; // Admins see everything
    }

    // Get privacy settings for data masking
    const hideContactDetailsSetting = await this.getPrivacySettingByKey('hide_contact_details');
    const anonymizeCustomerDataSetting = await this.getPrivacySettingByKey('anonymize_customer_data');

    return leads.map(lead => {
      const processedLead = { ...lead };

      // Hide contact details for non-admin users if setting is enabled
      if (hideContactDetailsSetting?.isEnabled && filters.userRole !== 'admin') {
        processedLead.phone = '***-***-****';
        processedLead.email = '***@***.***';
      }

      // Anonymize customer data if setting is enabled
      if (anonymizeCustomerDataSetting?.isEnabled && filters.userRole !== 'admin') {
        // Only show first name initial for staff/manager
        const nameParts = processedLead.fullName?.split(' ') || [];
        if (nameParts.length > 0) {
          processedLead.fullName = `${nameParts[0].charAt(0)}. ***`;
        }
      }

      return processedLead;
    });
  }

  // Public method to access privacy filtering for routes
  async applyPrivacyFilteringPublic(leads: Lead[], filters?: any): Promise<Lead[]> {
    return this.applyPrivacyFiltering(leads, filters);
  }

  // Check if user has access to specific lead
  async hasLeadAccess(leadId: string, privacyFilters: any): Promise<boolean> {
    if (!privacyFilters?.userRole || privacyFilters.userRole === 'admin') {
      return true; // Admin has access to everything
    }

    const lead = await this.getLead(leadId);
    if (!lead) return false;

    // Check if admin-created leads should be visible to all
    const adminLeadsVisibleSetting = await this.getPrivacySettingByKey('admin_leads_visible_to_all');
    const adminLeadsVisible = adminLeadsVisibleSetting?.isEnabled || false;

    // If this is an admin-created lead and the setting is enabled, allow access
    if (adminLeadsVisible && lead.createdBy) {
      // Check if the lead creator is an admin user
      const creatorUser = await db.select().from(users).where(eq(users.id, lead.createdBy)).limit(1);
      if (creatorUser.length > 0 && creatorUser[0].role === 'admin') {
        return true;
      }
    }

    // Apply same privacy logic as getLeads
    if (privacyFilters.userRole === 'manager' && privacyFilters.userBranchId) {
      const branchIsolationSetting = await this.getPrivacySettingByKey('manager_branch_isolation');
      if (branchIsolationSetting?.isEnabled) {
        return lead.assignedBranch === privacyFilters.userBranchId;
      }
    } else if (privacyFilters.userRole === 'staff') {
      const ownLeadsOnlySetting = await this.getPrivacySettingByKey('staff_own_leads_only');
      if (ownLeadsOnlySetting?.isEnabled) {
        return lead.createdBy === privacyFilters.userId;
      }
      
      const branchLeadsAccessSetting = await this.getPrivacySettingByKey('staff_branch_leads_access');
      if (branchLeadsAccessSetting?.isEnabled && privacyFilters.userBranchId) {
        return lead.assignedBranch === privacyFilters.userBranchId;
      }
    }

    return true; // Default allow access
  }

  async getLead(id: string): Promise<Lead | undefined> {
    const [lead] = await db.select().from(leads).where(eq(leads.id, id));
    return lead;
  }

  async createLead(leadData: InsertLead, createdBy?: string, assignedBranch?: string): Promise<Lead> {
    const [lead] = await db
      .insert(leads)
      .values({
        ...leadData,
        createdBy,
        assignedBranch,
      })
      .returning();
    return lead;
  }

  async updateLead(id: string, leadData: UpdateLead): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ ...leadData, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async deleteLead(id: string): Promise<void> {
    await db.delete(leads).where(eq(leads.id, id));
  }

  async archiveLead(id: string): Promise<Lead> {
    const [lead] = await db
      .update(leads)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(eq(leads.id, id))
      .returning();
    return lead;
  }

  async bulkArchiveLeads(leadIds: string[]): Promise<void> {
    await db
      .update(leads)
      .set({ isArchived: true, updatedAt: new Date() })
      .where(inArray(leads.id, leadIds));
  }

  async bulkDeleteLeads(leadIds: string[]): Promise<void> {
    await db
      .delete(leads)
      .where(inArray(leads.id, leadIds));
  }

  async bulkUpdateLeadStatus(leadIds: string[], status: string): Promise<void> {
    await db
      .update(leads)
      .set({ status: status as any, updatedAt: new Date() })
      .where(inArray(leads.id, leadIds));
  }

  async getLeadStats(privacyFilters?: {
    userId?: string;
    userRole?: string;
    userBranchId?: string;
  }): Promise<{
    total: number;
    new: number;
    contacted: number;
    converted: number;
    pending: number;
    declined: number;
  }> {
    const conditions: any[] = [];
    
    // Apply privacy-based filtering based on admin-configured settings
    if (privacyFilters?.userId && privacyFilters?.userRole) {
      if (privacyFilters.userRole === 'admin') {
        // Admin can see all leads - no additional filter
      } else if (privacyFilters.userRole === 'manager' && privacyFilters.userBranchId) {
        // Check if manager branch isolation is enabled
        const branchIsolationSetting = await this.getPrivacySettingByKey('manager_branch_isolation');
        if (branchIsolationSetting?.isEnabled) {
          conditions.push(eq(leads.assignedBranch, privacyFilters.userBranchId));
        }
      } else if (privacyFilters.userRole === 'staff') {
        // Check if staff own leads only is enabled
        const ownLeadsOnlySetting = await this.getPrivacySettingByKey('staff_own_leads_only');
        if (ownLeadsOnlySetting?.isEnabled) {
          conditions.push(eq(leads.createdBy, privacyFilters.userId));
        }
      }
    }

    // Always filter out archived leads for stats
    conditions.push(eq(leads.isArchived, false));

    const baseConditions = conditions.length > 0 ? and(...conditions) : undefined;

    const [totalResult, newResult, contactedResult, convertedResult, declinedResult] = await Promise.all([
      db.select({ count: count() }).from(leads).where(baseConditions),
      db.select({ count: count() }).from(leads).where(and(eq(leads.status, "new"), baseConditions)),
      db.select({ count: count() }).from(leads).where(and(eq(leads.status, "contacted"), baseConditions)),
      db.select({ count: count() }).from(leads).where(and(eq(leads.status, "converted"), baseConditions)),
      db.select({ count: count() }).from(leads).where(and(eq(leads.status, "declined"), baseConditions))
    ]);

    const total = totalResult[0]?.count || 0;
    const newLeads = newResult[0]?.count || 0;
    const contacted = contactedResult[0]?.count || 0;
    const converted = convertedResult[0]?.count || 0;
    const declined = declinedResult[0]?.count || 0;
    const pending = newLeads + contacted; // pending = new + contacted

    return {
      total,
      new: newLeads,
      contacted,
      converted,
      pending,
      declined
    };
  }

  async getAnalytics(period: string = "6m"): Promise<any> {
    // Get all leads for comprehensive analysis
    const { leads: allLeads } = await this.getLeads({ limit: 10000, offset: 0 });
    
    // Get branches for branch performance analysis
    const branches = await this.getBranches();
    
    // Filter leads by period first
    const now = new Date();
    const periodMonths = period === "1m" ? 1 : period === "3m" ? 3 : period === "6m" ? 6 : 12;
    const periodStartDate = new Date(now.getFullYear(), now.getMonth() - periodMonths, 1);
    
    const periodLeads = allLeads.filter(lead => 
      lead.createdAt && new Date(lead.createdAt) >= periodStartDate
    );

    // Basic lead statistics (using period filtered data)
    const totalLeads = periodLeads.length;
    const convertedLeads = periodLeads.filter(l => l.status === 'converted').length;
    const newLeads = periodLeads.filter(l => l.status === 'new').length;
    const contactedLeads = periodLeads.filter(l => l.status === 'contacted').length;
    const declinedLeads = periodLeads.filter(l => l.status === 'declined').length;
    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0;
    
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    
    const recentLeads = periodLeads.filter(lead => 
      lead.createdAt && new Date(lead.createdAt) >= thirtyDaysAgo
    );
    
    const previousLeads = periodLeads.filter(lead => 
      lead.createdAt && 
      new Date(lead.createdAt) >= sixtyDaysAgo && 
      new Date(lead.createdAt) < thirtyDaysAgo
    );
    
    const monthlyGrowth = previousLeads.length > 0 
      ? Math.round(((recentLeads.length - previousLeads.length) / previousLeads.length) * 100)
      : recentLeads.length > 0 ? 100 : 0;
    
    // Branch Performance Analysis (using period filtered data)
    // Map leads to branches based on assignedBranch field
    const branchPerformance = branches.map(branch => {
      // Filter leads by assignedBranch field (proper branch assignment)
      const branchLeads = periodLeads.filter(lead => lead.assignedBranch === branch.id);
      
      const branchConverted = branchLeads.filter(lead => lead.status === 'converted').length;
      const branchConversionRate = branchLeads.length > 0 
        ? Math.round((branchConverted / branchLeads.length) * 100) 
        : 0;
      
      return {
        branchName: branch.name,
        totalLeads: branchLeads.length,
        convertedLeads: branchConverted,
        conversionRate: branchConversionRate,
        recentLeads: branchLeads.filter(lead => 
          lead.createdAt && new Date(lead.createdAt) >= thirtyDaysAgo
        ).length
      };
    }).sort((a, b) => b.conversionRate - a.conversionRate);
    
    // Vehicle Type Performance (using period filtered data)
    const vehicleTypePerformance: Record<string, { total: number; converted: number }> = {};
    periodLeads.forEach(lead => {
      if (lead.vehicleType) {
        if (!vehicleTypePerformance[lead.vehicleType]) {
          vehicleTypePerformance[lead.vehicleType] = { total: 0, converted: 0 };
        }
        vehicleTypePerformance[lead.vehicleType].total++;
        if (lead.status === 'converted') {
          vehicleTypePerformance[lead.vehicleType].converted++;
        }
      }
    });
    
    const vehicleAnalysis = Object.entries(vehicleTypePerformance).map(([type, data]: [string, any]) => ({
      vehicleType: type,
      totalLeads: data.total,
      convertedLeads: data.converted,
      conversionRate: Math.round((data.converted / data.total) * 100)
    })).sort((a, b) => b.conversionRate - a.conversionRate);
    
    // Monthly trends based on selected period
    const monthlyTrendsData = [];
    for (let i = periodMonths - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthLeads = periodLeads.filter(lead => {
        if (!lead.createdAt) return false;
        const leadDate = new Date(lead.createdAt);
        return leadDate >= monthStart && leadDate <= monthEnd;
      });
      
      const monthConverted = monthLeads.filter(lead => lead.status === 'converted').length;
      
      monthlyTrendsData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        leads: monthLeads.length,
        conversions: monthConverted,
        conversionRate: monthLeads.length > 0 ? Math.round((monthConverted / monthLeads.length) * 100) : 0
      });
    }
    
    // Real source type analysis from actual data (using period filtered data)
    const sourceTypeCounts: Record<string, number> = {};
    periodLeads.forEach(lead => {
      const source = lead.sourceType || 'other';
      sourceTypeCounts[source] = (sourceTypeCounts[source] || 0) + 1;
    });
    
    // Top performing metrics for management insights
    const topPerformingBranch = branchPerformance[0];
    const topPerformingVehicle = vehicleAnalysis[0];
    
    // Calculate real average response time based on actual lead response data
    // Use only leads that have been responded to (status changed from 'new')
    
    // Get all responded leads from the database directly for accurate calculation
    const respondedLeads = allLeads.filter(lead => 
      lead.status !== 'new' && 
      lead.createdAt && 
      lead.updatedAt &&
      new Date(lead.createdAt) >= periodStartDate // Only within the selected period
    );
    
    let totalResponseHours = 0;
    let respondedLeadsCount = 0;
    
    respondedLeads.forEach(lead => {
      if (!lead.createdAt || !lead.updatedAt) return;
      const createdTime = new Date(lead.createdAt).getTime();
      const respondedTime = new Date(lead.updatedAt).getTime();
      const responseTimeHours = (respondedTime - createdTime) / (1000 * 60 * 60);
      
      // Only count reasonable response times (positive and under 30 days)
      if (responseTimeHours >= 0 && responseTimeHours <= 720) { // 720 hours = 30 days
        totalResponseHours += responseTimeHours;
        respondedLeadsCount++;
      }
    });
    
    // Calculate average response time with proper rounding
    const averageResponseTime = respondedLeadsCount > 0 
      ? Math.round(totalResponseHours / respondedLeadsCount * 10) / 10  // Round to 1 decimal
      : 0;
    
    // Real response time calculation complete
    
    // Lead status distribution (using period filtered data)
    const leadsByStatus = [
      { name: 'New', value: periodLeads.filter(l => l.status === 'new').length, color: '#0088FE' },
      { name: 'Contacted', value: periodLeads.filter(l => l.status === 'contacted').length, color: '#00C49F' },
      { name: 'Converted', value: periodLeads.filter(l => l.status === 'converted').length, color: '#FFBB28' },
      { name: 'Declined', value: periodLeads.filter(l => l.status === 'declined').length, color: '#FF8042' }
    ];
    
    // Vehicle type demand analysis (using period filtered data)
    const vehicleTypeCount = periodLeads.reduce((acc, lead) => {
      acc[lead.vehicleType] = (acc[lead.vehicleType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const leadsByVehicleType = Object.entries(vehicleTypeCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    
    // Location analysis (using period filtered data)
    const locationCount = periodLeads.reduce((acc, lead) => {
      acc[lead.location] = (acc[lead.location] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const leadsByLocation = Object.entries(locationCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // Staff Performance Analytics - individual performance tracking
    const allStaffUsers = await db.select().from(users).where(eq(users.role, 'staff'));
    const allBranchUsers = await db.select().from(branchUsers);
    
    // Combine regular staff users and branch users for comprehensive staff performance
    const allStaffMembers = [
      ...allStaffUsers.map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        branchId: user.branchId,
        type: 'staff' as const
      })),
      ...allBranchUsers.map(user => ({
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        branchId: user.branchId,
        type: 'branch_staff' as const
      }))
    ];
    
    const staffPerformance = await Promise.all(
      allStaffMembers.map(async (staff) => {
        // Get leads created by this staff member - handle both regular staff and branch staff IDs
        const staffLeads = periodLeads.filter(lead => 
          lead.createdBy === staff.id || 
          lead.createdBy === `branch-user-${staff.id}`
        );
        
        const capturedLeads = staffLeads.length;
        const contactedLeads = staffLeads.filter(lead => lead.status === 'contacted' || lead.status === 'converted').length;
        const convertedLeads = staffLeads.filter(lead => lead.status === 'converted').length;
        
        const contactRate = capturedLeads > 0 ? Math.round((contactedLeads / capturedLeads) * 100) : 0;
        const conversionRate = capturedLeads > 0 ? Math.round((convertedLeads / capturedLeads) * 100) : 0;
        
        // Calculate average response time for this staff member
        const staffRespondedLeads = staffLeads.filter(lead => 
          lead.status !== 'new' && lead.createdAt && lead.updatedAt
        );
        
        let staffTotalResponseHours = 0;
        let staffRespondedCount = 0;
        
        staffRespondedLeads.forEach(lead => {
          if (!lead.createdAt || !lead.updatedAt) return;
          const createdTime = new Date(lead.createdAt).getTime();
          const respondedTime = new Date(lead.updatedAt).getTime();
          const responseTimeHours = (respondedTime - createdTime) / (1000 * 60 * 60);
          
          if (responseTimeHours >= 0 && responseTimeHours <= 720) {
            staffTotalResponseHours += responseTimeHours;
            staffRespondedCount++;
          }
        });
        
        const averageResponseTime = staffRespondedCount > 0 
          ? Math.round(staffTotalResponseHours / staffRespondedCount * 10) / 10
          : 0;
        
        // Get branch name for context
        let branchName = 'Unassigned';
        if (staff.branchId) {
          const branch = branches.find(b => b.id === staff.branchId);
          branchName = branch?.name || 'Unknown Branch';
        }
        
        return {
          staffId: staff.id,
          staffName: staff.name || staff.email,
          branchName,
          capturedLeads,
          contactedLeads,
          convertedLeads,
          contactRate,
          conversionRate,
          averageResponseTime,
          type: staff.type
        };
      })
    );
    
    // Sort by conversion rate then by captured leads for performance ranking
    const sortedStaffPerformance = staffPerformance
      .filter(staff => staff.capturedLeads > 0) // Only show staff with activity
      .sort((a, b) => {
        if (b.conversionRate !== a.conversionRate) {
          return b.conversionRate - a.conversionRate;
        }
        return b.capturedLeads - a.capturedLeads;
      });
    

    
    // Conversion funnel
    const conversionFunnel = [
      { 
        stage: 'Initial Inquiries', 
        count: totalLeads, 
        percentage: 100 
      },
      { 
        stage: 'Contacted', 
        count: contactedLeads + convertedLeads, 
        percentage: totalLeads > 0 ? Math.round(((contactedLeads + convertedLeads) / totalLeads) * 100) : 0
      },
      { 
        stage: 'In Progress', 
        count: contactedLeads, 
        percentage: totalLeads > 0 ? Math.round((contactedLeads / totalLeads) * 100) : 0
      },
      { 
        stage: 'Converted', 
        count: convertedLeads, 
        percentage: conversionRate 
      }
    ];
    
    // Key performance indicators
    const topPerformers = [
      {
        metric: 'Best Converting Vehicle',
        value: leadsByVehicleType[0]?.name || 'N/A',
        change: '+12%',
        trend: 'up' as const
      },
      {
        metric: 'Top Location',
        value: leadsByLocation[0]?.name || 'N/A',
        change: '+8%',
        trend: 'up' as const
      },
      {
        metric: 'Response Time Trend',
        value: `${averageResponseTime}h avg`,
        change: '-2h',
        trend: 'up' as const
      },
      {
        metric: 'Conversion Quality',
        value: `${conversionRate}%`,
        change: `+${monthlyGrowth > 0 ? monthlyGrowth : 0}%`,
        trend: monthlyGrowth >= 0 ? 'up' : 'down' as const
      }
    ];
    
    return {
      overview: {
        totalLeads,
        newLeads: recentLeads.length,
        convertedLeads,
        conversionRate,
        averageResponseTime,
        monthlyGrowth
      },
      leadsByStatus,
      leadsByVehicleType,
      leadsByLocation,
      monthlyTrends: monthlyTrendsData,
      conversionFunnel,
      topPerformers,
      branchPerformance,
      vehicleAnalysis,
      leadSources: Object.entries(sourceTypeCounts).map(([name, value]) => {
        const sourceConverted = allLeads.filter(l => l.sourceType === name && l.status === 'converted').length;
        const sourceConversionRate = (value as number) > 0 ? Math.round((sourceConverted / (value as number)) * 100) : 0;
        return { 
          name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '), 
          value: value as number, 
          conversionRate: sourceConversionRate 
        };
      }),
      businessInsights: {
        topPerformingBranch: topPerformingBranch?.branchName || 'N/A',
        topPerformingVehicle: topPerformingVehicle?.vehicleType || 'N/A',
        leadGrowth: monthlyGrowth,
        totalActiveLeads: newLeads + contactedLeads
      },
      staffPerformance: sortedStaffPerformance
    };
  }

  // Branch operations
  async getBranches(): Promise<Branch[]> {
    return await db.select().from(branches).orderBy(asc(branches.createdAt));
  }

  async getBranch(id: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(eq(branches.id, id));
    return branch;
  }

  async getBranchByEmail(email: string): Promise<Branch | undefined> {
    const [branch] = await db.select().from(branches).where(sql`LOWER(${branches.email}) = LOWER(${email})`);
    return branch;
  }

  async createBranch(branchData: InsertBranch): Promise<Branch> {
    // Generate a random password for the branch
    const generatedPassword = this.generatePassword();
    
    const [branch] = await db
      .insert(branches)
      .values({
        ...branchData,
        generatedPassword,
      })
      .returning();
    return branch;
  }

  async updateBranch(id: string, updates: UpdateBranch): Promise<Branch> {
    const [branch] = await db
      .update(branches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  async updateBranchStatus(id: string, isActive: string): Promise<Branch> {
    const [branch] = await db
      .update(branches)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(branches.id, id))
      .returning();
    return branch;
  }

  async deleteBranch(id: string): Promise<void> {
    await db.delete(branches).where(eq(branches.id, id));
  }

  // Branch User operations
  async getBranchUsers(branchId: string): Promise<BranchUser[]> {
    return await db.select().from(branchUsers).where(eq(branchUsers.branchId, branchId)).orderBy(asc(branchUsers.createdAt));
  }

  async getAllBranchUsers(): Promise<BranchUser[]> {
    return await db.select().from(branchUsers).where(eq(branchUsers.isActive, "true")).orderBy(asc(branchUsers.createdAt));
  }

  async getBranchUserByEmail(email: string): Promise<BranchUser | undefined> {
    const [branchUser] = await db.select().from(branchUsers).where(eq(branchUsers.email, email));
    return branchUser;
  }

  async createBranchUser(branchUserData: InsertBranchUser): Promise<BranchUser> {
    // Generate a random password for the branch user
    const generatedPassword = this.generatePassword();
    
    const [branchUser] = await db
      .insert(branchUsers)
      .values({
        ...branchUserData,
        generatedPassword,
      })
      .returning();
    return branchUser;
  }

  async updateBranchUserStatus(id: string, isActive: string): Promise<BranchUser> {
    const [branchUser] = await db
      .update(branchUsers)
      .set({ isActive, updatedAt: new Date() })
      .where(eq(branchUsers.id, id))
      .returning();
    return branchUser;
  }

  async deleteBranchUser(id: string): Promise<void> {
    await db.delete(branchUsers).where(eq(branchUsers.id, id));
  }

  // Vehicle Types operations
  async getVehicleTypes(): Promise<VehicleType[]> {
    return await db.select().from(vehicleTypes).where(eq(vehicleTypes.isActive, true)).orderBy(asc(vehicleTypes.name));
  }

  async getAllVehicleTypes(): Promise<VehicleType[]> {
    return await db.select().from(vehicleTypes).orderBy(asc(vehicleTypes.name));
  }

  async getVehicleType(id: string): Promise<VehicleType | undefined> {
    const [vehicleType] = await db.select().from(vehicleTypes).where(eq(vehicleTypes.id, id));
    return vehicleType;
  }

  async createVehicleType(vehicleTypeData: InsertVehicleType): Promise<VehicleType> {
    try {
      const [vehicleType] = await db
        .insert(vehicleTypes)
        .values(vehicleTypeData)
        .returning();
      return vehicleType;
    } catch (error: any) {
      // Check if it's a unique constraint violation for the name field
      if (error?.code === '23505' && error?.detail?.includes('name')) {
        // Return the existing vehicle type if a duplicate name is found
        const [existingType] = await db
          .select()
          .from(vehicleTypes)
          .where(eq(vehicleTypes.name, vehicleTypeData.name));
        if (existingType) {
          return existingType;
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async updateVehicleType(id: string, vehicleTypeData: UpdateVehicleType): Promise<VehicleType> {
    const [vehicleType] = await db
      .update(vehicleTypes)
      .set({ ...vehicleTypeData, updatedAt: new Date() })
      .where(eq(vehicleTypes.id, id))
      .returning();
    return vehicleType;
  }

  async deleteVehicleType(id: string): Promise<void> {
    // First, delete all plates that depend on models of makes of this type
    await db.delete(vehiclePlates)
      .where(sql`model_id IN (SELECT id FROM vehicle_models WHERE make_id IN (SELECT id FROM vehicle_makes WHERE type_id = ${id}))`);
    
    // Then delete all models that belong to makes of this type
    await db.delete(vehicleModels)
      .where(sql`make_id IN (SELECT id FROM vehicle_makes WHERE type_id = ${id})`);
    
    // Then delete all makes of this type
    await db.delete(vehicleMakes)
      .where(eq(vehicleMakes.typeId, id));
    
    // Finally delete the type
    await db.delete(vehicleTypes).where(eq(vehicleTypes.id, id));
  }

  // Vehicle Makes operations
  async getVehicleMakes(): Promise<VehicleMake[]> {
    return await db.select().from(vehicleMakes).where(eq(vehicleMakes.isActive, true)).orderBy(asc(vehicleMakes.name));
  }

  async getAllVehicleMakes(): Promise<VehicleMake[]> {
    return await db.select().from(vehicleMakes).orderBy(asc(vehicleMakes.name));
  }

  async getVehicleMakesByType(typeId: string): Promise<VehicleMake[]> {
    return await db.select().from(vehicleMakes)
      .where(and(eq(vehicleMakes.typeId, typeId), eq(vehicleMakes.isActive, true)))
      .orderBy(asc(vehicleMakes.name));
  }

  async getVehicleMake(id: string): Promise<VehicleMake | undefined> {
    const [vehicleMake] = await db.select().from(vehicleMakes).where(eq(vehicleMakes.id, id));
    return vehicleMake;
  }

  async createVehicleMake(vehicleMakeData: InsertVehicleMake): Promise<VehicleMake> {
    try {
      const [vehicleMake] = await db
        .insert(vehicleMakes)
        .values(vehicleMakeData)
        .returning();
      return vehicleMake;
    } catch (error: any) {
      // Check if it's a unique constraint violation for the name field
      if (error?.code === '23505' && error?.detail?.includes('name')) {
        // Return the existing vehicle make if a duplicate name is found
        const [existingMake] = await db
          .select()
          .from(vehicleMakes)
          .where(eq(vehicleMakes.name, vehicleMakeData.name));
        if (existingMake) {
          return existingMake;
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async updateVehicleMake(id: string, vehicleMakeData: UpdateVehicleMake): Promise<VehicleMake> {
    const [vehicleMake] = await db
      .update(vehicleMakes)
      .set({ ...vehicleMakeData, updatedAt: new Date() })
      .where(eq(vehicleMakes.id, id))
      .returning();
    return vehicleMake;
  }

  async deleteVehicleMake(id: string): Promise<void> {
    // First, delete all plates that depend on models of this make
    await db.delete(vehiclePlates)
      .where(sql`model_id IN (SELECT id FROM vehicle_models WHERE make_id = ${id})`);
    
    // Then delete all models of this make
    await db.delete(vehicleModels)
      .where(eq(vehicleModels.makeId, id));
    
    // Finally delete the make
    await db.delete(vehicleMakes).where(eq(vehicleMakes.id, id));
  }

  // Vehicle Models operations
  async getVehicleModels(): Promise<VehicleModel[]> {
    const models = await db
      .select({
        id: vehicleModels.id,
        name: vehicleModels.name,
        makeId: vehicleModels.makeId,
        year: vehicleModels.year,
        isActive: vehicleModels.isActive,
        createdAt: vehicleModels.createdAt,
        updatedAt: vehicleModels.updatedAt,
        makeName: vehicleMakes.name,
        typeId: vehicleMakes.typeId,
        typeName: vehicleTypes.name
      })
      .from(vehicleModels)
      .leftJoin(vehicleMakes, eq(vehicleModels.makeId, vehicleMakes.id))
      .leftJoin(vehicleTypes, eq(vehicleMakes.typeId, vehicleTypes.id))
      .where(eq(vehicleModels.isActive, true))
      .orderBy(asc(vehicleModels.name));
    
    return models as any;
  }

  async getAllVehicleModels(): Promise<VehicleModel[]> {
    const models = await db
      .select({
        id: vehicleModels.id,
        name: vehicleModels.name,
        makeId: vehicleModels.makeId,
        year: vehicleModels.year,
        isActive: vehicleModels.isActive,
        createdAt: vehicleModels.createdAt,
        updatedAt: vehicleModels.updatedAt,
        makeName: vehicleMakes.name,
        typeId: vehicleMakes.typeId,
        typeName: vehicleTypes.name
      })
      .from(vehicleModels)
      .leftJoin(vehicleMakes, eq(vehicleModels.makeId, vehicleMakes.id))
      .leftJoin(vehicleTypes, eq(vehicleMakes.typeId, vehicleTypes.id))
      .orderBy(asc(vehicleModels.name));
    
    return models as any;
  }

  async getVehicleModelsByMake(makeId: string): Promise<VehicleModel[]> {
    return await db.select().from(vehicleModels)
      .where(and(eq(vehicleModels.makeId, makeId), eq(vehicleModels.isActive, true)))
      .orderBy(asc(vehicleModels.name));
  }

  async getVehicleModel(id: string): Promise<VehicleModel | undefined> {
    const [vehicleModel] = await db.select().from(vehicleModels).where(eq(vehicleModels.id, id));
    return vehicleModel;
  }

  async createVehicleModel(vehicleModelData: InsertVehicleModel): Promise<VehicleModel> {
    const [vehicleModel] = await db
      .insert(vehicleModels)
      .values(vehicleModelData)
      .returning();
    return vehicleModel;
  }

  async updateVehicleModel(id: string, vehicleModelData: UpdateVehicleModel): Promise<VehicleModel> {
    const [vehicleModel] = await db
      .update(vehicleModels)
      .set({ ...vehicleModelData, updatedAt: new Date() })
      .where(eq(vehicleModels.id, id))
      .returning();
    return vehicleModel;
  }

  async deleteVehicleModel(id: string): Promise<void> {
    // First, delete all plates that depend on this model
    await db.delete(vehiclePlates)
      .where(eq(vehiclePlates.modelId, id));
    
    // Then delete the model
    await db.delete(vehicleModels).where(eq(vehicleModels.id, id));
  }

  // Vehicle Plates operations
  async getVehiclePlates(): Promise<VehiclePlate[]> {
    return await db.select().from(vehiclePlates).where(eq(vehiclePlates.isActive, true)).orderBy(asc(vehiclePlates.plateNumber));
  }

  async getAllVehiclePlates(): Promise<VehiclePlate[]> {
    return await db.select().from(vehiclePlates).orderBy(asc(vehiclePlates.plateNumber));
  }

  async getVehiclePlate(id: string): Promise<VehiclePlate | undefined> {
    const [vehiclePlate] = await db.select().from(vehiclePlates).where(eq(vehiclePlates.id, id));
    return vehiclePlate;
  }

  async createVehiclePlate(vehiclePlateData: InsertVehiclePlate): Promise<VehiclePlate> {
    try {
      const [vehiclePlate] = await db
        .insert(vehiclePlates)
        .values(vehiclePlateData)
        .returning();
      return vehiclePlate;
    } catch (error: any) {
      // Check if it's a unique constraint violation for the plate number
      if (error?.code === '23505' && error?.detail?.includes('plate_number')) {
        // Return the existing vehicle plate if a duplicate plate number is found
        const [existingPlate] = await db
          .select()
          .from(vehiclePlates)
          .where(eq(vehiclePlates.plateNumber, vehiclePlateData.plateNumber));
        if (existingPlate) {
          return existingPlate;
        }
      }
      // Re-throw other errors
      throw error;
    }
  }

  async updateVehiclePlate(id: string, vehiclePlateData: UpdateVehiclePlate): Promise<VehiclePlate> {
    const [vehiclePlate] = await db
      .update(vehiclePlates)
      .set({ ...vehiclePlateData, updatedAt: new Date() })
      .where(eq(vehiclePlates.id, id))
      .returning();
    return vehiclePlate;
  }

  async deleteVehiclePlate(id: string): Promise<void> {
    await db.delete(vehiclePlates).where(eq(vehiclePlates.id, id));
  }

  // Field configuration operations
  async getFieldConfigurations(): Promise<FieldConfiguration[]> {
    return await db.select().from(fieldConfigurations).orderBy(asc(fieldConfigurations.fieldOrder));
  }

  async createFieldConfiguration(data: InsertFieldConfiguration): Promise<FieldConfiguration> {
    const [fieldConfig] = await db
      .insert(fieldConfigurations)
      .values(data)
      .returning();
    return fieldConfig;
  }

  async updateFieldConfiguration(id: string, data: UpdateFieldConfiguration): Promise<FieldConfiguration> {
    const [fieldConfig] = await db
      .update(fieldConfigurations)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(fieldConfigurations.id, id))
      .returning();
    return fieldConfig;
  }

  async deleteFieldConfiguration(id: string): Promise<void> {
    await db.delete(fieldConfigurations).where(eq(fieldConfigurations.id, id));
  }

  async getFieldConfigurationByName(fieldName: string): Promise<FieldConfiguration | undefined> {
    const [fieldConfig] = await db.select().from(fieldConfigurations).where(eq(fieldConfigurations.fieldName, fieldName));
    return fieldConfig;
  }

  // Bulk vehicle upload operations
  async bulkUploadVehicles(data: {
    vehicleTypes?: InsertVehicleType[];
    vehicleMakes?: InsertVehicleMake[];
    vehicleModels?: InsertVehicleModel[];
    vehiclePlates?: InsertVehiclePlate[];
  }): Promise<{
    vehicleTypes: VehicleType[];
    vehicleMakes: VehicleMake[];
    vehicleModels: VehicleModel[];
    vehiclePlates: VehiclePlate[];
    summary: {
      typesCreated: number;
      makesCreated: number;
      modelsCreated: number;
      platesCreated: number;
    };
  }> {
    const result = {
      vehicleTypes: [] as VehicleType[],
      vehicleMakes: [] as VehicleMake[],
      vehicleModels: [] as VehicleModel[],
      vehiclePlates: [] as VehiclePlate[],
      summary: {
        typesCreated: 0,
        makesCreated: 0,
        modelsCreated: 0,
        platesCreated: 0,
      },
    };

    try {
      // Insert vehicle types first (they have no dependencies)
      if (data.vehicleTypes && data.vehicleTypes.length > 0) {
        const types = await db
          .insert(vehicleTypes)
          .values(data.vehicleTypes)
          .onConflictDoNothing()
          .returning();
        result.vehicleTypes = types;
        result.summary.typesCreated = types.length;
      }

      // Insert vehicle makes next (they have no dependencies)
      if (data.vehicleMakes && data.vehicleMakes.length > 0) {
        const makes = await db
          .insert(vehicleMakes)
          .values(data.vehicleMakes)
          .onConflictDoNothing()
          .returning();
        result.vehicleMakes = makes;
        result.summary.makesCreated = makes.length;
      }

      // Insert vehicle models (they depend on types and makes)
      if (data.vehicleModels && data.vehicleModels.length > 0) {
        const models = await db
          .insert(vehicleModels)
          .values(data.vehicleModels)
          .onConflictDoNothing()
          .returning();
        result.vehicleModels = models;
        result.summary.modelsCreated = models.length;
      }

      // Insert vehicle plates last (they depend on models)
      if (data.vehiclePlates && data.vehiclePlates.length > 0) {
        const plates = await db
          .insert(vehiclePlates)
          .values(data.vehiclePlates)
          .onConflictDoNothing()
          .returning();
        result.vehiclePlates = plates;
        result.summary.platesCreated = plates.length;
      }

      return result;
    } catch (error) {
      console.error("Error in bulk vehicle upload:", error);
      throw error;
    }
  }

  private generatePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  // Privacy settings operations
  async getPrivacySettings(): Promise<PrivacySetting[]> {
    return await db.select().from(privacySettings).orderBy(asc(privacySettings.settingKey));
  }

  async updatePrivacySetting(id: string, isEnabled: boolean): Promise<PrivacySetting> {
    const [setting] = await db
      .update(privacySettings)
      .set({ isEnabled, updatedAt: new Date() })
      .where(eq(privacySettings.id, id))
      .returning();
    return setting;
  }

  async getPrivacySettingByKey(key: string): Promise<PrivacySetting | undefined> {
    const [setting] = await db.select().from(privacySettings).where(eq(privacySettings.settingKey, key));
    return setting;
  }



  // First admin protection - identifies the first admin user created
  async isFirstAdminUser(id: string): Promise<boolean> {
    try {
      // Get the first admin user (ordered by creation date)
      const [firstAdmin] = await db
        .select()
        .from(users)
        .where(eq(users.role, 'admin'))
        .orderBy(asc(users.createdAt))
        .limit(1);
      
      // Check if the provided ID matches the first admin user
      return firstAdmin?.id === id;
    } catch (error) {
      console.error("Error checking first admin user:", error);
      return false;
    }
  }
}

export const storage = new DatabaseStorage();
