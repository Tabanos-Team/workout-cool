export type UserRole = "admin" | "user";
export type SubscriptionStatus = "ACTIVE" | "TRIAL" | "CANCELLED" | "EXPIRED" | "PAUSED";
export type Platform = "WEB" | "IOS" | "ANDROID";

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  locale?: string | null;
  role?: UserRole | null;
  banned?: boolean | null;
  banReason?: string | null;
  banExpires?: Date | null;
  isPremium?: boolean | null;
}

export interface UserSubscription {
  status: SubscriptionStatus;
  currentPeriodEnd?: Date | null;
  cancelledAt?: Date | null;
  platform?: Platform | null;
}

export function isProfileComplete(user: Partial<UserProfile>): boolean {
  return !!(
    user.name?.trim() &&
    user.email?.trim() &&
    user.emailVerified === true &&
    user.image
  );
}

export function getFullName(user: Pick<UserProfile, "firstName" | "lastName" | "name">): string {
  const full = `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim();
  return full.length > 0 ? full : user.name;
}

export function getUserInitials(user: Pick<UserProfile, "firstName" | "lastName" | "name">): string {
  if (user.firstName?.trim() && user.lastName?.trim()) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
  }
  const parts = user.name?.trim().split(" ") ?? [];
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  if (parts.length === 1 && parts[0].length > 0) return parts[0][0].toUpperCase();
  return "?";
}

export function isAdmin(user: Pick<UserProfile, "role">): boolean {
  return user.role === "admin";
}

export function isUserBanned(user: Pick<UserProfile, "banned" | "banExpires">): boolean {
  if (!user.banned) return false;
  if (!user.banExpires) return true;
  return new Date() < new Date(user.banExpires);
}

export function hasActivePremium(
  user: Pick<UserProfile, "isPremium">,
  subscriptions: UserSubscription[] = []
): boolean {
  if (user.isPremium === true) return true;
  const now = new Date();
  return subscriptions.some(
    (sub) =>
      (sub.status === "ACTIVE" || sub.status === "TRIAL") &&
      (!sub.currentPeriodEnd || new Date(sub.currentPeriodEnd) > now)
  );
}

export function getUserLocale(user: Pick<UserProfile, "locale">, fallback = "fr"): string {
  return user.locale ?? fallback;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
