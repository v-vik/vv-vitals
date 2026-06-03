# Food Scanner — Integration Notes

This feature uses [Open Food Facts](https://world.openfoodfacts.org) (OFF) for
barcode-based product lookup, and [@zxing/browser](https://github.com/zxing-js/browser)
for in-browser barcode capture.

These notes capture constraints and gotchas that are easy to forget and not
obvious from the code alone.

---

## Why OFF, and what it's good at

OFF is a community-maintained, open-licensed food product database. Its
**barcode lookup** is its strongest feature — the database is comprehensive
for packaged goods in most markets and is the canonical reason to use OFF.

Its **text search** is comparatively weak (irrelevant or imprecise hits, poor
ranking) which is why v--v Vitals is built scan-first, with text search
positioned as a fallback for items that don't have a barcode (whole foods,
restaurant meals, leftovers).

---

## API basics

- **Base URL:** `https://world.openfoodfacts.org/api/v2/product/{barcode}.json`
- **Auth:** none required for reads
- **Format:** JSON
- Use the `?fields=` query parameter to limit the response to fields actually
  consumed. Smaller payload, faster, more polite. See `offClient.ts` for the
  list we use.

### The `status: 0` gotcha

A "barcode not in database" response returns **HTTP 200** with `status: 0` in
the body. It is NOT an HTTP error.

```json
{ "code": "1234567890", "status": 0, "status_verbose": "product not found" }
```

Code that only checks `response.ok` will treat this as a successful lookup and
then crash on the missing `product` field. Always check `data.status` after
parsing.

### Nutrition data is patchy

OFF's data quality varies enormously:

- Well-maintained European packaged goods often have every nutriment field
- Obscure or older products may have only `energy_kJ` and nothing else
- Some fields are present but malformed (strings instead of numbers, etc.)

Every nutrition field in `FoodProduct.nutrition` is typed as optional for this
reason. The UI must handle absence gracefully — never render "NaN g protein".

### Per-100g, not per-serving

OFF stores nutrition values per 100g (`*_100g` keys). v--v Vitals stores them
the same way. **Per-serving conversion is the UI layer's job**, computed from
serving size and amount consumed at render time.

The reason: per-100g is the canonical form. Per-serving values can always be
derived from it. The reverse is not true — if serving size is missing or
wrong, per-serving values are unrecoverable.

### kJ alongside kcal

Australian packaging uses kJ. OFF provides both `energy-kcal_100g` and
`energy-kj_100g` where available. Both are stored in `FoodProduct.nutrition`
(`energyKcal`, `energyKj`). The UI picks which to show.

---

## Rate limits

Per [OFF's documented limits](https://openfoodfacts.github.io/openfoodfacts-server/api/):

- **Product lookups (GET by barcode):** 100/min/IP (some sources say 15/min —
  treat 15/min as the safer assumption)
- **Search queries:** 10/min/IP
- **Search-as-you-type is explicitly forbidden** — submit-on-enter only for
  the text-search fallback

Per-user scanning is comfortably within these limits. The concern is
search-as-you-type and any kind of bulk operation.

---

## User-Agent requirement (and the browser caveat)

OFF requires a custom User-Agent header identifying the app:

```
v--v Vitals/0.1 (contact@example.com)
```

**Browsers forbid overriding the UA header via `fetch()`**. From the browser,
OFF will see Chrome/Safari/etc. and we are technically out of compliance.

This is fine for local dev and a static SPA, but the proper fix is:

> **TODO:** Add a thin backend proxy (Cloudflare Worker, simple Node service,
> etc.) that forwards OFF requests with a compliant User-Agent. Also a good
> place to add response caching, rate-limit shielding, and CORS isolation.

This is noted in `offClient.ts` as a TODO comment as well.

---

## Attribution (ODbL)

OFF data is licensed under the
[Open Database License (ODbL)](https://opendatacommons.org/licenses/odbl/).

v--v Vitals must include attribution somewhere visible. A line in the app's
settings/about screen is sufficient:

> Food data from [Open Food Facts](https://world.openfoodfacts.org),
> licensed under [ODbL](https://opendatacommons.org/licenses/odbl/).

---

## Barcode capture (@zxing/browser)

### Why this library

The native `BarcodeDetector` Web API is the right long-term answer but is
**still unsupported on iOS Safari as of early 2026**. Since iOS users are
exactly the population most likely to use a phone-camera-driven feature,
relying on the native API would silently break the feature for them.

`@zxing/browser` is the mature, well-maintained fallback. Bundle cost is
~200kb gzipped — acceptable for a feature this central.

If iOS Safari ships `BarcodeDetector` in future, the scanner hook can be
refactored to use native-when-available + ZXing fallback (Approach B in
internal notes). Until then, ZXing is doing real work, not acting as a
polyfill.

### What it owns

The hook uses ZXing's `BrowserMultiFormatReader.decodeFromVideoDevice(...)`
method, which takes ownership of the `<video>` element — it handles the
`getUserMedia` call, stream attachment, and frame-by-frame decoding loop.

This means:

- We do not call `getUserMedia` ourselves
- We do not set `videoElement.srcObject` ourselves
- We pass ZXing the video element via ref, and it handles the rest

The cleanup obligation is real: ZXing's `reset()` method must be called on
unmount or when scanning stops, or the camera light stays on. This is handled
in the hook's `useEffect` cleanup function.

### Single-shot behaviour

The decode callback fires continuously — every frame, regardless of whether a
barcode is in view. To implement single-shot detection (fire once, then stop),
the hook uses a ref-based guard flag to ignore further callbacks after the
first successful detection.

The hook exposes a `reset()` method to re-enable scanning for the next item.

---

## Open TODOs

- [ ] Backend proxy for OFF requests (User-Agent compliance, caching, CORS)
- [ ] ODbL attribution in settings/about screen
- [ ] Text-search fallback flow (submit-on-enter, not live)
- [ ] Decide on per-user "recents" / favourites cache for frequently-scanned
      items — likely worth doing once core scan flow is solid
- [ ] Revisit native `BarcodeDetector` + ZXing fallback once iOS Safari ships
      support
