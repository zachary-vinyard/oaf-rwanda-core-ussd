/*
OAF RW core program
*/

//global functions
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');

//options
var settings_table = project.getOrCreateDataTable('ussd_settings');
const lang = settings_table.queryRows({'vars' : {'settings' : 'cor_lang'}}).next().vars.value;
const max_digits_for_input = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits'}}).next().vars.value); //only for testing
//const max_digits_for_nid = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_nid'}}).next().vars.value); 
const max_digits_for_account_number = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_an'}}).next().vars.value);
const core_splash_map = project.getOrCreateDataTable('districts');
const timeout_length = 180;

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
            //sayText(msgs('account_number_verified'));
            var splash = core_splash_map.queryRows({'vars' : {'district' : state.vars.client_district}}).next().vars.splash_menu;
            state.vars.splash = splash;
            if(splash === null || splash === undefined){
                admin_alert(state.vars.client_district + ' not found in district database');
                throw 'ERROR : DISTRICT NOT FOUND';
            }
            var menu = populate_menu(splash, lang);
            state.vars.current_menu_str = menu;
            sayText(menu);
            promptDigits('cor_menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : 180});
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

addInputHandler('cor_menu_select', function(input){
    input = String(input.replace(/\D/g,''));
    state.vars.current_step = 'cor_menu_select';
    var selection = get_menu_option(input, state.vars.splash);
    console.log(selection);
    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
    }
    else if(selection === 'cor_get_balance'){
        get_balance = require('./lib/cor-get-balance');
        var balance_data = get_balance(JSON.parse(state.vars.client_json), lang);
        sayText(msgs('cor_get_balance', balance_data, lang));
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else{
        var current_menu = msgs(selection, {}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
});

addInputHandler('chx_confirm', function(input){
    //hhh
});


/*
generic input handler for returning to main splash menu
*/
addInputHandler('cor_continue', function(input){
    state.vars.current_step = 'cor_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){
        var splash_menu = populate_menu(state.vars.splash, lang);
        var current_menu = splash_menu;
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits('cor_menu_select', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
});

/*
input handler for invalid input - input handlers dump here for unrecognized input if there's not already a loop
*/
addInputHandler('invalid_input', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){ //continue on to previously failed step
        sayText(state.vars.current_menu_str);
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(input == 99){ //exit
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
});
