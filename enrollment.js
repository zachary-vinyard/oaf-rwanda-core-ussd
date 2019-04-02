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
global options - feel free to refactor someday
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

addInputHandler('enr_splash', function(input){ //input
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

addInputHandler('enr_reg', function(input){
    state.vars.current_step = 'enr_reg';
});

addInputHandler('invalid_input', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){
        sayText(state.vars.current_menu_str);
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if(input == 99){
        sayText(msgs('exit',{},lang));
        stopRules();
    }
});
