/*
    Script: training-reinitization.js
    Description: if same service called by same user within 15 minutes, put them back at their last survey question
    Status: in progress
*/

module.exports = function(){
    // load relevant tables
    var session_table = project.getOrCreateDataTable('Training_survey');
    var number = contact.phone_number;
    console.log('phone number is: '+ number);
    var session_cursor = session_table.queryRows({
        from_number : number,
         vars        : {
                         'status' : {'not_prefix' : 'complete'},
                         'phone_nbr': number}, // To allow any not complete to be reinitialized(even one that was initialized but not finished)
        sort_dir    : 'desc'
    });
    // if previous session was called by same user within previous 15 minutes and quiz has started, run reinitization process
    if(session_cursor.hasNext() && !state.vars.test){
        var row = session_cursor.next();
        console.log('-------------status',row.vars.status);
        var diff = (Date.now()/1000 - row.time_updated) / 60;
        var status = row.vars.status;
        var question_type = status.slice(0,(status.length)-1);
        var question_number = parseInt(status.slice((status.length)-1,status.length));
        if(diff < 15 ){

            for(var i =1 ; i<= question_number;i++){
                var question = 'opt' + String(i);
                call.vars[question] =  row.vars[question];
            }
            
            call.vars.region = row.vars.region;
            call.vars.district = row.vars.district;
            call.vars.sector = row.vars.sector;
            call.vars.site = row.vars.site;
            call.vars.num_correct = parseInt(row.vars.num_correct);
            call.vars.number_of_questions = parseInt(row.vars.number_of_questions);
            call.vars.survey_code = row.vars.survey_code;
            call.vars.phone_nbr = row.vars.phone_nbr;
            state.vars.num_correct = parseInt(row.vars.num_correct);
            if(!state.vars.num_correct){
                state.vars.num_correct = 0;
            }
            call.vars.status = status;
            // mark previous session as reinitized
            row.vars.status = 'complete_reinit';
            row.save();

           // update various tracker variables and ask the next question
            state.vars.survey_type = status.slice(0,(status.length)-1);
            state.vars.step =  parseInt(status.slice((status.length)-1,status.length)) +1;
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