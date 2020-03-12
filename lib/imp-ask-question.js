/*
    Script: impt-ask-question.js
    Description: displays survey question and prompts user to select a response
    Status: in progress
*/

module.exports = function(feedback){
    // feedback defaults to blank if not provided (e.g. for first survey question)
    feedback = feedback || '';

    // load modules and variables, and save the current question row
    var msgs = require('./msg-retrieve');
    const lang = project.vars.cor_lang;
    var survey_table = project.getOrCreateDataTable('ag_survey_questions');
    console.log(state.vars.survey_type + state.vars.step);
    var question = survey_table.queryRows({'vars' : {'question_id' : state.vars.survey_type + state.vars.step}}).next();

    // accounting for survey questions with fewer options
    var num_opts = question.vars.num_options;
    var opt3 = '';
    var opt4 = '';
    var opt5 = '';
    if(num_opts > 2){
        opt3 = '3) ' + question.vars.opt3;
        if(num_opts > 3){
            opt4 = '4) ' + question.vars.opt4;
            if(num_opts > 4){
                opt5 = '5) ' + question.vars.opt5;
            }
        }
    }
    // display text and prompt user to select their choice
    sayText(msgs('quiz_response',    {'$FEEDBACK' : feedback,
                                            '$TEXT' : question.vars.question_text,
                                            '$OPT1' : '1) ' + question.vars.opt1, 
                                            '$OPT2' : '2) ' + question.vars.opt2,
                                            '$OPT3' : opt3,
                                            '$OPT4' : opt4,
                                            '$OPT5' : opt5}, lang));
    promptDigits('quiz_question', {   'submitOnHash' : false, 
                                        'maxDigits'    : project.vars.max_digits_for_input,
                                        'timeout'      : project.vars.timeout_length});
    return true;
}