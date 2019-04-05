/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
input handler IDs must match the associated menu tables. if input handlers are not available, functions will fail
*/

var msgs = require('./lib/msg-retrieve');
var populate_menu = require('./lib/populate-menu')
var get_menu_option = require('./lib/get-menu-option');
var get_client = require('./lib/retrieve-client-row');

/*
global options - feel free to refactor someday future friends
*/
const lang = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;
const an_pool = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'enr_client_pool'}}).next().vars.value;
/*
main function
*/
global.main = function(){
    var splash_menu = populate_menu('enr_splash', lang);
    var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
    state.vars.current_menu_str = current_menu;
    sayText(current_menu);
    promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
};

addInputHandler('enr_splash', function(input){ //input handler for splash - expected inputs in table 'enr_splash' on tr
    state.vars.current_step = 'enr_splash';
    console.log(state.vars.current_step);
    input = parseInt(input.replace(/\D/g,''));
    var selection = get_menu_option(input, state.vars.current_step);
    if(selection == null){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else{
        var current_menu = msgs(selection, {}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : 16,'timeout' : 180})
    }
}); // end of splash

/*
input handlers for registration steps
*/
addInputHandler('enr_reg_start', function(input){ //input is first entry of nid - next step is nid confirm
    state.vars.current_step = 'enr_reg_start';
    input = parseInt(input.replace(/\D/g,''));
    var check_if_nid = require('./lib/check-nid');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    if(!check_if_nid(input)){
        sayText(msgs('enr_invalid_nid',{},lang));
        promptDigits('enr_reg_start', {'submitOnHash' : false, 'maxDigits' : 16,'timeout' : 180})
    }
    else{
        state.vars.reg_nid = input;
        sayText(msgs('enr_nid_confirm', {}, lang));
        promptDigits('enr_nid_confirm', {'submitOnHash' : false, 'maxDigits' : 16,'timeout' : 180});
    }
});

addInputHandler('enr_nid_confirm', function(input){ //step for dd of nid. input here should match stored nid
    state.vars.current_step = 'enr_nid_confirm';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else if(state.vars.reg_nid == input){
        sayText(msgs('enr_name_1', {}, lang));
        promptDigits('enr_name_1', {'submitOnHash' : false, 'maxDigits' : 2,'timeout' : 180});
    }
    else{
        sayText(msgs('enr_unmatched_nid', {}, lang));
        promptDigits('enr_reg_start', {'submitOnHash' : false, 'maxDigits' : 16,'timeout' : 180});
    }
});

addInputHandler('enr_name_1', function(input){ //enr name 1 step
    state.vars.current_step = 'enr_name_1';
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    input = input.replace(/[^a-z_]/ig,'');
    if(input === undefined || input == ''){
        sayText(msgs('enr_invalid_name_input', {}, lang));
        promptDigits('enr_name_1',  {'submitOnHash' : false, 'maxDigits' : 2,'timeout' : 180});
    }
    else{
        state.vars.reg_name_1 = input;
        sayText(msgs('enr_name_2', {}, lang));
        promptDigits('enr_name_2',  {'submitOnHash' : false, 'maxDigits' : 2,'timeout' : 180});
    }
});

addInputHandler('enr_name_2', function(input){ //enr name 2 step
    state.vars.current_step = 'enr_name_2';
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    input = input.replace(/[^a-z_]/ig,'');
    if(input === undefined || input == ''){
        sayText(msgs('enr_invalid_name_input', {}, lang));
        promptDigits('enr_name_2',  {'submitOnHash' : false, 'maxDigits' : 2,'timeout' : 180});
    }
    else{
        state.vars.reg_name_2 = input;
        sayText(msgs('enr_pn', {}, lang));
        promptDigits('enr_pn', {'submitOnHash' : false, 'maxDigits' : 2,'timeout' : 180});
    }
});

addInputHandler('enr_pn', function(input){ //enr phone number step
    state.vars.current_step = 'enr_pn';
    input = input.replace(/\D/g,'');
    var check_pn = require('./lib/phone-format-check');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
    if(check_pn(input)){
        state.vars.reg_pn = input;
        sayText(msgs('enr_glus', {}, lang));
        promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : 16,'timeout' : 180});
    }
    else{
        sayText(msgs('invalid_pn_format', {}, lang));
        promptDigits('enr_pn');
    }
});

addInputHandler('enr_glus', function(input){ //enr group leader / umudugudu support id step. last registration step
    state.vars.current_step = 'enr_glus';
    input = input.replace(/\^W/g,'');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
    var check_glus = require('./lib/check-glus');
    var geo = check_glus(input);
    if(geo){
        var client_log = require('./lib/enr-client-logger');
        state.vars.glus = input;
        var account_number = client_log(state.vars.nid, state.vars.reg_name_1, state.vars.reg_name_2, state.vars.pn, state.vars.glus, geo, an_pool);
        var enr_msg = msgs('enr_reg_complete', {'$ACCOUNT_NUMBER' : account_number}, lang);
        sayText(enr_msg);
        var messager = require('./lib/enr-messager');
        messager(contact.phone_number, enr_msg);
        messager(state.vars.reg_pn, enr_msg);
        promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : 4,'timeout' : 180});
    }
    else{
        sayText(msgs('enr_invalid_glus', {}, lang));
        promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : 4,'timeout' : 180});
    }
});//end registration steps input handlers

/*
input handlers for input ordering
*/
addInputHandler('enr_order_start', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_start';
    input = parseInt(input.replace(/\D/g,''));
    //ask for account number - next step is splash
});

addInputHandler('enr_input_splash', function(input){
    state.vars.current_step = 'enr_input_splash';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    client = get_client(input, an_pool);
    if(!(client == null)){
        state.vars.session_authorized = true;
        state.vars.session_account_number = input;
        //need to add next steps to ordering - splash menu for 
    }
    else{
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits('enr_order_start');
    }
});

addInputHandler('enr_input_order', function(input){
    state.var.current_step = 'enr_input_order';
});
//end input order handlers

/*
input handlers for order review
*/
addInputHandler('enr_order_review_start', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_review_start';
    input = parseInt(input.replace(/\D/g,''));
});
//end order review

/*
input handlers for finalize order
*/
addInputHandler('enr_finalize_start', function(input){ //needs to be updated
    state.vars.current_step = 'enr_finalize_start';
    input = parseInt(input.replace(/\D/g,''));
});

//end finalizae order

/*
input handlers for gl id retrieve 
*/
addInputHandler('enr_glus_id', function(input){ //needs to be updated
    state.vars.current_step = 'enr_glus_id';
    input = parseInt(input.replace(/\D/g,''));
});
//end gl id retrieve

/*
generic input handler for returning to main splash menu
*/
addInputHandler('enr_continue', function(input){
    state.var.current_step = 'enr_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){
        var splash_menu = populate_menu('enr_splash', lang);
        var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
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
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if(input == 99){ //exit
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
});
