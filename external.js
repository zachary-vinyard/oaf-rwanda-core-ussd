/*
main file for external advertising ussd function
uses lib from core to execute some functions
*/

var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter

global.main = function(){
    sayText(msgs('external_splash'));
}
