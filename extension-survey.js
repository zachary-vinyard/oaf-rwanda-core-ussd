/*
    Script: extension-survey.js
    Description: RW program extension survey for FPs and SEDOs
    Status: in progress
*/

// load in necessary functions
var msgs = require('./lib/msg-retrieve');
var admin_alert = require('./lib/admin-alert');
var populate_menu = require('./lib/populate-menu');
var get_menu_option = require('./lib/get-menu-option');

// load in extension-specific modules
var reinitization = require('./lib/ext-reinitization');
var ask = require('./lib/ext-ask-question');
var check_vid = require('./lib/ext-vid-verify');
var check_sedo = require('./lib/ext-sedo-verify');
var start_survey = require('./lib/ext-survey-start');

// set various constants -- add to list of project variables
const lang = project.vars.cor_lang;
const max_digits_for_input = project.vars.max_digits_for_input;
const max_digits_for_vid = project.vars.max_digits_for_vid;
const max_digits_for_sedo_id = project.vars.max_digits_for_sedo_id;
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
    state.vars.survey_type = 'tra';
    state.vars.step = 1;
    if(check_vid(input)){
        // return user to previous step if they are coming back to the survey
        if(reinitization() & state.vars.question_id){
            ask();
        }
        else{
            // initialize counter variables
            state.vars.num_correct = 0;
            // begin the survey, starting with crop demo questions
            if(state.vars.step > 1){
                start_survey();
            }
            else{
                sayText(msgs('fp_gender_tra', {}, lang));
                promptDigits('demo_question', {     'submitOnHash' : false, 
                                                    'maxDigits'    : max_digits_for_input,
                                                    'timeout'      : timeout_length});
            }
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
    // initialize tracker variables
    state.vars.step = 1;
    state.vars.survey_type = 'mon';
    if(check_vid(input)){
        // display text and prompt user to select their choice
        if(state.vars.step > 1){
            start_survey();
        }
        else{
            sayText(msgs('fp_gender', {}, lang));
            promptDigits('demo_question', {     'submitOnHash' : false, 
                                                'maxDigits'    : max_digits_for_input,
                                                'timeout'      : timeout_length});
        }
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits_for_vid,
                                            'timeout'      : timeout_length});
    }
});

// input handler for demographic questions
addInputHandler('demo_question', function(input){
    input = input.replace(/\s/g,'');
    if(input){
        var demo_table = project.getOrCreateDataTable('demo_table');
        // save input in session data
        var prev_question = demo_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}}).next();
        call.vars[prev_question.vars.msg_name] = input;
        // if there are still questions remaining, ask the next question; otherwise start the crop quiz
        state.vars.step = state.vars.step + 1;
        console.log('step is ' + state.vars.step + ', question id is ' + state.vars.survey_type + state.vars.step);
        var question_cursor = demo_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}});
        if(question_cursor.hasNext()){
            var question = question_cursor.next();
            // display text and prompt user to select their choice
            sayText(msgs(question.vars.msg_name, {}, lang));
            promptDigits('demo_question', {     'submitOnHash' : false, 
                                                'maxDigits'    : question.vars.max_digits,
                                                'timeout'      : timeout_length});
        }
        else{
            // load village table and mark as completed
            var village_table = project.getOrCreateDataTable("VillageInfo");
            var village = village_table.queryRows({vars: {'villageid' : state.vars.vid}}).next();
            if(state.vars.survey_type === 'mon'){
                village.vars.demo_complete = true;
                village.save();
            }
            // begin the crop survey
            start_survey();
        }
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
    }
});

// input handler for crop demographic questions
addInputHandler('crop_demo_question', function(input){
    input = input.replace(/\s/g,'');
    if(input){
        // if entering for the first time, save the crop
        if(state.vars.step === 0){
            state.vars.crop = get_menu_option(input, 'crop_menu');
            call.vars['crop'] = state.vars.crop;
        }
        else{
            // save input in session data
            var demo_table = project.getOrCreateDataTable('demo_table');
            var question_cursor = demo_table.queryRows({'vars' : {  'question_id' : state.vars.survey_type + state.vars.step}})
            var prev_question = question_cursor.next();
            call.vars[prev_question.vars.msg_name] = input;
        }
        // if there are questions remaining, ask the next question; otherwise start the survey
        if(question_cursor.hasNext()){
            var question = question_cursor.next();
            state.vars.step = state.vars.step + 1;
            sayText(msgs(question.vars.msg_name, {}, lang));
            promptDigits('crop_demo_question', {'submitOnHash' : false, 
                                                'maxDigits'    : question.vars.max_digits,
                                                'timeout'      : timeout_length});
        }
        else{
            // set question id in correct format, then increment the question number
            state.vars.question_id = String(state.vars.crop + 'Q' + state.vars.question_number);
            call.vars.Status = String('Q' + state.vars.question_number);
            state.vars.question_number = state.vars.question_number + 1;
            // ask the survey question
            ask();
        }
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
    }
}); 

// input handler for survey questions
addInputHandler('survey_response', function(input){
    input = input.replace(/\s/g,'');
    // save input in session data
    if(state.vars.question_number === 1){
        var demo_table = project.getOrCreateDataTable('demo_table');
        var prev_question = demo_table.queryRows({'vars' : {  'question_id' : state.vars.survey_type + state.vars.step}}).next();
        call.vars[prev_question.vars.msg_name] = input;
    }
    // say closing message and end survey if all questions are complete
    var feedback = require('./lib/ext-answer-verify')(input);
    var survey_length = 10; // abstract
    if(state.vars.question_number > survey_length){
        sayText(msgs('closing_message', {   '$FEEDBACK'    : feedback,
                                            '$NUM_CORRECT' : state.vars.num_correct}, lang));
        return null;
    }
    // set question id in correct format, then increment the question number
    state.vars.question_id = String(state.vars.crop + 'Q' + state.vars.question_number);
    call.vars.Status = String('Q' + state.vars.question_number);
    state.vars.question_number = state.vars.question_number + 1;
    // ask the survey question
    ask(feedback);
}); 