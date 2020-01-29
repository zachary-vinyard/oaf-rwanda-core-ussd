/*
OAF RW core program
*/

//global functionss
var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');

//options
//var settings_table = project.getOrCreateDataTable('ussd_settings'); //removing this to account for project variable preference
const lang = project.vars.cor_lang;
const max_digits_for_input = project.vars.max_digits; //only for testing
//const max_digits_for_nid = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_nid'}}).next().vars.value); 
const max_digits_for_account_number = project.vars.max_digits_an;
//const max_digits_for_serial = 7;
const core_splash_map = project.getOrCreateDataTable(project.vars.core_splash_map);
//const chicken_client_table = project.vars.chicken_client_table;
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
            sayText(msgs('account_number_verified'));
            state.vars.account_number = response;
            var splash = core_splash_map.queryRows({'vars' : {'district' : state.vars.client_district}}).next().vars.splash_menu;
            if(splash === null || splash === undefined){
                admin_alert(state.vars.client_district + ' not found in district database');
                throw 'ERROR : DISTRICT NOT FOUND';
            }
            // temporary switch for testing
            console.log('user pn is ' + contact.phone_number + ' ' + typeof(contact.phone_number));
            if(contact.phone_number === '5550123' || contact.phone_number === '+250783231367' || contact.phone_number === '+250783057998'){
                splash = 'chx_splash_menu';
            }
            state.vars.splash = splash;
            var menu = populate_menu(splash, lang);
            state.vars.current_menu_str = menu;
            sayText(menu, lang);
            promptDigits('cor_menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : 180});
        }
        else{
            sayText(msgs('account_number_not_found'));
            stopRules();
        }
    }
    catch(error){
        console.log(error);
        admin_alert('Error on USSD test integration : '+ error + '\nAccount number: ' + response, "ERROR, ERROR, ERROR", 'marisa')
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
        payg_balance = require('./lib/cor-payg-balance');
        console.log("PAYG balance is " + payg_balance(JSON.parse(state.vars.client_json)));

        // only run code if client has paid enough; otherwise tell them they haven't paid enough for a new code
        if(payg_balance(JSON.parse(state.vars.client_json))){
            // if account matches a serial number, give the client the corresponding PAYG code
            if(payg_retrieve(state.vars.account_number)){
                sayText(msgs('cor_payg_true', {'$PAYG' : state.vars.payg_code}, lang));
                promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
                return null;
            }
            // else prompt the client to enter their product's serial number
            else if(state.vars.acc_empty){
                sayText(msgs('cor_payg_false', {}, lang));
                promptDigits('cor_payg_reg', {'submitOnHash' : false, 'maxDigits' : max_digits_for_account_number, 'timeout' : timeout_length});
                return null;
            }
            // print an error message if an error occurs
            else{
                sayText(msgs('cor_payg_duplicate', {}, lang));
                promptDigits('cor_payg_reg', {'submitOnHash' : false, 'maxDigits' : max_digits_for_account_number, 'timeout' : timeout_length});
                return null;
            }
        }
        // if client doesn't have sufficient balance, tell them they haven't paid enough for a new code
        else{
            sayText(msgs('cor_payg_insufficient', {}, lang));
            promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            return null;
        }
    }
    else if(selection === 'chx_confirm'){
        // check how many chickens the client is eligible for
        var eligibility_check = require('./lib/chx-check-eligibility');
        state.vars.max_chx = eligibility_check(JSON.parse(state.vars.client_json));
        // depending on the eligibility, either prompt them to order or tell them they're not eligible and exit
        if(state.vars.max_chx === 0){
            sayText(msgs('chx_not_eligible', {}, lang));
            stopRules();
        }
        else{
            sayText(msgs('chx_order_message', {'$NAME' : state.vars.client_name, '$CHX_NUM' : state.vars.max_chx}));
            promptDigits('chx_place_order', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
    }
    else{
        var current_menu = msgs(selection, opts, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
});

addInputHandler('chx_place_order', function(input){
    input = parseInt(input.replace(/\D/g,''));
    state.vars.chx_order = input;
    // veto if client has entered an invalid chicken order; otherwise ask them to confirm
    if(input >= 2 && input <= state.vars.max_chx){
        var chx_cost = 2400; // abstract
        var credit = input * chx_cost;
        sayText(msgs('chx_confirm_order', {'$ORDER' : input, '$CREDIT' : credit}, lang));
        promptDigits('chx_confirm_order',  {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else{
        sayText(msgs('chx_invalid_order', {'$CHX_NUM' : state.vars.max_chx}, lang));
        promptDigits('chx_place_order', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }

});

addInputHandler('chx_confirm_order', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input === 1){
        // save the confirmed order in the data table
        var chx_table = project.getOrCreateDataTable('20b_chicken_table');
        var chx_cursor = chx_table.queryRows({'vars' : {'account_number' : state.vars.account_number}});
        if(chx_cursor.hasNext()){
            chx_row = chx_cursor.next();
            if(chx_cursor.hasNext()){
                admin_alert('Duplicate AN in chx db ' + state.vars.account_number);
            }
            chx_row.vars.ordered_chickens = state.vars.chx_order;
            chx_row.save();
            // send SMS to client with confirmation code
            var conf_code = chx_row.vars.confirmation_code;
            sayText(msgs('chx_order_finalized', {'$ORDER' : state.vars.chx_order, '$VOUCHER' : conf_code}, lang));
            var conf_msg = msgs('chx_confirmation_sms', {'$ORDER' : state.vars.chx_order, '$VOUCHER' : conf_code}, lang);
            var msg_route = project.vars.sms_push_route;
            project.sendMessage({'to_number' : contact.phone_number, 'route_id' : msg_route, 'content' : conf_msg});
            stopRules();
        }
        else{
            admin_alert('Account number ' + state.vars.account_number + ' not found in chicken dataset');
            stopRules();
        }
    }
    else{
        // return client to main menu
        var menu = populate_menu(state.vars.splash, lang);
        sayText(menu, lang);
        promptDigits('cor_menu_select', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : 180});
        return null;
    }
});

// CODE BLOCKS BELOW ARE FOR OLD CONFIRMATION SERVICE
/* addInputHandler('chx_confirm', function(input){
    input = parseInt(input.replace(/\D/g,''));
    state.vars.current_step = 'chx_confirm';
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
        var msg_route = project.vars.sms_push_route;
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
}); */


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
    //serial_no = parseInt(serial_no.replace(/\D/g,''));
    serial_no = serial_no.replace(/^0+/,'');
    console.log("Serial number is " + serial_no + " and its type is " + typeof(serial_no));
    var serial_verify = require('./lib/cor-serial-verify');
    // if the input serial is valid, give the client their PAYG code
    if(serial_verify(serial_no)){
        sayText(msgs('cor_payg_true', {'$PAYG' : state.vars.payg_code}, lang));
        promptDigits('cor_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    // else prompt them to re-enter their serial number
    else if(state.vars.serial_status){
        sayText(msgs('cor_payg_invalid_serial', {}, lang));
        promptDigits('cor_payg_reg', {'submitOnHash' : false, 'maxDigits' : max_digits_for_account_number, 'timeout' : timeout_length})
        return null;
    }
    // if error occurs, print error message for the client
    else{
        sayText(msgs('cor_payg_error', {}, lang));
        return null;
    }
});
