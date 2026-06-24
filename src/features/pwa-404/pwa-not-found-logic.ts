export interface PWAManifest {
  name: string;
  short_name: string;
  description?: string;
  start_url: string;
  display: string;
  background_color: string;
  theme_color: string;
  icons: { src: string; sizes: string; type: string }[];
}

export function isValidManifest(manifest: PWAManifest): boolean {
  return !!(
    manifest.name?.trim() &&
    manifest.short_name?.trim() &&
    manifest.start_url &&
    ["standalone", "fullscreen", "minimal-ui", "browser"].includes(manifest.display) &&
    manifest.icons?.length > 0
  );
}

export function hasRequiredIconSizes(manifest: PWAManifest): boolean {
  const sizes = manifest.icons.map((i) => i.sizes);
  return sizes.includes("192x192") && sizes.includes("512x512");
}

export function isValidColor(hex: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex);
}

// ── Lógica pura de 404 ───────────────────────────────────────────────────────

export function get404PageInfo() {
  return {
    statusCode: 404,
    title: "Page not found",
    hasHomeLink: true,
    message: "The page you are looking for does not exist."
  };
}

export function isValidStatusCode(code: number): boolean {
  return code >= 100 && code <= 599;
}

export function is404StatusCode(code: number): boolean {
  return code === 404;
}
