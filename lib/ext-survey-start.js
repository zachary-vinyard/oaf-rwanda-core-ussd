/*
    Script: ext-survey-start.js
    Description: begins the survey. 
    Status: complete
*/

module.exports = function(){
    // load in modules 
    var populate_menu = require('./lib/populate-menu');
    
    // update session row status
    call.vars.Status = 'SurveyStart';

    // initialize counter variables
    state.vars.question_number = 1;
    state.vars.num_correct = 0;
    state.vars.survey_type = 'crop';

    // load the demographic question table
    var demo_table = project.getOrCreateDataTable('demo_table');
    var question = demo_table.queryRows({'vars' : {  'question_id' : state.vars.step,
                                                            'survey_type' : state.vars.survey_type}
                                        }).next();
    var max_digits = question.vars.max_digits;
    var timeout_length = 60;
                            
    // display crop survey menu
    sayText(msgs('survey_start', {}, lang));
    var menu = populate_menu('crop_menu', lang);
    sayText(menu, lang);
    promptDigits('crop_demo_question', {   'submitOnHash' : false, 
                                        'maxDigits'    : max_digits,
                                        'timeout'      : timeout_length});
}