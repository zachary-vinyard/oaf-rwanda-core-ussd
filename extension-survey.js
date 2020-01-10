/*
    Script: extension-survey.js
    Description: RW program extension survey for FPs and SEDOs
    Status: in progress
*/

// load in necessary functions
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var get_menu_option = require('./lib/get-menu-option');
var populate_menu = require('./lib/populate-menu');

// set various constants -- add to list of project variables
const lang = project.vars.cor_lang;
const max_digits_for_input = 1;
const max_digits = 3;
const max_digits_for_account_number = 8;
const timeout_length = 60;

// display welcome message and prompt user to choose their survey (AMA1, AMA2, GUS)
global.main = function(){
    sayText(msgs('ext_main_splash'));
    promptDigits('ext_main_splash', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_input,
                                        'timeout'      : timeout_length });
}

// input handler for survey type
addInputHandler('ext_main_splash', function(selection){
    // redirect user based on their input menu selection
    if(selection === '1' || selection === '2'){
        state.vars.selection = selection;
        sayText(msgs('fp_enter_id'));
        promptDigits('fp_enter_id', {   'submitOnHash'     : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length 
                                        });
    }
    else if(selection === '3'){
        sayText(msgs('sedo_enter_id'));
        promptDigits('sedo_enter_id', {   'submitOnHash'    : false,
                                            'maxDigits'    : 6,
                                            'timeout'      : timeout_length 
                                        });
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('ext_main_splash', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for FP's village ID
addInputHandler('fp_enter_id', function(input){
    // verify village id
    input = input.replace(/\s/g,'');
    var check_vid = require('./lib/ext-vid-verify');
    if(check_vid(input)){
        // reinitization?
        // start survey
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('fp_enter_id', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_account_number,
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
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_id', {     'submitOnHash' : false, 
                                            'maxDigits'    : 6,
                                            'timeout'      : timeout_length});
        return null;
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
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length});
        return null;
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
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_gender', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_input,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's age
addInputHandler('sedo_enter_age', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_tenure_question', {}, lang));
        promptDigits('sedo_enter_tenure', {    'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_age', {   'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
        return null;
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
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_tenure', {   'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's number of trainings
addInputHandler('sedo_enter_trn', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_num_trained', {}, lang));
        promptDigits('sedo_enter_farmers', {    'submitOnHash' : false, 
                                            'maxDigits'    : 3,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_trn', {   'submitOnHash' : false, 
                                            'maxDigits'    : 2,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's number of farmers trained
addInputHandler('sedo_enter_farmers', function(input){
    input = input.replace(/\s/g,'');
    if(input){
        sayText(msgs('fp_num_groups', {}, lang));
        promptDigits('sedo_enter_groups', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_farmers', {   'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's number of groups
addInputHandler('sedo_enter_farmers', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // display survey start menu
        state.vars.question_number = 1; // initialize this tracker variable to 1
        state.vars.num_correct = 0; // initialize this counter of correct answers to 0
        state.vars.survey_start = true;
        sayText(msgs('survey_start', {}, lang));
        var menu = populate_menu('crop_ids', lang);
        sayText(menu, lang);
        promptDigits('survey_response', {    'submitOnHash' : false, 
                                                'maxDigits'    : max_digits_for_input,
                                                'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_groups', {   'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});


// input handler for the survey
addInputHandler('survey_response', function(input){
    if(state.vars.survey_start){
        var get_menu_option = require('./lib/get-menu-option');
        state.vars.crop = get_menu_option(input, 'crop_ids');
        var feedback = '';
        state.vars.survey_start = false;
    }
    else{
        input = input.replace(/\s/g,'');
        console.log('Entered else statement');
        var feedback = require('./lib/ext-answer-verify')(input);
        console.log('Checked answer and question number is ' + state.vars.question_number);
        if(state.vars.question_number > 10){
            // say closing message if all questions are complete
            sayText(msgs('closing_message', {'$FEEDBACK'    : feedback,
                                             '$NUM_CORRECT' : state.vars.num_correct}, lang));
            return null;
            // need to then end the call or redirect to main menu
        }
        console.log('Departed if statement');
    }
    state.vars.question_id = String(state.vars.crop + 'Q' + state.vars.question_number);

    // display the relevant message and prompt user to select a response
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = survey_table.queryRows({'vars' : {'questionid' : state.vars.question_id}}).next();
    sayText(msgs('survey_question',    {'$FEEDBACK' : feedback,
                                            '$TEXT' : question.vars.questiontext,
                                            '$OPT1' : '1) ' + question.vars.opt1, 
                                            '$OPT2' : '2) ' + question.vars.opt2,
                                            '$OPT3' : '3) ' + question.vars.opt3,
                                            '$OPT4' : '4) ' + question.vars.opt4}, lang));
    promptDigits('survey_response', {   'submitOnHash' : false, 
                                        'maxDigits'    : max_digits_for_input,
                                        'timeout'      : timeout_length});
});