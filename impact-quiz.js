/*
    Script: impact-quiz.js
    Description: RW program agricultural knowledge quiz for field staff
    Status: in progress
*/

// load in general functions
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu');
var get_menu_option = require('./lib/get-menu-option');

// load in impact-specific modules
var reinit = require('./lib/ext-reinitization');
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
    // save status and response in session data
    // ADD HERE: steps to verify input format 
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;

    // initialize variables and table
    var survey_length = 3; // pull direct from table
    var survey_table = project.getOrCreateDataTable('ag_survey_questions');
    state.vars.step += 1;

    if(state.vars.step < survey_length){
        var question_cursor = survey_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}});
        var question = question_cursor.next();
        sayText(msgs(question.vars.question_text, {}, lang));
        promptDigits('crop_demo_question', {'submitOnHash' : false, 
                                            'maxDigits'    : project.vars.max_digits_for_input,
                                            'timeout'      : timeout_length});
    }
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
    // test and store input response
    input = parseInt(input.replace(/\s/g,''));
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;
    var survey_length = 8; // try to pull this directly from table

    // verify response and retrieve relevant feedback string
    var verify = require('./lib/imp-answer-verify');
    var feedback = verify(input);
    state.vars.step += 1;

    // ask next question or display score if complete
    if(state.vars.step < survey_length){
        var ask = require('./lib/imp-ask-question');
        ask(feedback);
    }
    else{
        sayText(msgs('closing_message', {   '$FEEDBACK'    : feedback,
                                            '$NUM_CORRECT' : state.vars.num_correct}, lang));
    }
});