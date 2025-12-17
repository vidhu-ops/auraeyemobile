/**
 * Profile access control utilities
 * Determines which features are available based on user profile type
 */

export type UserProfileType = "client" | "healer" | "semi-healer";

/**
 * Check if user can access aura analysis
 * All users (clients and healers) can access aura analysis
 */
export function canAccessAuraAnalysis(userType: string | undefined): boolean {
  return userType === "client" || userType === "healer" || userType === "semi-healer";
}

/**
 * Check if user can access object scanning
 * Only full healers can access object scanning
 */
export function canAccessObjectScanning(userType: string | undefined): boolean {
  return userType === "healer";
}

/**
 * Check if user is a healer type (includes both healer and semi-healer)
 * Used for routing to healer dashboard
 */
export function isHealerType(userType: string | undefined): boolean {
  return userType === "healer" || userType === "semi-healer";
}

/**
 * Get the appropriate dashboard route for user type
 */
export function getDashboardRoute(userType: string | undefined): string {
  return isHealerType(userType) ? "/healer-dashboard" : "/client-dashboard";
}

/**
 * Check if user has restricted services (semi-healer or client)
 */
export function hasRestrictedServices(userType: string | undefined): boolean {
  return userType === "semi-healer" || userType === "client";
}

/**
 * Get upgrade message for restricted services
 */
export function getUpgradeMessage(service: "aura" | "object"): string {
  if (service === "aura") {
    return "Aura analysis is an exclusive feature for premium healers. Upgrade your account to access this powerful spiritual service.";
  } else if (service === "object") {
    return "Object scanning is an exclusive feature for premium healers. Upgrade your account to access this advanced spiritual service.";
  }
  return "This service is restricted. Please upgrade your account to access it.";
}
