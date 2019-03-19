/*
main file for TR / OAF RW mobile enrollment
include more documentation here!!
lang options - 'en', 'ki'
*/

var msgs = require('./lib/msg-retrieve'); //global message handler

global.main = function () {
    sayText(msgs.get_message('main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : 8,
                                            'timeout'      : 180 });
};


/*
input handlers - one per response variable
*/

addInputHandler('account_number_splash',function(){ //acount_number_splash input handler - main input handler for initial splash
    sayText(msgs.get_message('account_number_verified'));
    stopRules();
});