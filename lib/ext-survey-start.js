/*
    Script: ext-survey-start.js
    Description: begins the survey. 
    Status: complete
*/

module.exports = function(){
    // load in modules and set constants
    var populate_menu = require('./populate-menu');
    var msgs = require('./msg-retrieve');
    const timeout_length = project.vars.timeout_length;
    const lang = project.vars.cor_lang;

    // update session row status
    call.vars.Status = 'SurveyStart';

    // initialize counter variables
    state.vars.question_number = 1;
    state.vars.num_correct = 0;
    state.vars.survey_type = 'crop';

    // load the demographic question table
    console.log('step is ' + state.vars.step);
    var demo_table = project.getOrCreateDataTable('demo_table');
    var question = demo_table.queryRows({'vars' : {  'question_id' : state.vars.survey_type + state.vars.step}}).next();
    var max_digits = question.vars.max_digits;
                            
    // display crop survey menu
    sayText(msgs('survey_start', {}, lang));
    var menu = populate_menu('crop_menu', lang);
    sayText(menu, lang);
    promptDigits('crop_demo_question', {   'submitOnHash' : false, 
                                        'maxDigits'    : max_digits,
                                        'timeout'      : timeout_length});
}