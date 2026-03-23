# Sudden Traffic Drop Detector

Google Ads Script that detects sudden drops in click traffic by comparing today's cumulative clicks against the same-hour average over the past 7 days.

## What it does

1. Queries hourly click data via GAQL for the last 14 days
2. Computes today's cumulative clicks up to the current hour
3. Compares against the 7-day average for the same hour window
4. Sends an email alert when the drop exceeds the configured threshold

## Setup

1. Open [Google Ads Scripts](https://ads.google.com/aw/bulk/scripts)
2. Create a new script and paste the contents of `main_en.gs` (or `main_fr.gs`)
3. Edit the `CONFIG` block at the top
4. Run once in test mode, review the logs
5. Set `TEST_MODE: false` and schedule hourly

## CONFIG reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `TEST_MODE` | boolean | `true` | `true` = log only, `false` = log + email |
| `EMAIL` | string | `'contact@domain.com'` | Alert recipient email |
| `DROP_THRESHOLD` | number | `0.50` | Alert if clicks drop by 50% or more |
| `MIN_BASELINE_CLICKS` | number | `20` | Minimum baseline clicks to avoid false positives |
| `CAMPAIGN_NAME_CONTAINS` | string | `''` | Filter campaigns (empty = all) |

## How it works

- Uses `AdsApp.search()` with GAQL, segmented by `segments.date` and `segments.hour`
- Only compares hours 0 through the current hour (uses `Utilities.formatDate` with account timezone)
- Calculates the average clicks for the same hour window across the past 7 days
- Skips alerts if the baseline is too low (below `MIN_BASELINE_CLICKS`)
- Sends an HTML email with today's clicks, baseline average, drop percentage, and baseline dates

## Requirements

- Google Ads account with active campaigns
- Google Ads Scripts access
- Recommended: schedule hourly for timely alerts

## License

MIT - Thibault Fayol Consulting
