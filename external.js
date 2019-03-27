/*
main file for external advertising ussd function
uses lib from core to execute some functions
so very incomplete - for testing purposes only now
*/

var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var geo_select = require('./lib/geo-select');
var geo_process = require('./lib/geo-string-processer');
var geo_data = require('./dat/rwanda-gov-geography');

global.main = function(){
    var geo_list = geo_process(geo_data);
    sayText(msgs('external_splash', geo_list));
    promptDigits('geo_selection_province', { 'submitOnHash' : false,
                                    'maxDigits'    : 1,
                                    'timeout'      : 180 });
}

addInputHandler('geo_selection_province', function(input){
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        geo_data = geo_select(selection, geo_data);
        console.log(typeof(geo_data));
        if('fo_name' in geo_data){ //reached bottom - sends client FO phone number and send message to FO. send via USSD and via SMS
            //here finalize - send message 
        }
        else{
            var selection_menu = geo_process(geo_data);
            msgs('geo_selections', selection_menu);
            waitForResponse('geo_selection_district', {'submitOnHash' : false,
                                               'maxDigits'   : 1,
                                               'timeout'     : 180});
        }
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
    }
});

addInputHandler('geo_selection_district', function(input){
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = keys[input - 1]
        geo_data = geo_select(selection, geo_data);
        if('fo_name' in geo_data){ //reached bottom - sends client FO phone number and send message to FO. send via USSD and via SMS
            //here finalize - send message 
        }
        else{
            var selection_menu = geo_process(geo_data);
            msgs('geo_selections', selection_menu);
            waitForResponse('geo_selection_sector', {'submitOnHash' : false,
                                               'maxDigits'   : 1,
                                               'timeout'     : 180});
        }
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
    }
});

addInputHandler('geo_selection_sector', function(input){
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = keys[input - 1]
        geo_data = geo_select(selection, geo_data);
        if('fo_name' in geo_data){ //reached bottom - sends client FO phone number and send message to FO. send via USSD and via SMS
            admin_alert('ERROR', 'ERROR')
        }
        else{
            var selection_menu = geo_process(geo_data);
            msgs('geo_selections', selection_menu);
            waitForResponse('geo_selection_cell', {'submitOnHash' : false,
                                               'maxDigits'   : 1,
                                               'timeout'     : 180});
        }
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
    }
});
