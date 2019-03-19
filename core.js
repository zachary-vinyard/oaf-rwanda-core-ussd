/*
main file for TR / OAF RW core program
include more documentation here!!
lang options - 'en', 'ki'
*/

var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter

global.main = function () {
    sayText(msgs('main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : 8,
                                            'timeout'      : 180 });
};


/*
input handlers - one per response variable
*/

addInputHandler('account_number_splash',function(input){ //acount_number_splash input handler - main input handler for initial splash
    try{
        var response = input.replace(/\D/g,'')
        var verify = require('./lib/account-verify')
        var client_verified = verify(response);
        if(client_verified){
            sayText(msgs('account_number_verified'));
            stopRules();
        }
        else{
            sayText(msgs('account_number_not_found'));
            stopRules();
        }
    }
    catch(error){
        console.log(error);
        admin_alert("ERROR, ERROR, ERROR", 'Error on USSD test integration : '+ error)
        stopRules();
    }
});
