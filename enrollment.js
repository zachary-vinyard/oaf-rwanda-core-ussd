/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
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
    sayText(msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang))
    promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
}

addInputHandler('enr_splash', function(input){ //input
    state.vars.current_step = 'enr_splash';
    input = parseInt(input.replace(/\D/g,''));
    var selection = get_menu_option(input, state.vars.current_step);
    console.log(selection);
    console.log(lang);
    sayText(msgs(selection, {}, lang));
    promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180})
});
