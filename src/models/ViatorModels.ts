// ── Search ────────────────────────────────────────────────────

export interface ProductSearchRequest {
  filtering: { destination: string };
  sorting: { sort: string; order: string };
  pagination: { start: number; count: number };
  currency: string;
}

export interface ProductSearchResponse {
  products: ViatorProduct[];
  totalCount?: number;
}

// ── Product ───────────────────────────────────────────────────

export interface ViatorProduct {
  productCode: string;
  title: string;
  description?: string;
  images?: ProductImage[];
  pricing?: Pricing;
  reviews?: Reviews;
  productUrl?: string;
  location?: LocationRef;
  duration?: Duration;
  flags?: string[];
  categories?: Category[];
  // injected after location resolution
  coordinate?: Coordinate;
}

export interface ProductImage {
  variants?: ImageVariant[];
}

export interface ImageVariant {
  url: string;
  width?: number;
  height?: number;
}

export interface Pricing {
  summary?: { fromPrice?: number };
}

export interface Reviews {
  combinedAverageRating?: number;
  totalReviews?: number;
}

export interface LocationRef {
  ref?: string;
}

export interface Duration {
  fixedDurationInMinutes?: number;
  variableDurationFromMinutes?: number;
  variableDurationToMinutes?: number;
}

export interface Category {
  id?: number;
  name?: string;
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

// ── Locations ─────────────────────────────────────────────────

export interface LocationsBulkResponse {
  locations?: LocationDetail[];
}

export interface LocationDetail {
  ref?: string;
  center?: { lat?: number; lng?: number };
}

// ── Helpers ───────────────────────────────────────────────────

export function getPrimaryImageUrl(product: ViatorProduct): string | null {
  const variants = product.images?.[0]?.variants;
  if (!variants?.length) return null;
  const sorted = [...variants].sort((a, b) => (b.width ?? 0) - (a.width ?? 0));
  return sorted[0]?.url ?? null;
}

export function formatDuration(d?: Duration): string {
  if (!d) return '';
  const fmt = (m: number) => m < 60 ? `${m} min` : m % 60 === 0 ? `${m / 60}h` : `${Math.floor(m / 60)}h ${m % 60}m`;
  if (d.fixedDurationInMinutes) return fmt(d.fixedDurationInMinutes);
  if (d.variableDurationFromMinutes && d.variableDurationToMinutes)
    return `${fmt(d.variableDurationFromMinutes)}–${fmt(d.variableDurationToMinutes)}`;
  return 'Varies';
}

export function buildAffiliateUrl(productUrl: string, partnerId: string, campaignId: string): string {
  const url = new URL(productUrl);
  if (partnerId) url.searchParams.set('pid', partnerId);
  if (campaignId) url.searchParams.set('mcid', campaignId);
  return url.toString();
}
