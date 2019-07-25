/*
    Name: pshops.js
    Purpose: OAF RW PShops Client Portal; allows clients to register, get new codes, and check balance for SHS products.
    Status: in progress of writing input handlers; global functions and constants not quite set; messages not yet added.
*/

//global functions -- ripped from core.js, may need to modify
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');

// set various constants using telerivet tables
var settings_table = project.getOrCreateDataTable('ussd_settings');
const max_digits_for_account_number = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_an'}}).next().vars.value);
const timeout_length = 180; 

// display welcome message and prompt input
global.main = function() {
    sayText(msgs('pshops_main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
}

// input handler for account #
addInputHandler('account_number_splash', function(accnum){
    try{ // check if account number is a valid p-shop number
        check_account_no(accnum);

        if(state.vars.AccStatus == 'Valid P-shop'){ // if valid, save account # as state variable and display main menu
            state.vars.accnum = accnum; // does this save it as a state variable? is this necessary?
            main_menu_display(farmer_name);
        }
        else{ // if invalid, print incorrect account msg and prompt digits for account # again
            sayText(msgs('incorrect_account_number'));
            promptDigits('account_number_splash', { 'submitOnHash' : false,
                                                    'maxDigits'    : max_digits_for_account_number,
                                                    'timeout'      : 180 });
        }
    }
    catch(error){
        console.log(error);
        admin_alert('Error on USSD test integration : '+ error + '\nAccount number: ' + response, "ERROR, ERROR, ERROR")
        stopRules();
    }
});

// input handler for main menu selections
addInputHandler('pshop_menu_select', function(input){
    // pulled from core.js. Not 100% sure what this section is doing
    input = String(input.replace(/\D/g,''));
    state.vars.current_step = 'pshop_menu_select';
    var selection = get_menu_option(input, state.vars.splash);

    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'check_balance_option'){ 
        /*
            print log message with variables from roster
            offer option to return to main menu (BackToMain) (promptDigits?)
        */
    }    
    else if(selection === 'solar_codes_option'){
        registration_check(state.vars.accnum); // run registration check
        if(state.vars.HasReg === 'Yes'){
            if(state.vars.Unlock === 'Yes'){
                /*
                print message showing serial number
                show unlock code
                offer option to return to main menu
                */
            }
            else{
                /* 
                display serial number
                show last code
                offer option for new code (promptDigits('new_code'))
                offer option to return to main menu
                */
            }
        }
        else{
            /*
            print you have not registered an SHS msg
            offer option to enter serial number to register (promptDigits('serial_no_reg'))
            offer option to return to main menu
            */
        }
    }
});

// input handler for new code (called from solar_codes_option)
addInputHandler('new_code', function(input){

    // any steps for cleaning input here?
    var selection = get_menu_option(input, new_code_menu);

    /* if selection === 1
        run sub-routine renew_code
            if no
                print not enough money message
                print balance
                offer back_to_main option
            else if unlock
                print successful unlock message
                print unlock code
                offer back_to_main option
            else 
                print activation code
                offer back_to_main option
    else
        run sub-routine for main_menu_display
    */
});

// set back to main options to all run subroutine MainMenuText ? 

// add input handler for serial number
addInputHandler('serial_no_reg', function(input){
    /*
    if input === main menu option
        display main menu
    else
        run serial number check subroutine
        if reg
            show "you have registered" msg
            display activation code
            offer option to return to main menu
        else if already reg
            serial no already registered            
            prompt digits for either serial number or main menu (promptDigits('serial_no_reg'))

        else
            serial no not found
            prompt digits for either serial number or main menu (promptDigits('serial_no_reg'))
    */
});

