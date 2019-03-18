/*
main file for TR / OAF RW mobile enrollment
include more documentation here!!
lang options - 'en', 'ki'
*/

global.main = function () {
    var LANG = 'en'; //en or ki
    var msgs = require('./lib/msg-retrieve');
    sayText(msgs.get_message(LANG,'main_splash'));
};
