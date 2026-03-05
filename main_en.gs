/**
 * --------------------------------------------------------------------------
 * sudden-traffic-drop-detector - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, THRESHOLD: 0.2 }; // Drops below 20% of previous period
function main() {
    var statsToday = AdsApp.currentAccount().getStatsFor("TODAY");
    var statsYesterday = AdsApp.currentAccount().getStatsFor("YESTERDAY");
    var c1 = statsToday.getClicks();
    var c2 = statsYesterday.getClicks();
    if (c2 > 100 && c1 < (c2 * CONFIG.THRESHOLD)) {
        Logger.log("Traffic Drop Alert! Yesterday: " + c2 + " Today: " + c1);
    } else {
        Logger.log("Traffic is stable.");
    }
}
