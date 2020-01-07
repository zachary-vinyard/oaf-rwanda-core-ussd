/*
    Script: ext-ask-question.js
    Description: ??
    Status: mid-conversion
*/

module.exports = function(question_id){
    // find the number of options for the given crop
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = parseInt(survey_table.queryRows({'vars' : {'question_id' : question_id}}));
    var num_opts = question.vars.numoptions;

    // populate the question depending on num_opts
    if(num_opts == 3){
        // populate question
    }
    else if(num_opts == 4){
        // populate question
    }
    else{
        // populate question
    }
}