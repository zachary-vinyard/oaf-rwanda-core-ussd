/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
input handler IDs must match the associated menu tables. if input handlers are not available, functions will fail
*/

var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu')
var get_menu_option = require('./lib/get-menu-option');
var get_client = require('./lib/retrieve-client-row');

/*
global options - feel free to refactor someday future friends
*/
const lang = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;
const an_pool = '20A_client_accounts';
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
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180})
    }
});

/*
splash menu function 1-5
*/
addInputHandler('enr_reg_nid', function(input){ //input is first entry of nid - next step is nid confirm
    state.vars.current_step = 'enr_reg_nid';
    input = parseInt(input.replace(/\D/g,''));
    sayText(msgs('enr_reg_nid'))
});

addInputHandler('enr_order_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_an';
    input = parseInt(input.replace(/\D/g,''));
});

addInputHandler('enr_order_review_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_review_an';
    input = parseInt(input.replace(/\D/g,''));
});

addInputHandler('enr_finalize_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_finalize_an';
    input = parseInt(input.replace(/\D/g,''));
});

addInputHandler('enr_glus_id', function(input){ //needs to be updated
    state.vars.current_step = 'enr_glus_id';
    input = parseInt(input.replace(/\D/g,''));
}); //end splash menu input handlers

/*
input handlers for registration steps
TODO: complete these!
*/
addInputHandler('enr_nid', function(input){ //step for dd of nid. input here should match stored nid
    state.vars.current_step = 'enr_nid';
});

addInputHandler('enr_nid_confirm', function(input){ //step for dd of nid. input here should match stored nid
    state.vars.current_step = 'enr_nid_confirm';
});

addInputHandler('enr_name_1', function(input){ //enr name 1 step
    state.vars.current_step = 'enr_name_1';
});

addInputHandler('enr_name_1', function(input){ //enr name 2 step
    state.vars.current_step = 'enr_name_1';
});

addInputHandler('enr_pn', function(input){ //enr phone number step
    state.vars.current_step = 'enr_pn';
});

addInputHandler('enr_glus', function(input){ //enr group leader / umudugudu support id step. should be last registration step
    state.vars.current_step = 'enr_glus';
}); //end registration steps input handlers

/*
input handlers for input ordering
*/
addInputHandler('enr_input_splash', function(input){
    state.vars.current_step = 'enr_input_splash';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
    client = get_client(input, an_pool);
    if(!(client == null)){
        state.vars.session_authorized = true;
        state.vars.session_account_number = input;
        //need to add next steps to ordering
    }
    else{
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits('enr_order_an');
    }
});

addInputHandler('enr_input_order', function(input){
    state.var.current_step = 'enr_input_order';
});
//end input order handlers

/*
generic input handler for returning to main splash menu
*/
addInputHandler('enr_continue', function(input){
    state.var.current_step = 'enr_continue';
    var splash_menu = populate_menu('enr_splash', lang);
    var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
    state.vars.current_menu_str = current_menu;
    sayText(current_menu);
    promptDigits
});


/*
input handler for invalid input - most input handlers dump here for unrecognized input
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
    }
});
