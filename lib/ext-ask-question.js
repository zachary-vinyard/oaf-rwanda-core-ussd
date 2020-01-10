/*
    Script: ext-ask-question.js
    Description: displays survey question and prompts user to select a response
    Status: complete
*/

module.exports = function(feedback = ''){
    // display the relevant message and prompt user to select a response
    var msgs = require('./msg-retrieve');
    const lang = project.vars.cor_lang;
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
                                        'maxDigits'    : project.vars.max_digits_for_input,
                                        'timeout'      : project.vars.timeout_length});
}