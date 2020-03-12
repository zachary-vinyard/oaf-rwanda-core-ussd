/*
    Script: impact-quiz.js
    Description: RW program agricultural knowledge quiz for field staff
    Status: in progress
*/

// load in relevant modules and set constants
var geo_select = require('./lib/cta-geo-select');
var geo_process = require('./lib/cta-geo-string-processer');
var geo_data = require('./dat/rwanda-gov-geography');
var reinit = require('./lib/imp-reinitization');
var msgs = require('./lib/msg-retrieve');

// initialize constants
const lang = 'ki';

// display welcome message and prompt user to run through list of demographic questions
global.main = function(){
    // display welcome message and first geo question
    reinit();
    var geo_list = geo_process(geo_data);
    state.vars.current_menu = JSON.stringify(geo_list);
    sayText(msgs('imp_main_splash', geo_list));
    promptDigits('geo_selection_1', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
}

// input handler for region selection
addInputHandler('geo_selection_1', function(input){
    state.vars.current_step = 'geo_selection_1';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.province = selection;
        state.vars.province_name = keys[selection];
        call.vars.province = state.vars.province_name;
        geo_data = geo_select(selection, geo_data)
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('geo_selections', selection_menu));
        promptDigits('geo_selection_2', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input == 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits('geo_selection_1', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

// input handler for district selection
addInputHandler('district', function(input){
    state.vars.current_step = 'geo_selection_2';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var province = parseInt(state.vars.province);
    geo_data = geo_select(province, geo_data);
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
        var ask = require('./lib/imp-ask-question');
        ask();
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits('geo_selection_2', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

// input handler for survey questions
addInputHandler('quiz_question', function(input){
    // test and store input response
    input = parseInt(input.replace(/\s/g,''));
    if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;
    var survey_length = 8; // pull direct from table

    // verify response and retrieve relevant feedback string
    var verify = require('./lib/imp-answer-verify');
    var feedback = verify(input);
    state.vars.step += 1;

    // ask next question or display score if complete
    if(state.vars.step <= survey_length){
        var ask = require('./lib/imp-ask-question');
        ask(feedback);
        return null;
    }
    else{
        call.vars.status = 'complete';
        sayText(msgs('imp_closing_message', {   '$FEEDBACK'    : feedback,
                                            '$NUM_CORRECT' : state.vars.num_correct}, lang));
        return null;
    }
});