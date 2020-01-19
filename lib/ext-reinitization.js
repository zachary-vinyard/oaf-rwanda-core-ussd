/*
    Script: ext-reinitization.js
    Description: if same service called by same user within 15 minutes, put them back at their last survey question
    Status: in progress
*/

module.exports = function(){
    console.log('entered reinit function and pn is ' + contact.phone_number + ', vid is ' + state.vars.vid);
    // load relevant tables
    var session_table = project.getOrCreateDataTable('Extension Survey Testing');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
        vars        : { 'villageid' : state.vars.vid,
                        'completed' : {exists : 0},
                        'status' : {exists : 1}},
        sort_dir    : 'desc'
    });
    // if previous session was called by same user within previous 15 minutes, run reinitization process
    if(session_cursor.hasNext()){
        console.log('session cursor has found a row that meets reinit criteria');
        var row = session_cursor.next();
        var diff = (state.time_updated - row.time_updated) / 60;
        var status = row.vars.status;
        console.log('diff is ' + diff);
        if(diff < 15){
            console.log('reinit process starting');
            // copy data entries from previous session row into current session row
            call.vars.fp_age = row.vars.fp_age || row.vars.fp_age_tra;
            call.vars.fp_gender = row.vars.fp_gender || row.vars.fp_gender_tra;
            call.vars.fp_tenure = row.vars.fp_tenure || row.vars.fp_tenure_tra;
            call.vars.fp_trained = row.vars.fp_trained;
            call.vars.crop = row.vars.crop;
            call.vars.num_farmers = row.vars.num_farmers;
            call.vars.num_females = row.vars.num_females;
            call.vars.num_females_crop = row.vars.num_females_crop;
            call.vars.num_groups = row.vars.num_groups;
            call.vars.num_males = row.vars.num_males;
            call.vars.num_males_crop = row.vars.num_males_crop;
            call.vars.num_plots = row.vars.num_plots;
            call.vars.surveyid = row.vars.surveyid;
            call.vars.villageid = row.vars.villageid;
            call.vars.Q1 = row.vars.Q1;
            call.vars.Q2 = row.vars.Q2;
            call.vars.Q3 = row.vars.Q3;
            call.vars.Q4 = row.vars.Q4;
            call.vars.Q5 = row.vars.Q5;
            call.vars.Q6 = row.vars.Q6;
            call.vars.Q7 = row.vars.Q7;
            call.vars.Q8 = row.vars.Q8;
            call.vars.Q9 = row.vars.Q9;
            call.vars.Q10 = row.vars.Q10; 
            call.vars.numcorrect = row.vars.numcorrect;
            state.vars.numcorrect = row.vars.numcorrect;
            state.vars.crop = call.vars.crop;
            call.vars.status = status;
            // mark previous session as reinitized
            row.vars.completed = 'reinit';
            row.save();

            // find where we are
            if(call.vars.Q1){
                console.log('reinit on crop');
                // update various tracker variables and ask the current question
                state.vars.question_id = state.vars.crop + status;
                state.vars.question_number = parseInt(status.replace(/\s/g,''));
                var ask = require('./ext-ask-question');
                ask();
            }
            else if(call.vars.crop_demo_question || call.vars.demo_question){
                var msgs = require('./msg-retrieve');
                const timeout_length = project.vars.timeout_length;
                // update various tracker variables and ask the current question
                if(call.vars.crop_demo_question){
                    var prompt_name = 'crop_demo_question';
                    console.log('reinit on crop demo');
                }
                else{
                    var prompt_name = 'demo_question';
                    console.log('reinit on demo');
                }
                state.vars.survey_type = status.replace(/[^a-z_]/ig,'');
                state.vars.step = parseInt(status.replace(/\s/g,''));
                // retrieve the relevant crop demo question
                var demo_table = project.getOrCreateDataTable('demo_table');
                var prev_question = demo_table.queryRows({'vars' : {'question_id' : status}}).next();
                sayText(msgs(prev_question.vars.msg_name, {}, lang));
                promptDigits(prompt_name, {     'submitOnHash' : false, 
                                                    'maxDigits'    : prev_question.vars.max_digits,
                                                    'timeout'      : timeout_length});
            }
            else{
                return null;
            }
        }
        else{
            return null;
        }
    }
    else{
        return null;
    }
}