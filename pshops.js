/*
    Name: pshops.js
    Purpose: OAF RW PShops Client Portal; allows clients to register, get new codes, and check balance for SHS products.
    Status: in progress of writing input handlers; global functions and constants not quite set; messages not yet added.
*/

//global functions -- ripped from core.js, need to add any other functions to use here
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');
var check_account_no = require('./pshops_lib/check_account_no'); 
var registration_check = require('./pshops_lib/registration_check');
var renew_code = require('./pshops_lib/renew_code');
var serial_no_check = require('./pshops_lib/serial_no_check');

// set various constants using telerivet tables
var settings_table = project.getOrCreateDataTable('ussd_settings');
const max_digits_for_account_number = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_an'}}).next().vars.value);
const timeout_length = 180; 

// display welcome message and prompt input
global.main = function() {
    sayText(msgs('pshops_main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
}

// input handler for account #
addInputHandler('account_number_splash', function(accnum){
    try{ // check if account number is a valid p-shop number
        if(check_account_no(accnum)){ // if valid account, save account # as state variable and display main menu
            state.vars.accnum = accnum;
            // display pshop main menu
            // need query rows line?? 
            var menu = populate_menu('pshop_main_menu', lang);
            state.vars.current_menu_str = menu;
            sayText(menu);
            promptDigits('pshop_menu_select', {'submitOnHash' : false,
                                                'maxDigits'    : 1,
                                                'timeout' : timeout_length });
        }
        else{ // if invalid, print incorrect account msg and prompt digits for account # again
            sayText(msgs('incorrect_account_number'));
            promptDigits('account_number_splash', { 'submitOnHash' : false,
                                                    'maxDigits'    : max_digits_for_account_number,
                                                    'timeout'      : timeout_length });
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
    // clean input and save current step as a variable
    input = String(input.replace(/\D/g,''));
    state.vars.current_step = 'pshop_menu_select';
    var selection = get_menu_option(input, 'pshop_main_menu');

    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 
                                        'maxDigits' : max_digits_for_input,
                                        'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'check_balance_option'){
        sayText(msgs('main_message', {}, lang)); 
        promptDigits('back_to_main', {  'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_account_number,
                                        'timeout'      : timeout_length });
    }    
    else if(selection === 'solar_codes_option'){
        registration_check(state.vars.accnum); // run registration check
        if(state.vars.HasReg === 'Yes'){
            if(state.vars.Unlock === 'Yes'){
                sayText(msgs('solar_unlocked', {}, lang));
                promptDigits('back_to_main', {  'submitOnHash' : false,
                                                'maxDigits'    : max_digits_for_account_number,
                                                'timeout'      : timeout_length });
            }
            else{
                sayText(msgs('solar_locked', {}, lang));
                promptDigits('new_code', {  'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
            }
        }
        else{
            sayText(msgs('solar_nonreg', {}, lang));
            promptDigits('serial_no_reg', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
    }
});

// input handler for new code (called from solar_codes_option)
addInputHandler('new_code', function(input){
    // clean input and run renew_code function
    input = String(input.replace(/\D/g,''));
    renew_code(input);

    // populate solar codes menu options
    var menu = populate_menu('solar_codes_menu', lang)
    var selection = get_menu_option(input, menu);

    if(selection === 1){
        if(NewCodeStatus === 'No'){
            sayText(msgs('insufficient_funds', {}, lang));
            promptDigits('back_to_main', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
        else if(NewCodeStatus === 'Unlock'){
            sayText(msgs('unlock_success', {}, lang));
            promptDigits('back_to_main', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
        else{
            sayText(msgs('activation_code', {}, lang));
            promptDigits('back_to_main', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
    }
    else{
        // return to main menu
        var menu = populate_menu('pshop_main_menu', lang);
        state.vars.current_menu_str = menu;
        sayText(menu);
        promptDigits('pshop_menu_select', {'submitOnHash' : false,
                                            'maxDigits'    : 1,
                                            'timeout' : timeout_length });
    }
});

// set back to main options to all run subroutine MainMenuText
addInputHandler('back_to_main', function(input){
    var menu = populate_menu('pshop_main_menu', lang);
    state.vars.current_menu_str = menu;
    sayText(menu);
    promptDigits('pshop_menu_select', {'submitOnHash' : false,
                                        'maxDigits'    : 1,
                                        'timeout' : timeout_length });
});

// add input handler for serial number
addInputHandler('serial_no_reg', function(input){
    input = String(input.replace(/\D/g,''));

    // if input is 99, return to main menu
    if(input === '99'){
        var menu = populate_menu('pshop_main_menu', lang);
        state.vars.current_menu_str = menu;
        sayText(menu);
        promptDigits('pshop_menu_select', {'submitOnHash' : false,
                                            'maxDigits'    : 1,
                                            'timeout' : timeout_length });
    }
    else{
        serial_no_check(input);
        if(state.vars.SerialStatus === 'Reg'){
            sayText(msgs('reg_success', {}, lang));
            promptDigits('back_to_main', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
        else if(state.vars.SerialStatus === 'AlreadyReg'){
            sayText(msgs('already_reg', {}, lang));
            promptDigits('serial_no_reg', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
        else{
            sayText(msgs('serial_not_found', {}, lang));
            promptDigits('serial_no_reg', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length });
        }
    }
});

