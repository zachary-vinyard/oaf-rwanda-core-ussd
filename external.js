/*
main file for external advertising ussd function
uses lib from core to execute some functions
so very incomplete - for testing purposes only now
*/

var msgs = require('./lib/msg-retrieve'); //global message handler
var admin_alert = require('./lib/admin-alert'); //global admin alerter
var geo_select = require('./lib/geo-select');
var geo_process = require('./lib/geo-string-processer');
var client_log = require('./lib/cta-client-logger');
var geo_data = require('./dat/rwanda-gov-geography');

global.main = function(){
    var get_phones = require('./lib/identify-phones');
    get_phones();
    var geo_list = geo_process(geo_data);
    state.vars.current_menu = JSON.stringify(geo_list);
    sayText(msgs('external_splash', geo_list));
    promptDigits('geo_selection_1', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
}

/*
input = province selection
shows list of districts from province
*/
addInputHandler('geo_selection_1', function(input){
    state.vars.current_step = 'geo_selection_1'
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.province = selection;
        state.vars.province_name = keys[selection];
        client_log(contact.phone_number, {'province' : state.vars.province_name});
        geo_data = geo_select(selection, geo_data)
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('geo_selections', selection_menu));
        promptDigits('geo_selection_2', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
        promptDigits('repeat_geo_input', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

/*
input = district selection
shows list of sectors from district
*/
addInputHandler('geo_selection_2', function(input){
    state.vars.current_step = 'geo_selection_2';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var province = parseInt(state.vars.province);
    geo_data = geo_select(province, geo_data);
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.district = selection;
        state.vars.district_name = keys[selection];
        client_log(contact.phone_number, {'district' : state.vars.district_name});
        geo_data = geo_select(selection, geo_data);
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('geo_selections', selection_menu));
        promptDigits('geo_selection_3', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
        promptDigits('repeat_geo_input', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

/*
input = sector selection
shows list of cells from sectors
*/
addInputHandler('geo_selection_3', function(input){
    state.vars.current_step = 'geo_selection_3';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var district = state.vars.district;
    var province = state.vars.province;
    geo_data = geo_select(district, geo_select(province, geo_data));
    var keys = Object.keys(geo_data);
    console.log('at the sector handler now');
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        geo_data = geo_select(selection, geo_data);
        state.vars.sector = selection;
        state.vars.sector_name = keys[selection];
        client_log(contact.phone_number, {'sector' : state.vars.sector_name});
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('geo_selections', selection_menu));
        promptDigits('geo_selection_4', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
        promptDigits('repeat_geo_input', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});


/*
input = cell selection
final step! needs fixing
*/
addInputHandler('geo_selection_4', function(input){
    state.vars.current_step = 'geo_selection_4';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var province = state.vars.province;
    var district = state.vars.district;
    var sector = state.vars.sector;
    geo_data = geo_select(sector, geo_select(district, geo_select(province, geo_data)));
    var keys = Object.keys(geo_data);
    console.log('at the cell handler now');
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        var cell_name = keys[selection];
        state.vars.cell_name = cell_name;
        client_log(contact.phone_number, {'cell' : cell_name});
        var fo_dat = geo_process(geo_select(selection, geo_data));
        var fo_phone = fo_dat["$FO_PHONE"];
        fo_dat["$CELL_NAME"] =  cell_name;
        console.log(JSON.stringify(fo_dat));
        if(!(fo_phone == 0)){
            sayText(msgs('cto_fo_information', fo_dat));
        }
        else{
            sayText(msgs('cto_no_fo', fo_dat))
        }
        stopRules();
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('invalid_geo_input'));
        promptDigits('repeat_geo_input', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

/*
input handler for errors or repeated inputs
*/
addInputHandler('repeat_geo_input', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input === 99){
        sayText('exit');
        stopRules();
    }
    else if(input === 1){
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else{
        sayText('exit');
        stopRules();
    }
});
