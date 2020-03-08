/*
    Script: impact-quiz.js
    Description: RW program agricultural knowledge quiz for field staff
    Status: in progress
*/

// load in relevant modules and set constants
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var reinit = require('./lib/ext-reinitization');
var checkstop = require('./lib/ext-check-stop');
const lang = 'ki';

// display welcome message and prompt user to run through list of demographic questions
global.main = function(){
    // initialize counter variables
    state.vars.survey_type = 'dem';
    state.vars.step = 1;
    // display welcome message and first demographic question
    sayText(msgs('imp_main_splash'));
    var survey_table = project.getOrCreateDataTable('ag_survey_questions');
    var question_cursor = survey_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}});
    var question = question_cursor.next();
    sayText(msgs(question.vars.question_text, {}, lang));
    promptDigits('demo_question', {'submitOnHash' : false, 
                                        'maxDigits'    : project.vars.max_digits_for_input,
                                        'timeout'      : project.vars.timeout_length});
}

// input handler for demographic questions
addInputHandler('demo_question', function(input){
    // ADD HERE: steps to verify input format - text only? matches something in DB? meets max/min requirements
    // save status and response in session data
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;

    // initialize variables and table
    var survey_length = 3; // pull direct from table
    var survey_table = project.getOrCreateDataTable('ag_survey_questions');
    state.vars.step += 1;

    // if there are remaining questions, ask the next one; else ask the first quiz question
    if(state.vars.step < survey_length){
        var question_cursor = survey_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}});
        var question = question_cursor.next();
        sayText(msgs(question.vars.question_text, {}, lang));
        promptDigits('demo_question', {'submitOnHash' : false, 
                                            'maxDigits'    : project.vars.max_digits_for_input,
                                            'timeout'      : project.vars.timeout_length});
    }
    else{
        // initialize variables for tracking place in impact quiz
        state.vars.survey_type = 'trn';
        state.vars.step = 1;
        // ask first quiz question
        var question = survey_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}}).next();
        sayText(msgs(question.vars.question_text, {}, lang));
        promptDigits('quiz_question', {'submitOnHash' : false, 
                                            'maxDigits'    : project.vars.max_digits_for_input,
                                            'timeout'      : project.vars.timeout_length});
    }
});

// input handler for survey questions
addInputHandler('quiz_question', function(input){
    // test and store input response
    input = parseInt(input.replace(/\s/g,''));
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;
    var survey_length = 8; // pull direct from table

    // verify response and retrieve relevant feedback string
    var verify = require('./lib/imp-answer-verify');
    var feedback = verify(input);
    state.vars.step += 1;

    // ask next question or display score if complete
    if(state.vars.step < survey_length){
        var ask = require('./lib/imp-ask-question');
        ask(feedback);
        return null;
    }
    else{
        sayText(msgs('imp_closing_message', {   '$FEEDBACK'    : feedback,
                                            '$NUM_CORRECT' : state.vars.num_correct}, lang));
        return null;
    }
});