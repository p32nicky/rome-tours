# Rome Tours — Expo Setup & EAS Build Guide

## Step 1 — Install Node + tools (on your Windows PC)

```powershell
# Install Node.js from https://nodejs.org (LTS)
# Then:
npm install -g expo-cli eas-cli
```

## Step 2 — Add your credentials

Open `src/config.ts`:
```ts
API_KEY: 'YOUR_VIATOR_API_KEY',
AFFILIATE_PARTNER_ID: 'YOUR_PARTNER_ID',   // pid= param
AFFILIATE_CAMPAIGN_ID: 'YOUR_CAMPAIGN_ID', // mcid= param
```

Your booking URLs will become:
`https://www.viator.com/tours/Rome/...?pid=YOURPID&mcid=YOURCAMPAIGN`

## Step 3 — Install dependencies

```powershell
cd C:\romeiphonehapp
npm install
```

## Step 4 — Link EAS project

```powershell
eas login          # sign in with your Expo account
eas init           # links project, writes projectId into app.json
```

## Step 5 — Build for iOS (no Mac needed!)

```powershell
# Preview build → installs via TestFlight
eas build --platform ios --profile preview

# Production build → App Store
eas build --platform ios --profile production
```

EAS builds on Apple hardware in the cloud. You get a link to download the `.ipa` 
and install via TestFlight when done (~10–20 min).

## Step 6 — Install on your iPhone

1. Install **TestFlight** from App Store on your iPhone
2. After EAS build finishes → go to expo.dev → your project → builds
3. Click "Submit to TestFlight" or scan QR code
4. Open TestFlight on iPhone → install

## Step 7 — Submit to App Store (optional)

```powershell
eas submit --platform ios
```
Requires Apple Developer account ($99/yr).

---

## App Features

| Feature | How |
|---------|-----|
| Live map with price pins | `react-native-maps` → MapKit on iOS |
| Snap bottom sheet | `@gorhom/bottom-sheet` |
| Haptic feedback | `expo-haptics` |
| Affiliate booking | `expo-web-browser` (SFSafariViewController) |
| Share tours | Native `Share` API |
| User location | `expo-location` |
| Search + filter | Real-time with useMemo |
| Tour list view | Native FlatList bottom sheet |

## File Structure

```
romeiphonehapp/
├── App.tsx                          ← Entry point
├── app.json                         ← Expo config
├── eas.json                         ← Build profiles
├── package.json
├── babel.config.js
├── tsconfig.json
└── src/
    ├── config.ts                    ← PUT YOUR KEYS HERE
    ├── models/ViatorModels.ts       ← Types + helpers
    ├── services/ViatorService.ts    ← Viator API calls
    ├── hooks/useTours.ts            ← State + filtering
    ├── screens/MapScreen.tsx        ← Main map UI
    └── components/
        ├── TourDetailSheet.tsx      ← Sliding detail card
        └── TourListView.tsx         ← List alternative
```

## API Flow

1. `POST /products/search` — fetch Rome tours (destId: 684, sorted by rating)
2. `POST /locations/bulk` — resolve LOC-xxx refs → lat/lng coordinates
3. Tours with coordinates pin on MapKit map
4. Tap pin → bottom sheet snaps up with full tour info
5. "Book Now" → opens Safari with `?pid=X&mcid=Y` affiliate params
