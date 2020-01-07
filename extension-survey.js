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

// set various constants -- make sure to port over project variables
const lang = project.vars.cor_lang;

// display welcome message and prompt user to choose their survey (AMA1, AMA2, GUS)
global.main = function(){
    sayText(msgs('ext_main_splash')); // add in TR
    promptDigits('ext_main_splash', {   'submitOnHash' : false,
                                        'maxDigits'    : max_digits_for_account_number,
                                        'timeout'      : timeout_length });
}

// input handler for survey type
addInputHandler('ext_main_splash', function(input){
    // clean input and account for errors
    selection = String(input.replace(/\D/g,''));
    // redirect user based on their input menu selection
    if(selection === 1 || selection === 2){
        state.vars.selection = selection;
        sayText(msgs('fp_enter_id'));
        promptDigits('fp_enter_id', {   'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length 
                                        });
    }
    else if(selection === 3){
        // add code for AMA2
        sayText(msgs('sedo_enter_id'));
        promptDigits('sedo_enter_id', {   'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : timeout_length 
                                        });
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('ext_main_splash', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for FP's village ID
addInputHandler('fp_enter_id', function(input){
    // verify village id
    var check_vid = require('./lib/ext-vid-verify');
    if(check_vid){
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
    // check SEDO ID
    var check_sedo = require('./lib/ext-sedo-verify');
    if(check_sedo){
        // request for user to enter village ID
        sayText(msgs('sedo_enter_vid', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_id', {     'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's village ID
addInputHandler('sedo_enter_vid', function(input){
    var check_vid = require('./lib/ext-vid-verify'); // make sure this returns a boolean
    if(check_vid){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_gender', {}, lang));
        promptDigits('sedo_enter_gender', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_vid', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's gender
addInputHandler('sedo_enter_gender', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_age', {}, lang));
        promptDigits('sedo_enter_age', {'submitOnHash' : false, 
                                        'maxDigits'    : max_digits,
                                        'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_gender', { 'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's age
addInputHandler('sedo_enter_age', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_tenure', {}, lang));
        promptDigits('sedo_enter_tenure', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_age', {   'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's tenure
addInputHandler('sedo_enter_tenure', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_trn', {}, lang));
        promptDigits('sedo_enter_trn', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_tenure', {   'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's number of trainings
addInputHandler('sedo_enter_trn', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_farmers', {}, lang));
        promptDigits('sedo_enter_farmers', {    'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('sedo_enter_trn', {   'submitOnHash' : false, 
                                            'maxDigits'    : max_digits,
                                            'timeout'      : timeout_length});
        return null;
    }
});

// input handler for SEDO's number of farmers trained
addInputHandler('sedo_enter_farmers', function(input){
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_enter_groups', {}, lang));
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
        // save in table
        // ask next question
        sayText(msgs('sedo_survey_start', {}, lang));
        promptDigits('sedo_survey_start', {    'submitOnHash' : false, 
                                                'maxDigits'    : max_digits,
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


// input handler for start of survey
addInputHandler('sedo_survey_start', function(input){
    // clean input data
    input = input.replace(/\s/g,'');
    if(input){
        // save in table
        // ask next question
        sayText(msgs('sedo_survey_start', {}, lang));
        promptDigits('sedo_survey_start', {    'submitOnHash' : false, 
                                                'maxDigits'    : max_digits,
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