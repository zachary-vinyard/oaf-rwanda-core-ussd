/*
    Script: monitor.js
    Description: a meta-service that monitors service usage in the core menu on a monthly basis.
    Status: in progress
*/

// initialize relevant functions and tables
var admin_alert = require('./lib/admin-alert');
var mon_table = project.getOrCreateDataTable('core_monitoring');
var sessions = project.getOrCreateDataTable('Core program + chickens');

// identify limit users - vectorize?
/*
for each phone number in sessions.pn{
    // step one: check for consecutive accounts; assign field as yes and send admin alert if >5 exist
    sort by account and check for subsequentiality; if over five consecutive accounts, flag as yes and send admin alert
    // step two: calculate the other fields
    calculate number of unique accounts for month and cumulative
    calculate number of interactions for month and cumulative
    // step three: save table values
    limit to 100 rows? or show everything above a certain limit
    save in mon_table
}
*/

// send table to relevant users on a monthly basis
/*
send email to marisa and angelique
*/

