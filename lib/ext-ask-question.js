/*
    Script: ext-ask-question.js
    Description: displays a survey question
    Status: mid-conversion
*/

module.exports = function(question_id){
    var msgs = require('./msg-retrieve');
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = parseInt(survey_table.queryRows({'vars' : {'question_id' : question_id}}));
    var num_opts = question.vars.numoptions;

    // assign the question depending on num_opts
    var msg_string = 'survey_question_opt' + String(num_opts);

    // assign values to the survey question options
    var index = 1;
    while(index < num_opts){
        // pull option from table and assign as a variable with meandering name
        index = index + 1;
    }
    
    // display the relevant message
    sayText(msgs(msg_string, {}, lang));
}