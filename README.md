# TestMandi Mobile

React Native (Expo) app for TestMandi — "the test bazaar." Browse tests, buy one,
attempt it, get an instant topic-wise score report. Talks to the existing
[testmandiserver](https://github.com/alimail791/testmandiserver) API (the same
backend `testmandihome` uses).

Implements the three flows from the Claude Design handoff:

- **Bazaar** — home feed, category filter, search, test stall detail, Razorpay
  checkout, timed attempt runner, instant score report.
- **Seller storefront** — a seller's public profile and test list.
- **My tests** — purchased tests to attempt, past reports with a score trend,
  a local "saved" list, and the refer-a-friend panel.

## Setup

```
npm install
npx expo start
```

Scan the QR code with Expo Go (iOS/Android) or press `i`/`a` for a simulator.
`npx expo start --web` also works for a quick look, minus the native-only bits
(SecureStore falls back to `localStorage`, and the Razorpay checkout — which
needs `react-native-webview` — only opens on iOS/Android).

## Configuration

`EXPO_PUBLIC_API_BASE` (see `.env`) points at the TestMandi API. Defaults to
the production Railway deployment; point it at `http://localhost:4000` (or
your machine's LAN IP, for a physical device) to test against a local
`testmandiserver`.

## Notes on scope

A few things in the original design mockup were stylized placeholders not
backed by the real API, and were adapted rather than faked:

- No percentile/rank data exists server-side, so the report shows accuracy %
  instead of a fabricated "rank 318/4,182."
- No negative marking is applied server-side (score = +1 per correct answer),
  so the attempt screen says so instead of showing NEET's real +4/-1 scheme.
- "Sellers you follow" has no follow feature in the API — the home screen
  shows real top sellers by test count instead.
- The mockup's "Mandi Wallet" (fake ₹ balance) is real referral-reward data
  from `/api/referrals/mine` instead (rewards are 50%-off codes, not cash).
- "Saved" tests are a local-only bookmark list (`expo-secure-store` /
  `localStorage`) since there's no wishlist endpoint.
- Seller/advertiser accounts can register and log in, but publishing tests,
  payouts, and ads are left to the web app — this app is buyer-focused, per
  the design brief.
