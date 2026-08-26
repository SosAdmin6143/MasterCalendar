export function getPublicOrigin(): string {
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
