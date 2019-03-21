/*
main file for external advertising ussd function
uses lib from core to execute some functions
so very incomplete - for testing purposes only now
*/

var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var geo_select = require('./lib/geo-select');

global.main = function(){
    sayText(msgs('external_splash'));
    state.vars.geo_data = JSON.stringify(geo_select('Rwanda'));
    promptDigits('geo_select_level_1', { 'submitOnHash' : false,
                                            'maxDigits'    : 1,
                                            'timeout'      : 180 });
}

addInputHandler('geo_select_level_1', function(input){
    input = input.replace(/[\W_]+/g,"") //cleans out anything non-alphnumeric in the input - really, input should only 
    if(input in JSON.parse(state.vars.geo_data)){ // need to make sure that 
        //do something - go to geoselect 2
    }
});
