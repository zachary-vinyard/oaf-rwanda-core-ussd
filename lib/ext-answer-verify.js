/*
    Script: ext-answer-verify.js
    Description: check if survey response is valid
    Status: mid-conversion
*/

module.exports = function(question_id, response){
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = parseInt(survey_table.queryRows({'vars' : {'question_id' : question_id}}));
    var correct_opt = question.vars.correctoption;
    // provide feedback if the response is correct or not
    if(response === correct_opt){
        var feedback = 'Ni byiza';
    } 
    else if(response < 5){
        var feedback = 'Si byo, ' + correct_opt + ' nicyo gisubizo';
    }
    else{
        var feedback = correct_opt + ' nicyo gisbizo';
    }
    return feedback;
}