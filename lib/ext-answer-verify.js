/*
    Script: ext-answer-verify.js
    Description: check if survey response is valid
    Status: mid-conversion
*/

module.exports = function(response){
    var answer_table = project.getOrCreateDataTable('survey_answers');
    var answer_row = answer_table.queryRows({'vars' : {'question_id' : state.vars.question_id}}).next()
    var correct_answer = answer_row.vars.correct_answer;
    var correct_opt = answer_row.vars.correct_number;

    // provide feedback if the response is correct or not
    if(response === correct_opt){
        var feedback = 'Ni byiza';
        state.vars.num_correct = state.vars.num_correct + 1;
    } 
    else if(response < 5){
        var feedback = 'Si byo, ' + correct_answer + ' nicyo gisubizo';
    }
    else{
        var feedback = correct_answer + ' nicyo gisbizo';
    }
    state.vars.question_number = state.vars.question_number + 1;
    return feedback;
}