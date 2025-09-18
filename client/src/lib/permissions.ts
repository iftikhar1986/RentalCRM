// Module permissions utility
export const AVAILABLE_MODULES = [
  { id: "analytics", label: "Analytics", path: "/analytics" },
  { id: "users", label: "Users", path: "/users" },
  { id: "branches", label: "Branches", path: "/branches" },
  { id: "vehicles", label: "Vehicles", path: "/vehicles" },
  { id: "settings", label: "Settings", path: "/field-settings" }
] as const;

export type ModuleId = typeof AVAILABLE_MODULES[number]["id"];

export interface UserWithPermissions {
  id: string;
  role: string;
  permissions?: string[];
  [key: string]: any;
}

/**
 * Check if user has permission to access a specific module
 */
export function hasModulePermission(user: UserWithPermissions | null, moduleId: ModuleId): boolean {
  if (!user) return false;
  
  // Check if user has specific permission for this module
  return user.permissions?.includes(moduleId) || false;
}

/**
 * Get all modules that the user has permission to access
 */
export function getAccessibleModules(user: UserWithPermissions | null) {
  if (!user) return [];
  
  return AVAILABLE_MODULES.filter(module => hasModulePermission(user, module.id));
}

/**
 * Check if user can access a specific path
 */
export function canAccessPath(user: UserWithPermissions | null, path: string): boolean {
  if (!user) return false;
  
  // Dashboard is always accessible
  if (path === "/" || path === "/dashboard") return true;
  
  // Find module by path
  const module = AVAILABLE_MODULES.find(m => m.path === path);
  if (!module) return true; // Allow access to unknown paths (like profile, etc.)
  
  return hasModulePermission(user, module.id);
}

/**
 * Get default redirect path for user based on their permissions
 */
export function getDefaultPath(user: UserWithPermissions | null): string {
  if (!user) return "/";
  
  const accessibleModules = getAccessibleModules(user);
  
  // If user has analytics access, redirect there
  if (accessibleModules.some(m => m.id === "analytics")) {
    return "/analytics";
  }
  
  // Otherwise redirect to first accessible module
  if (accessibleModules.length > 0) {
    return accessibleModules[0].path;
  }
  
  // Fallback to dashboard
  return "/";
}