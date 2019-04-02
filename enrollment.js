/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
input handler IDs must match the associated menu tables. if input handlers are not available, functions will fail
*/

var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu')
var get_menu_option = require('./lib/get-menu-option');

/*
global options - feel free to refactor someday future friends
*/
var lang = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;

/*
main function
*/
global.main = function(){
    console.log(lang);
    var splash_menu = populate_menu('enr_splash', lang);
    var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
    state.vars.current_menu_str = current_menu;
    sayText(current_menu);
    promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
}

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
addInputHandler('enr_reg', function(input){ //needs to be updated
    state.vars.current_step = 'enr_reg';
});

addInputHandler('enr_order_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_an';
});

addInputHandler('enr_order_review_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_order_review_an';
});

addInputHandler('enr_finalize_an', function(input){ //needs to be updated
    state.vars.current_step = 'enr_finalize_an';
});

addInputHandler('enr_glus_id', function(input){ //needs to be updated
    state.vars.current_step = 'enr_glus_id';
});


/*
input handlers for registration steps
TODO: complete these!
*/
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
});
//end registration steps input handlers

/*
input handler for invalid input - most input handlers dump here for unrecognized input
*/
addInputHandler('invalid_input', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){
        sayText(state.vars.current_menu_str);
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
});
