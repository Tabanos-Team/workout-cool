export function formatPrice(price: number, currency: string, locale = "fr"): string {
  return new Intl.NumberFormat(locale === "zh-CN" ? "zh-CN" : locale, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: currency === "EUR" ? 2 : 0,
    maximumFractionDigits: 2
  }).format(price);
}

export type ButtonState = "processing" | "login-required" | "go-premium";

export function getButtonState(params: {
  isCheckoutPending: boolean;
  selectedPlan: string | null;
  currentPlanId: string;
  isAuthenticated: boolean;
}): ButtonState {
  const { isCheckoutPending, selectedPlan, currentPlanId, isAuthenticated } = params;

  if (isCheckoutPending && selectedPlan === currentPlanId) return "processing";
  if (!isAuthenticated) return "login-required";
  return "go-premium";
}

export interface PlanPrices {
  monthly: number;
  yearly: number;
  yearlyPerMonth: number;
  currency: string;
  planId: string;
}

export function getCurrentPlan(isYearly: boolean, monthlyPrice = 7.9, yearlyPrice = 49.0, currency = "EUR"): PlanPrices {
  return {
    monthly: monthlyPrice,
    yearly: yearlyPrice,
    yearlyPerMonth: yearlyPrice / 12,
    currency,
    planId: isYearly ? "premium-yearly" : "premium-monthly"
  };
}

export function getSavingsPercentage(monthlyPrice: number, yearlyPrice: number): number {
  const yearlyMonthly = yearlyPrice / 12;
  const savings = ((monthlyPrice - yearlyMonthly) / monthlyPrice) * 100;
  return Math.round(savings);
}

export function buildRedirectUrl(locale: string, basePath = "/premium"): string {
  return `/auth/signin?redirect=${encodeURIComponent(`/${locale}${basePath}`)}`;
}
