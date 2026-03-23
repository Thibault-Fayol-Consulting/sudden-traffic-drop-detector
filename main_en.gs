/**
 * ==========================================================================
 * Sudden Traffic Drop Detector — Google Ads Script
 * ==========================================================================
 * Compares today cumulative clicks (up to the current hour) against the
 * average of the same hour window over the past 7 days. Sends an email
 * alert when the drop exceeds the configured threshold.
 *
 * Uses hourly GAQL data for accurate same-time-of-day comparisons.
 *
 * Author:  Thibault Fayol — Consultant SEA
 * Website: https://thibaultfayol.com
 * License: MIT — Thibault Fayol Consulting
 * ==========================================================================
 */

var CONFIG = {
  TEST_MODE: true,
  EMAIL: 'contact@domain.com',
  DROP_THRESHOLD: 0.50,
  MIN_BASELINE_CLICKS: 20,
  CAMPAIGN_NAME_CONTAINS: ''
};

function main() {
  try {
    var tz = AdsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    var currentHour = parseInt(Utilities.formatDate(new Date(), tz, 'HH'), 10);
    var accountName = AdsApp.currentAccount().getName();

    Logger.log('=== Sudden Traffic Drop Detector ===');
    Logger.log('Account: ' + accountName);
    Logger.log('Date: ' + today + ', Current hour: ' + currentHour);

    if (currentHour < 2) {
      Logger.log('Too early in the day. Skipping.');
      return;
    }

    var query =
      'SELECT segments.date, segments.hour, metrics.clicks, metrics.impressions ' +
      'FROM campaign ' +
      'WHERE segments.date DURING LAST_14_DAYS ' +
      'AND metrics.impressions > 0';

    var rows = AdsApp.search(query);
    var byDate = {};

    while (rows.hasNext()) {
      var row = rows.next();
      var date = row.segments.date;
      var hour = row.segments.hour;
      var clicks = row.metrics.clicks || 0;

      if (hour > currentHour) continue;

      if (!byDate[date]) byDate[date] = 0;
      byDate[date] += clicks;
    }

    Logger.log('Days with data: ' + Object.keys(byDate).length);

    var todayClicks = byDate[today] || 0;
    delete byDate[today];

    var dates = Object.keys(byDate).sort().reverse().slice(0, 7);
    if (dates.length === 0) {
      Logger.log('No baseline data available. Done.');
      return;
    }

    var baselineTotal = 0;
    dates.forEach(function(d) { baselineTotal += byDate[d]; });
    var baselineAvg = baselineTotal / dates.length;

    Logger.log('Today clicks (hours 0-' + currentHour + '): ' + todayClicks);
    Logger.log('Baseline avg (same hours, ' + dates.length + ' days): ' + baselineAvg.toFixed(1));

    if (baselineAvg < CONFIG.MIN_BASELINE_CLICKS) {
      Logger.log('Baseline too low. Skipping alert.');
      return;
    }

    var dropPct = (baselineAvg - todayClicks) / baselineAvg;
    Logger.log('Drop: ' + (dropPct * 100).toFixed(1) + '%');

    if (dropPct >= CONFIG.DROP_THRESHOLD) {
      Logger.log('ALERT: Traffic dropped ' + (dropPct * 100).toFixed(0) + '%');

      if (!CONFIG.TEST_MODE) {
        sendAlert_(accountName, today, currentHour, todayClicks, baselineAvg, dropPct, dates);
      } else {
        Logger.log('[TEST MODE] Email not sent.');
      }
    } else {
      Logger.log('Traffic is within normal range.');
    }

    Logger.log('=== Done ===');

  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE) {
      MailApp.sendEmail(
        CONFIG.EMAIL,
        'ERROR — Traffic Drop Detector — ' + AdsApp.currentAccount().getName(),
        'Script failed:\n' + e.message + '\n\n' + e.stack
      );
    }
  }
}

function sendAlert_(accountName, today, currentHour, todayClicks, baselineAvg, dropPct, dates) {
  var html =
    '<h2 style="color:red">Traffic Drop Alert</h2>' +
    '<p><b>Account:</b> ' + accountName + '<br><b>Date:</b> ' + today +
    '<br><b>Time window:</b> Hours 0 to ' + currentHour + '</p>' +
    '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">' +
    '<tr><td><b>Today clicks</b></td><td style="color:red;font-size:18px"><b>' + todayClicks + '</b></td></tr>' +
    '<tr><td><b>Baseline average</b></td><td>' + baselineAvg.toFixed(0) + '</td></tr>' +
    '<tr><td><b>Drop</b></td><td style="color:red"><b>' + (dropPct * 100).toFixed(0) + '%</b></td></tr>' +
    '<tr><td><b>Baseline days</b></td><td>' + dates.join(', ') + '</td></tr>' +
    '</table>' +
    '<p>Investigate: paused campaigns, budget issues, billing, or tracking failures.</p>';

  MailApp.sendEmail({
    to: CONFIG.EMAIL,
    subject: 'TRAFFIC DROP ' + (dropPct * 100).toFixed(0) + '% — ' + accountName,
    htmlBody: html
  });
}
