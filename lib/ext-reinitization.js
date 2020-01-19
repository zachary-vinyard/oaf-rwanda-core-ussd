/*
    Script: ext-reinitization.js
    Description: if same service called by same user within 15 minutes, put them back at their last survey question
    Status: in progress
*/

module.exports = function(){
    // load relevant tables
    var session_table = project.getOrCreateDataTable('USSD Menu AMA and GUS');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
        vars        : { 'villageid' : state.vars.vid,
                        'VilValid'  : 'Valid',
                        'completed' : 'No'},
        sort_dir    : 'desc'
    });
    // if previous session was called by same user within previous 15 minutes, run reinitization process
    if(session_cursor.hasNext()){
        var row = session_cursor.next();
        var diff = (state.time_updated - row.time_updated) / 60;
        var status = row.vars.Status;
        if(diff < 15 & status){
            var reinit = true;
            // copy data entries from previous session row into current session row
            call.vars.Age=row.vars.Age;
            call.vars.AgeGUS=row.vars.AgeGUS;
            call.vars.CheckList=row.vars.CheckList;
            call.vars.DemoPlotAmount=row.vars.DemoPlotAmount;
            call.vars.DemoPlotSize=row.vars.DemoPlotSize;
            call.vars.FarmersTrained=row.vars.FarmersTrained;
            call.vars.Gender=row.vars.Gender;
            call.vars.GenderGUS=row.vars.GenderGUS;
            call.vars.NumberOfGroup=row.vars.NumberOfGroups;
            call.vars.PreviousTraining=row.vars.PreviousTraining;
            call.vars.SurveyStart=row.vars.SurveyStart;
            call.vars.Tenure=row.vars.Tenure;
            call.vars.VillageIDGUS=row.vars.VillageIDGUS;
            call.vars.Years=row.vars.Years;
            call.vars.surveyid=row.vars.surveyid;
            call.vars.villageid=row.vars.villageid;
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
            state.vars.numcorrect= row.vars.numcorrect;
            call.vars.Status = status;
            // mark previous session as reinitized
            row.vars.completed = "Reint";
            row.save();
    
            // find and save the question id if the survey has started
            if(call.vars.SurveyStart){
                var crop_table = project.getOrCreateDataTable('crop_menu');
                var cursor = crop_table.queryRows({vars: {'option_number' : call.vars.SurveyStart}});
                var crop = cursor.next().vars.option_name;
                state.vars.question_id = String(crop + status)
            }
            else{
                // if status contains something, return that
            }
        }
        else{
            var reinit = false;
        }
    }
    else{
        var reinit = false;
    }
    return reinit;
}