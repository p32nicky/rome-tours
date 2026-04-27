export const Config = {
  // ── Replace these ──────────────────────────────────────────
  API_KEY: '1a72ff9c-67a5-4dc0-9eb8-03deec355c5e',
  AFFILIATE_PARTNER_ID: 'P00195940',   // pid= param
  AFFILIATE_CAMPAIGN_ID: '42383', // mcid= param
  // ───────────────────────────────────────────────────────────

  BASE_URL: 'https://api.viator.com/partner',
  ROME_DEST_ID: 684,
  CURRENCY: 'USD',
  PAGE_SIZE: 50,

  ROME_CENTER: {
    latitude: 41.9028,
    longitude: 12.4964,
    latitudeDelta: 0.09,
    longitudeDelta: 0.09,
  },
} as const;
