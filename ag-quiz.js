/*
    Script: ag-quiz.js
    Description: RW program agricultural knowledge quiz for field staff
    Status: in progress
*/

// load in general functions
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu');
var get_menu_option = require('./lib/get-menu-option');

// load in extension-specific modules
var reinit = require('./lib/ext-reinitization');
var ask = require('./lib/ext-ask-question');
var check_vid = require('./lib/ext-vid-verify');
var check_sedo = require('./lib/ext-sedo-verify');
var start_survey = require('./lib/ext-survey-start');
var checkstop = require('./lib/ext-check-stop');

// display welcome message and prompt user to run through list of demographic questions
global.main = function(){
    // initialize counter variables
    state.vars.survey_type = 'dem';
    state.vars.step = 1;
    // display welcome message and start demo questions
    sayText(msgs('agr_main_splash'));
    promptDigits('demo_question', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_input,
                                        'timeout'      : timeout_length });
}

// input handler for demographic questions
addInputHandler('demo_question', function(input){
    // set status in session data
    call.vars.status = state.vars.survey_type + state.vars.step;

    // execute following steps until no more demo questions, then move to survey questions

    /*
        verify input is correctly formatted:
        - text only (needs to match something in database?) << advise Leana to go with an ID?
        - meets max/min requirements

        save input in session data

        increment step
    */
});

// input handler for survey questions
addInputHandler('survey_question', function(input){
    // set status in session data
    call.vars.status = state.vars.survey_type + state.vars.step;

    // execute following steps until no more survey questions, then display score etc

    /*
        verify input is correctly formatted:
        - number? or just say it's wrong if it's not a number?

        save input in session data
        display correct answer
        increment num_correct if it's correct

        increment step
    */

    
});