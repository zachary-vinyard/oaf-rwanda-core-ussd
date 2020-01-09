/*
    Script: ext-ask-question.js
    Description: displays a survey question
    Status: mid-conversion
*/

module.exports = function(){
    // might as well put back in extension survey then :/
    const lang = project.vars.cor_lang;
    const max_digits = 1;
    const timeout_length = 60;
    var msgs = require('./msg-retrieve');
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = survey_table.queryRows({'vars' : {'questionid' : state.vars.question_id}}).next();

    // populate the multiple choice responses depending on num_opts
    var msg_string = 'survey_question_opt';

    // display the relevant message and prompt user to select a response
    sayText(msgs(msg_string,    {   '$TEXT' : question.vars.questiontext,
                                    '$OPT1' : question.vars.opt1, 
                                    '$OPT2' : question.vars.opt2,
                                    '$OPT3' : question.vars.opt3,
                                    '$OPT4' : question.vars.opt4}, lang));
    promptDigits('survey_response', {   'submitOnHash' : false, 
                                        'maxDigits'    : max_digits,
                                        'timeout'      : timeout_length});

}