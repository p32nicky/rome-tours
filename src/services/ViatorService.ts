import { Config } from '../config';
import {
  ProductSearchResponse,
  ViatorProduct,
  LocationsBulkResponse,
} from '../models/ViatorModels';

const HEADERS = {
  'exp-api-key': Config.API_KEY,
  'Accept': 'application/json;version=2.0',
  'Accept-Language': 'en-US',
  'Content-Type': 'application/json',
};

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${Config.BASE_URL}/${path}`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Viator API error ${res.status}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${Config.BASE_URL}/${path}`, {
    method: 'GET',
    headers: HEADERS,
  });
  if (!res.ok) throw new Error(`Viator API error ${res.status}`);
  return res.json();
}

// ── Search Rome tours ─────────────────────────────────────────

async function searchProducts(start = 1): Promise<ProductSearchResponse> {
  return post('products/search', {
    filtering: { destination: String(Config.ROME_DEST_ID) },
    sorting: { sort: 'TRAVELER_RATING', order: 'DESCENDING' },
    pagination: { start, count: Config.PAGE_SIZE },
    currency: Config.CURRENCY,
  });
}

// ── Resolve LOC-xxx → lat/lng ─────────────────────────────────

async function resolveLocations(refs: string[]): Promise<Record<string, { latitude: number; longitude: number }>> {
  if (!refs.length) return {};
  const data: LocationsBulkResponse = await post('locations/bulk', { locations: refs });
  const map: Record<string, { latitude: number; longitude: number }> = {};
  data.locations?.forEach((loc) => {
    if (loc.ref && loc.center?.lat != null && loc.center?.lng != null) {
      map[loc.ref] = { latitude: loc.center.lat, longitude: loc.center.lng };
    }
  });
  return map;
}

// ── Main fetch ────────────────────────────────────────────────

export async function fetchRomeTours(): Promise<ViatorProduct[]> {
  const result = await searchProducts();
  const products = result.products ?? [];

  const refs = [...new Set(products.map((p) => p.location?.ref).filter(Boolean) as string[])];
  const locationMap = await resolveLocations(refs);

  return products
    .map((p) => ({
      ...p,
      coordinate: p.location?.ref ? locationMap[p.location.ref] : undefined,
    }))
    .filter((p) => p.coordinate != null);
}
