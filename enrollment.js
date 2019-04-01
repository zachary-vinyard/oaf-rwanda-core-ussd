/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
*/

var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu')
var lang = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;

global.main = function(){
    var splash_menu = populate_menu('enr_splash', lang);
    console.log(splash_menu);
    sayText(msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang))
    promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
}

addInputHandler('enr_splash', function(input){ //input
    state.vars.current_step = 'enr_splash';
    input = parseInt(input.replace(/\D/g,''));
    
});

