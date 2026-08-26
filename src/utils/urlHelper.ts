export function getPublicOrigin(): string {
  // Allow overriding the base URL via environment variable for custom domains or obfuscating internal IPs
  if (import.meta.env && import.meta.env.VITE_PUBLIC_BASE_URL) {
    // Remove trailing slash if present
    return import.meta.env.VITE_PUBLIC_BASE_URL.replace(/\/$/, '');
  }

  if (typeof window === 'undefined') return '';
  let origin = window.location.origin;
  
  // Convert development app URL (ais-dev-...) to live shared app URL (ais-pre-...)
  if (origin.includes('ais-dev-')) {
    origin = origin.replace('ais-dev-', 'ais-pre-');
  } else if (origin.includes('-dev-')) {
    origin = origin.replace('-dev-', '-pre-');
  }

  return origin;
}
