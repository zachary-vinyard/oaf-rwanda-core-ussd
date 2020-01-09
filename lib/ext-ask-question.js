/*
    Script: ext-ask-question.js
    Description: displays a survey question
    Status: mid-conversion
*/

module.exports = function(question_id){
    var msgs = require('./msg-retrieve');
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    console.log('Question ID is ' + question_id);
    var question = survey_table.queryRows({'vars' : {'questionid' : question_id}}).next();

    // populate the multiple choice responses depending on num_opts
    //var msg_string = 'survey_question_opt' + String(num_opts);
    var msg_string = 'survey_question_opt4';

    // display the relevant message and prompt user to select a response
    sayText(msgs(msg_string,    {   '$OPT1' : question.vars.opt1, 
                                    '$OPT2' : question.vars.opt2,
                                    '$OPT3' : question.vars.opt3,
                                    '$OPT4' : question.vars.opt4
                                }, lang));

}