/*
    Script: imp-reinitization.js
    Description: if same service called by same user within 15 minutes, put them back at their last survey question
    Status: in progress
*/

module.exports = function(){
    // load relevant tables
    var session_table = project.getOrCreateDataTable('Impact Testing');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
        vars        : { 'trn8' : {exists : 0}, // bad!! meant to signify if survey is complete
                        'status' : {exists : 1}},
        sort_dir    : 'desc'
    });
    // if previous session was called by same user within previous 15 minutes and quiz has started, run reinitization process
    if(session_cursor.hasNext()){
        var row = session_cursor.next();
        var diff = (state.time_updated - row.time_updated) / 60;
        console.log('state.time_updated: ' + state.time_updated + ' row.time_updated: ' + row.time_updated);
        var status = row.vars.status;
        if(diff < 15 & row.vars.trn1){
            console.log('reinitizing...');
            // copy data entries from previous session row into current session row
            call.vars.trn1 = row.vars.trn1;
            call.vars.trn2 = row.vars.trn2;
            call.vars.trn3 = row.vars.trn3;
            call.vars.trn4 = row.vars.trn4;
            call.vars.trn5 = row.vars.trn5;
            call.vars.trn6 = row.vars.trn6;
            call.vars.trn7 = row.vars.trn7;
            call.vars.trn8 = row.vars.trn8;
            call.vars.province = row.vars.province;
            call.vars.district = row.vars.district;
            call.vars.num_correct = parseInt(row.vars.num_correct);
            state.vars.num_correct = parseInt(row.vars.num_correct);
            if(!state.vars.num_correct){
                state.vars.num_correct = 0;
            }
            call.vars.status = status;
            // mark previous session as reinitized
            row.vars.status = 'reinit';
            row.save();

            // update various tracker variables and ask the next question
            state.vars.survey_type = status.slice(0, 3);
            state.vars.step = parseInt(status.slice(3, 4)) + 1;
            var ask = require('./imp-ask-question');
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