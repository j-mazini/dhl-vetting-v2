# Cost Models & Payment Modes — How Revenue Is Calculated

> A plain-English guide to how Logix prices an operation and turns daily stops
> into invoice revenue. This document covers the five revenue-generating cost
> models. (Two administrative models — *Hourly Rate* and *OFF / Day-off* — are
> intentionally excluded here, as they are not part of standard route pricing.)

---

## 1. Key Concepts

| Term | What it means |
|------|---------------|
| **Cost Model** | The pricing scheme applied to an operation. It defines *how* revenue is calculated. Each model has a numeric ID (`costModelId`) and a name. |
| **Payment Mode** | The text label used to refer to a cost model across the app and reports. It always maps one-to-one to a cost model. |
| **Band (or Tier)** | A range of stops (e.g. *1–75 stops*) with its own price. Tiered models (DAF, VSR, SP_VSR, FSR) use one or more bands. |
| **Stops** | The countable units of work in a day's route. Most pricing is driven by how many stops were completed. |
| **Extras** | Additional amounts added on top of the base revenue: ad-hoc sort, route sort, and a generic extra. These are always added at the end. |

Throughout this document:

```
extras = extra + adhocSort + routeSort
```

---

## 2. The Cost Models at a Glance

| ID | Code | Name | One-line summary | Uses bands? |
|:--:|------|------|------------------|:-----------:|
| **1** | **DAF** | Daily Adhoc Fixed | A fixed base price covering an initial block of stops, plus a per-stop charge for any stops beyond it. | ✅ |
| **2** | **DR** | Daily Rate | A flat daily amount, regardless of stop count. | ❌ |
| **3** | **FSR** | Fixed Service Rate | A single fixed price charged for **every** stop. | ✅* |
| **4** | **VSR** | Variable Service Rate | A tiered per-stop price spread across **2 bands** of stops. | ✅ |
| **12** | **SP_VSR** | Service Partner VSR | Identical logic to VSR, but spread across **4 bands** for finer granularity. | ✅ |

\* FSR does not split stops across multiple tiers, but it is shown with a per-unit
price in the interface, so it is grouped with the "banded" models for display.

> **VSR vs. SP_VSR:** these two work **exactly the same way** — an accumulating,
> tier-by-tier per-stop calculation. The only difference is how many bands are
> configured: VSR uses 2, SP_VSR uses 4.

### Operational Summary

| ID | Model | How it works |
|---:|---|---|
| 1 | **DAF** | Fixed price up to a stop limit. If the route exceeds that limit, each additional stop is charged as an extra stop. |
| 2 | **DR** | Daily/fixed model. Uses the operation `rate` when provided; if no `rate` is set, it falls back to the driver's registered `fixedPrice`. |
| 3 | **FSR** | Per-stop model. Multiplies paid stops by the rate. The rate comes from the operation `rate` or the registered driver `fixedPrice`. |
| 4 | **VSR** | Cumulative band/tier model. Each band has a stop interval and a per-stop price. |

---

## 3. How Each Model Calculates Revenue

The pricing engine resolves the applicable rate, handles a few special cases,
then applies the formula for the chosen model. Extras are added at the very end.

### DAF — Daily Adhoc Fixed (ID 1)

A fixed base price covers an initial block of stops. Any stops beyond that block
are charged per stop using one or more "extra" bands.

```
baseRevenue = base band's fixed price
if totalStops exceeds the base band's upper limit:
    for each extra band (ordered by its starting stop):
        stopsInThisBand = how many of the remaining stops fall in this band
        revenue += stopsInThisBand × band's price-per-stop
total = baseRevenue + extraStopsRevenue + extras
```

**Example.** Band 1 covers stops 1–75 at a fixed £155. Band 2 covers stops
76–999 at £1.65 per stop. A day with **80 stops** earns:

```
£155 (base, covers first 75 stops)
+ 5 stops × £1.65 = £8.25
= £163.25  (before extras)
```

### DR — Daily Rate (ID 2)

A flat daily amount. The stop count does not affect the base figure.

```
finalRate = the configured daily rate
total = finalRate + extras
```

### FSR — Fixed Service Rate (ID 3)

A single price is charged for every stop completed.

```
total = totalStops × rate + extras
```

**Example.** At £2.00 per stop, a day with 90 stops earns `90 × £2.00 = £180.00`
(before extras).

### VSR & SP_VSR — Variable Service Rate (IDs 4 & 12)

Stops are filled into bands from the lowest tier upward, and each band charges
its own per-stop price. This is an **accumulating** calculation — different
slices of the day's stops can be priced differently.

```
order bands from lowest starting stop to highest
remainingStops = totalStops
for each band:
    capacity = how many stops this band can hold
    stopsInThisBand = min(remainingStops, capacity)
    revenue += stopsInThisBand × band's price-per-stop
    remainingStops -= stopsInThisBand
total = sum of all band revenue + extras
```

**Example (VSR, 2 bands).** Band 1: stops 1–50 at £2.10. Band 2: stops 51+ at
£1.80. A day with **70 stops** earns:

```
50 stops × £2.10 = £105.00
20 stops × £1.80 =  £36.00
= £141.00  (before extras)
```

SP_VSR works the same way, simply with up to four price tiers instead of two.

---

## 4. Rate Resolution & Special Cases

Before applying a formula, the engine decides which rate to use:

1. An **explicit rate** set on the operation always takes priority.
2. If no explicit rate is provided, the engine looks up the rate from the
   operation's cost model configuration:
   - **DAF (1), DR (2), FSR (3)** → use the band's **fixed price**.
   - **VSR (4), SP_VSR (12)** → use the band's **price per stop**.

A handful of situations short-circuit the calculation:

| Situation | Result |
|-----------|--------|
| Route is marked `OFF` | Revenue = **0** |
| **0 stops** on a DR (2) operation (non-BOFF route) | `rate + extras` |
| **0 stops** on a DAF (1) operation (non-BOFF route) | `(rate or fixed price) + extras` |
| **0 stops** on any other model | extras only |
| No cost model assigned | extras only |
| Expected model configuration not found (DAF / VSR / SP_VSR) | extras only; base revenue is flagged as zeroed |

---

## 5. Where the Bands Come From (Invoice Model Type)

Bands can be sourced from different tables depending on who the operation is
billed against. This is controlled by the **Invoice Model Type**:

| Type | Source of bands | Looked up by |
|------|-----------------|--------------|
| **Vendor** (default) | Vendor / employee cost-model bands | Vendor (user) ID |
| **Service Partner** | Service-partner cost-model bands | Company, Service Partner, and Route |
| **Company** | Company-specific cost model | Company ID |

> ⚠️ If the Invoice Model Type is set incorrectly, the engine reads bands from
> the wrong table, which leads to financial discrepancies on invoices. This
> setting should match how the operation is actually billed.

---

## 6. How It Appears in Reports

Each operation in a report carries its payment mode as:

- **Cost Mode ID** — the numeric cost model ID
- **Cost Mode Name** — the cost model's name

Both are exported as columns in the CSV report output.

---

## 7. Cheat Sheet

```
id  code     name                   formula (before extras)
--  -------  ---------------------  ------------------------------------------
1   DAF      Daily Adhoc Fixed      fixed base price + per-stop charge above it
2   DR       Daily Rate             flat daily rate
3   FSR      Fixed Service Rate     totalStops × rate
4   VSR      Variable Service Rate  Σ (stops in band × band price), 2 bands
12  SP_VSR   Service Partner VSR    same as VSR, 4 bands

extras = extra + adhocSort + routeSort   (added to every total at the end)
```
