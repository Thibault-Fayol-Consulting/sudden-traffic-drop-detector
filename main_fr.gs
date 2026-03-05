/**
 * --------------------------------------------------------------------------
 * sudden-traffic-drop-detector - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, THRESHOLD: 0.2 };
function main() {
    var statsToday = AdsApp.currentAccount().getStatsFor("TODAY");
    var statsYesterday = AdsApp.currentAccount().getStatsFor("YESTERDAY");
    var c1 = statsToday.getClicks();
    var c2 = statsYesterday.getClicks();
    if (c2 > 100 && c1 < (c2 * CONFIG.THRESHOLD)) {
        Logger.log("Baisse anormale de trafic ! Hier : " + c2 + " Aujourd'hui : " + c1);
    } else {
        Logger.log("Trafic stable.");
    }
}
