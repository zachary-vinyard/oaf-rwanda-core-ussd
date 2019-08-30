/*
OAF RW core program
*/

//global functionss
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
const chicken_client_table = settings_table.queryRows({'vars' : {'settings' : 'chicken_client_table'}}).next().vars.value;
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
            state.vars.account_number = response;
            /* HIDING THIS FOR TESTING PURPOSES
            var splash = core_splash_map.queryRows({'vars' : {'district' : state.vars.client_district}}).next().vars.splash_menu;
            if(splash === null || splash === undefined){
                admin_alert(state.vars.client_district + ' not found in district database');
                throw 'ERROR : DISTRICT NOT FOUND';
            }
            state.vars.splash = splash;
            */
            var splash = 'payg_splash_menu';
            state.vars.splash = splash;
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
        admin_alert('Error on USSD test integration : '+ error + '\nAccount number: ' + response, "ERROR, ERROR, ERROR")
        stopRules();
    }
});

addInputHandler('cor_menu_select', function(input){
    input = String(input.replace(/\D/g,''));
    state.vars.current_step = 'cor_menu_select';
    var selection = get_menu_option(input, state.vars.splash);
    if(selection === null || selection === undefined){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'cor_get_balance'){ //inelegant
        get_balance = require('./lib/cor-get-balance');
        var balance_data = get_balance(JSON.parse(state.vars.client_json), lang);
        sayText(msgs('cor_get_balance', balance_data, lang));
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else if(selection === 'cor_get_payg'){
        payg_retrieve = require('./lib/cor-payg-retrieve');
        // if account matches a serial number, give the client the corresponding PAYG code
        if(payg_retrieve(state.vars.account_number)){
            sayText(msgs('cor_payg_true', {'$PAYG' : state.vars.payg_code}, lang));
            promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            return null;
        }
        // else prompt the client to enter their product's serial number
        else if(state.vars.acc_valid){
            sayText(msgs('cor_payg_false', lang));
            promptDigits('cor_payg_reg', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            return null;
        }
        // print an error message if an error occurs
        else{
            sayText(msgs('cor_payg_error', lang));
            return null;
        }
    }
    else{
        console.log(selection);
        if(selection === 'chx_confirm'){ // this is ... not great
            var get_available_chx = require('./lib/chx-calc-available-chickens');
            var opts = get_available_chx(state.vars.account_number, JSON.parse(state.vars.client_json), chicken_client_table);
            state.vars.max_chx = opts.$CHX_NUM;
            if(state.vars.max_chx == 0){
                sayText(msgs('chx_none_confirmable', {}, lang));
                promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
                return null;
            }
        }
        else{
            var opts = {};
        }
        var current_menu = msgs(selection, opts, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
});

addInputHandler('chx_confirm', function(input){
    input = parseInt(input.replace(/\D/g,''));
    state.vars.current_tep = 'chx_confirm';
    if(input > 0 && input <= state.vars.max_chx){
        var check_chx_conf = require('./lib/chx-check-reg');
        if(check_chx_conf(state.vars.account_number, chicken_client_table)){
            sayText(msgs('chx_already_confirmed', {}, lang));
            promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            return null;
        }
        state.vars.confirmed_chx = input;
        sayText(msgs('chx_final_confirm', {'$CHX_NUM' : state.vars.confirmed_chx}, lang));
        promptDigits('chx_final_confirm', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else if(input > state.vars.max_chx){
        sayText(msgs('chx_too_many', {}, lang))
        promptDigits('invalid_input',{'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
});

addInputHandler('chx_final_confirm', function(input){ //final confirmation to ensure that correct number of chickens is picked
    input = parseInt(input.replace(/\D/g,''));
    if(input === 1){
        var save_chx_quant = require('./lib/chx-save-quant');
        var conf_code = save_chx_quant(state.vars.account_number, state.vars.confirmed_chx, chicken_client_table);
        var conf_msg = msgs('chx_confirmed', {'$CHX_NUM' : state.vars.confirmed_chx, '$CONFIRMATION_CODE' : conf_code}, lang);
        var msg_route = settings_table.queryRows({'vars' : {'settings' : 'sms_push_route'}}).next().vars.value;
        project.sendMessage({'to_number' : contact.phone_number, 'route_id' : msg_route, 'content' : conf_msg});
        sayText(conf_msg)
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else{
        sayText(msgs('chx_not_confirmed', {}, lang));
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
});


/*
generic input handler for returning to main splash menu
*/
addInputHandler('cor_continue', function(input){
    state.vars.current_step = 'cor_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input !== 99){
        var splash_menu = populate_menu(state.vars.splash, lang);
        var current_menu = splash_menu;
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits('cor_menu_select', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
        return null;
    }
    else if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
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
        return null;
    }
    else if(input == 99){ //exit
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else{
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
});

// input handler for registering serial number
addInputHandler('cor_payg_reg', function(serial_no){
    serial_no = parseInt(serial_no.replace(/\D/g,''));
    var serial_verify = require('./lib/cor-serial-verify');
    // if the input serial is valid, give the client their PAYG code
    if(serial_verify(serial_no)){
        sayText(msgs('cor_payg_true', state.vars.payg_code, lang));
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    // else prompt them to re-enter their serial number
    else if(state.vars.serial_status){
        sayText(msgs('cor_payg_invalid_serial', lang));
        promptDigits('cor_payg_reg', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length})
        return null;
    }
    // if error occurs, print error message for the client
    else{
        sayText(msgs('cor_payg_error', lang));
        return null;
    }
});