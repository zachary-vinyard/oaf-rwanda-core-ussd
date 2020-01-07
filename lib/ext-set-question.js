/*
    Script: ext-set-question.js
    Description: ??
    Status: mid-conversion
*/

module.exports = function(question_id){
    // retrieve question table and set question states
    var table = project.getOrCreateDataTable("SurveyQuestions");
    cursor = table.queryRows({
        vars: { 'cropid': call.vars.SurveyStart,
                'questionnum': call.vars.Status
            }
    });
    cursor.limit(1);

    // save the elements of the current row in the question table
    var row = cursor.next();
    state.vars.questiontext = row.vars.questiontext;
    state.vars.numoptions = row.vars.numoptions;
    state.vars.opt1 = row.vars.opt1;
    state.vars.opt2 = row.vars.opt2;
    state.vars.opt3 = row.vars.opt3;    
    state.vars.opt4 = row.vars.opt4;
    state.vars.correctopt = row.vars.correctopt;
}
