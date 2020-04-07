var geo_select = require('./lib/cta-geo-select');
var geo_process = require('./lib/cta-geo-string-processer');
var geo_data = require('./dat/rwanda-tubura-geography');
var msgs = require('./lib/msg-retrieve');
var msgs = require('./lib/msg-retrieve');

const max_digits_for_account_number = project.vars.max_digits_an;

global.main = function () {

    var geo_list = geo_process(geo_data);
    state.vars.current_menu = JSON.stringify(geo_list);
    sayText(msgs('train_main_splash', geo_list));
    promptDigits('province_selection', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
};

addInputHandler('province_selection', function(input){
    state.vars.current_step = 'geo_selection_1';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.region = selection;
        state.vars.region_name = keys[selection];
        call.vars.region = state.vars.region_name;
        geo_data = geo_select(selection, geo_data)
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('geo_selections', selection_menu));
        promptDigits('district_selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits('province_selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});
// input handler for district selection
addInputHandler('district_selection', function(input){
    state.vars.current_step = 'geo_selection_2';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var region = parseInt(state.vars.region);
    geo_data = geo_select(region, geo_data);
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.district = selection;
        state.vars.district_name = keys[selection];
        call.vars.district = state.vars.district_name;
        // initialize variables for tracking place in impact quiz
        state.vars.survey_type = 'trn';
        state.vars.step = 1;
        state.vars.num_correct = 0;
        // ask first quiz question
        //var ask = require('./lib/imp-ask-question');
        //ask();
        sayText('The question id is : '+ state.id);
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits('district selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});