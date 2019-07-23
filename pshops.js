/*
OAF RW PShops Client Portal: allows clients to activate, top up, and check balance for solar products.
*/

//global functions -- ripped from core.js, may need to modify
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');

// set various constants using telerivet tables
var settings_table = project.getOrCreateDataTable('ussd_settings');
const max_digits_for_account_number = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_an'}}).next().vars.value);
const timeout_length = 180; // what unit is this? seconds?

// NOTE: NEED SAYTEXT, PROMPTDIGITS FUNCTIONS

// display welcome message and prompt input. the input received here will trigger a series of input handlers.
global.main = function() {
    sayText(msgs('pshops_main_splash'));
    // what is the promptdigits function? is account_number_splash predefined, or is it a name that triggers the right input handler?
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
}

/*
input handlers - one per response variable
*/

// input handler for account #
addInputHandler('account_number_splash', function(input){ //acount_number_splash input handler - main input handler for initial splash
    try{ 
        // run subroutine Check_AccountNumber with account number
        var acc_status = check_account_no(input);
        if(acc_status == 'Valid P-shop'){
            // call main menu function 
        }
        else{
            // print incorrect account msg
            // promptDigits for account number
        }
    }
    catch(error){
        // unsure what goes here
    }
});

// input handler for main menu
addInputHandler('pshop_main_menu', function(input){
    try{}
    catch(error){}
})

// input handler for option 1 selected in pshop main menu
addInputHandler('log_message', function(input){
    // print log message with variables from roster
    // offer option to return to main menu (BackToMain)
})

// input handler for BackToMain
addInputHandler('back_to_main', function(input){
    // display pshop_main_menu
})

// input handler for option 2: what exactly is this?
addInputHandler('top_up_options', function(input){
    /* step 1: run registration check subroutine (check Telerivet for script)
    if hasreg == yes, 
        if unlock == yes,
            print message showing serial number
            show unlock code
            offer option to return to main menu
        else 
            print serial number and last code
            offer option 1 to set new code -- write a separate input handler
            offer option to return to main menu -- taken care of in same input handler
    else
        print message saying no serial number
        option to enter serial number; write input handler for this
        option to return to main menu
    */
})

// input handler for new code
addInputHandler('new_code', function(input){
    /* if input == 1
        run sub-routine renew_code
            if no
                print not enough money message
                print balance
                offer back_to_main option
            elseif unlock
                print successful unlock message
                print unlock code
                offer back_to_main option
            else 
                print activation code
                offer back_to_main option
    else
        run sub-routine MainMenuText
    */
})

// set back to main options to all run subroutine MainMenuText

// add input handler for serial number
