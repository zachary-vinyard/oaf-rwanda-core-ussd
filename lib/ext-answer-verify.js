/*
    Script: ext-answer-verify.js
    Description: check if survey response is valid
    Status: mid-conversion
*/

module.exports = function(response){
    var survey_table = project.getOrCreateDataTable('SurveyQuestions');
    var question = survey_table.queryRows({'vars' : {'questionid' : state.vars.question_id}}).next();
    var correct_number = question.vars.correctopt;
    var correct_answer = question.vars.String('Opt' + correct_number);

    // provide feedback if the response is correct or not
    if(response === correct_opt){
        var feedback = 'Ni byiza';
        state.vars.question_number = state.vars.question_number + 1;
    } 
    else if(response < 5){
        var feedback = 'Si byo, ' + correct_answer + ' nicyo gisubizo';
    }
    else{
        var feedback = correct_answer + ' nicyo gisbizo';
    }
    return feedback;
}