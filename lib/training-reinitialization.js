/*
    Script: training-reinitization.js
    Description: if same service called by same user within 15 minutes, put them back at their last survey question
    Status: in progress
*/

module.exports = function(){
    // load relevant tables
    var session_table = project.getOrCreateDataTable('Training_survey');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
         vars        : {
                         'status' : {'ne' : 'complete'}},
        sort_dir    : 'desc'
    });
    // if previous session was called by same user within previous 15 minutes and quiz has started, run reinitization process
    if(session_cursor.hasNext() & !state.vars.test){
        var row = session_cursor.next();
        var diff = (Date.now()/1000 - row.time_updated) / 60;
        var status = row.vars.status;
        var question_type = status.slice(0,(status.length)-1);
        var question_number = parseInt(status.slice((status.length)-1,status.length));
        console.log("Question  id is :",row.vars.quiz_question);
        console.log("Question status is :",row);
        console.log("Question number is :",question_number);
        console.log("Question type is :",question_type);
        if(diff < 15 ){

            for(var i =1 ; i< question_number;i++){
                var question = question_type + i;
                console.log("difference is",diff);
                call.vars[question] =  row.vars[question];
                console.log("number",i);
            }
            
            console.log('reinitizing...');
            // copy data entries from previous session row into current session row
            // call.vars.trn1 = row.vars.trn1;
            // call.vars.trn2 = row.vars.trn2;
            // call.vars.trn3 = row.vars.trn3;
            // call.vars.trn4 = row.vars.trn4;
            // call.vars.trn5 = row.vars.trn5;
            // call.vars.trn6 = row.vars.trn6;
            // call.vars.trn7 = row.vars.trn7;
            // call.vars.trn8 = row.vars.trn8;
            call.vars.region = row.vars.region;
            call.vars.district = row.vars.district;
            call.vars.num_correct = parseInt(row.vars.num_correct);
            call.vars.number_of_questions = parseInt(row.vars.number_of_questions);
            state.vars.num_correct = parseInt(row.vars.num_correct);
            if(!state.vars.num_correct){
                state.vars.num_correct = 0;
            }
            call.vars.status = status;
            // mark previous session as reinitized
            row.vars.status = 'reinit';
            row.save();

           // update various tracker variables and ask the next question
            state.vars.survey_type = status.slice(0,(status.length)-1);
            state.vars.step =  parseInt(status.slice((status.length)-1,status.length)) +1;
            console.log("step is ", state.vars.step);
            console.log("type is ", state.vars.survey_type);
            var ask = require('./training-ask-question');
            ask();
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
}