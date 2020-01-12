/*
    Script: extension-survey.js
    Description: RW program extension survey for FPs and SEDOs
    Status: complete but not tested
*/

// load in necessary functions
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu');
var get_menu_option = require('./lib/get-menu-option');
var reinitization = require('./lib/ext-reinitization');
var ask = require('./lib/ext-ask-question');
var check_vid = require('./lib/ext-vid-verify');
var check_sedo = require('./lib/ext-sedo-verify');

// set various constants -- add to list of project variables
const lang = project.vars.cor_lang;
const max_digits_for_input = project.vars.max_digits_for_input;
const max_digits_for_vid = project.vars.max_digits_for_vid;
const max_digits_for_sedo_id = project.vars.max_digits_for_sedo_id;
const max_digits = 3;
const timeout_length = project.vars.timeout_length;

// display welcome message and prompt user to choose their survey (AMA1, AMA2, GUS)
global.main = function(){
    sayText(msgs('ext_main_splash'));
    var menu = populate_menu('ext_splash_menu', lang);
    sayText(menu, lang);
    promptDigits('ext_main_splash', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_input,
                                        'timeout'      : timeout_length });
}

// input handler for survey type
addInputHandler('ext_main_splash', function(input){
    // redirect user based on their input menu selection
    var selection = get_menu_option(input, 'ext_splash_menu');
    if(selection === 'ama1' || selection === 'ama2'){
        sayText(msgs('fp_enter_id'));
        promptDigits('fp_enter_id', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_vid,
                                        'timeout'      : timeout_length 
                                    });
    }
    else if(selection === 'gus'){
        sayText(msgs('sedo_enter_id'));
        promptDigits('sedo_enter_id',  {'submitOnHash'  : false,
                                        'maxDigits'     : max_digits_for_sedo_id,
                                        'timeout'       : timeout_length 
                                        });
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('ext_main_splash', { 'submitOnHash'   : false, 
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length});
    }
});

// input handler for FP's village ID
addInputHandler('fp_enter_id', function(input){
    // verify village id
    input = input.replace(/\s/g,'');
    if(check_vid(input)){
        // return user to previous step if they are coming back to the survey
        if(reinitization() & state.vars.question_id){
            ask();
        }
        else{
            // initialize counter variables
            state.vars.question_number = 1;
            state.vars.num_correct = 0;
            // display crop survey menu
            sayText(msgs('survey_start', {}, lang));
            var menu = populate_menu('crop_menu', lang);
            sayText(menu, lang);
            promptDigits('survey_response', {   'submitOnHash' : false, 
                                                'maxDigits'    : max_digits_for_input,
                                                'timeout'      : timeout_length});
        }
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('fp_enter_id', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_vid,
                                        'timeout'      : timeout_length 
                                    });
    }
});

// input handler for SEDO ID
addInputHandler('sedo_enter_id', function(input){
    // check sedo id
    input = input.replace(/\s/g,'');
    // if sedo id is valid, prompt user to enter village id; otherwise request user to re-enter sedo id
    if(check_sedo(input)){
        sayText(msgs('sedo_enter_vid', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_vid,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_id', {     'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_sedo_id,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's village ID
addInputHandler('sedo_enter_vid', function(input){
    input = input.replace(/\s/g,'');
    if(check_vid(input)){
        // initialize tracker variables
        state.vars.step = 1;
        state.vars.survey_type = 'mon';
        // display text and prompt user to select their choice
        sayText(msgs('fp_gender', {}, lang));
        promptDigits('demo_question', {     'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_vid,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's gender
addInputHandler('demo_question', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    // if input is valid, increment the step; otherwise display an error message
    if(input){
        state.vars.step = state.vars.step + 1;
        console.log('Input is valid' + state.vars.step + typeof(state.vars.step));
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
    }
    var demo_table = project.getOrCreateDataTable('demo_table');
    var question_cursor = demo_table.queryRows({'vars' : {  'question_id' : state.vars.step,
                                                            'survey_type' : state.vars.survey_type}
                                        });
    var question = question_cursor.next().vars.msg_name;
    console.log('Question is ' + question);
    
    // display text and prompt user to select their choice
    sayText(msgs(question, {}, lang));
    promptDigits('demo_question', {     'submitOnHash' : false, 
                                        'maxDigits'    : question.vars.max_digits,
                                        'timeout'      : timeout_length});
});

// input handler for SEDO's number of groups
addInputHandler('sedo_enter_groups', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        call.vars.Status = 'NumberOfGroups';
        // if user is reinitizing, return them to previous survey question
        if(reinitization() & state.vars.question_id){
            ask();
        }
        else{
            call.vars.Status = 'SurveyStart';
            // initialize counter variables
            state.vars.question_number = 1;
            state.vars.num_correct = 0;
            // display crop survey menu
            sayText(msgs('survey_start', {}, lang));
            var menu = populate_menu('crop_menu', lang);
            sayText(menu, lang);
            promptDigits('survey_response', {   'submitOnHash' : false, 
                                                'maxDigits'    : max_digits_for_input,
                                                'timeout'      : timeout_length});
        }
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_groups', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
    }
});


// input handler for the survey
addInputHandler('survey_response', function(input){
    if(state.vars.question_number === 1){
        state.vars.crop = get_menu_option(input, 'crop_menu');
    }
    else{
        input = input.replace(/\s/g,'');
        var feedback = require('./lib/ext-answer-verify')(input);
        if(state.vars.question_number > 10){
            // say closing message and end survey if all questions are complete
            sayText(msgs('closing_message', {'$FEEDBACK'    : feedback,
                                             '$NUM_CORRECT' : state.vars.num_correct}, lang));
            return null;
        }
    }
    // set question id in correct format, then increment the question number
    state.vars.question_id = String(state.vars.crop + 'Q' + state.vars.question_number);
    call.vars.Status = String('Q' + state.vars.question_number);
    state.vars.question_number = state.vars.question_number + 1;
    // ask the survey question
    ask(feedback);
}); 