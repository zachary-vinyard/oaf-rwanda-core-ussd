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
    var check_vid = require('./lib/ext-vid-verify');
    if(check_vid(input)){
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
    var check_sedo = require('./lib/ext-sedo-verify');
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
    var check_vid = require('./lib/ext-vid-verify');
    if(check_vid(input)){
        sayText(msgs('gender_select', {}, lang));
        promptDigits('sedo_enter_gender', { 'submitOnHash' : false, 
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
addInputHandler('sedo_enter_gender', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_age_question', {}, lang));
        promptDigits('sedo_enter_age', {'submitOnHash' : false, 
                                        'maxDigits'    : 2,
                                        'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_gender', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's age
addInputHandler('sedo_enter_age', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_tenure_question', {}, lang));
        promptDigits('sedo_enter_tenure', { 'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_age', {   'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's tenure
addInputHandler('sedo_enter_tenure', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_num_trainings', {}, lang));
        promptDigits('sedo_enter_trn', {    'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_tenure', {   'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's number of trainings
addInputHandler('sedo_enter_trn', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_num_trained', {}, lang));
        promptDigits('sedo_enter_farmers', {'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_trn', {    'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's number of farmers trained
addInputHandler('sedo_enter_farmers', function(input){
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_num_groups', {}, lang));
        promptDigits('sedo_enter_groups', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_farmers', {'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
    }
});

// input handler for SEDO's number of groups
addInputHandler('sedo_enter_farmers', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
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
        var feedback = '';
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
    state.vars.question_number = state.vars.question_number + 1;

    // display the relevant message and prompt user to select a response
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = survey_table.queryRows({'vars' : {'questionid' : state.vars.question_id}}).next();

    // messy accounting for survey questions with fewer options
    var num_opts = question.vars.numoptions;
    var opt3 = '';
    var opt4 = '';
    if(num_opts > 2){
        opt3 = '3) ' + question.vars.opt3;
        if(num_opts > 3){
            opt4 = '4) ' + question.vars.opt4;
        }
    }

    // display text and prompt user to select their choice
    sayText(msgs('survey_question',    {'$FEEDBACK' : feedback,
                                            '$TEXT' : question.vars.questiontext,
                                            '$OPT1' : '1) ' + question.vars.opt1, 
                                            '$OPT2' : '2) ' + question.vars.opt2,
                                            '$OPT3' : opt3,
                                            '$OPT4' : opt4}, lang));
    promptDigits('survey_response', {   'submitOnHash' : false, 
                                        'maxDigits'    : max_digits_for_input,
                                        'timeout'      : timeout_length});
}); 