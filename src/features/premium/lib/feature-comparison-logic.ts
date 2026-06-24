export type FeatureRenderType =
  | "check-green"
  | "x-gray"
  | "infinity-unlimited"
  | "star-string"
  | "target-early-access"
  | "plain-text";

export function classifyFeatureValue(
  value: boolean | string,
  unlimitedLabel = "Unlimited"
): FeatureRenderType {
  if (value === true) return "check-green";
  if (value === false) return "x-gray";
  if (value === unlimitedLabel) return "infinity-unlimited";
  if (typeof value === "string" && value.includes("templates")) return "star-string";
  if (
    typeof value === "string" &&
    (value.includes("Early") || value.includes("Beta"))
  ) {
    return "target-early-access";
  }
  return "plain-text";
}
