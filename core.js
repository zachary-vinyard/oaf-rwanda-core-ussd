/*
OAF RW core program
*/

//global functions
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter

//options
var settings_table = project.getOrCreateDataTable('ussd_settings');
const max_digits_for_input = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits'}}).next().vars.value); //only for testing
const max_digits_for_nid = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_nid'}}).next().vars.value); 
const max_digits_for_account_number = parsInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_an'}}).next().vars.value);

global.main = function () {
    sayText(msgs('cor_main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
};


/*
input handlers - one per response variable
*/

addInputHandler('account_number_splash', function(input){ //acount_number_splash input handler - main input handler for initial splash
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
        admin_alert('Error on USSD test integration : '+ error, "ERROR, ERROR, ERROR")
        stopRules();
    }
});
