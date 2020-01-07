/*
    Script: ext-vid-verify.js
    Description: check if the input village ID is valid.
    Status: mid-conversion
*/
module.exports = function(input){
// code queries the village table for village ID
var villageid = state.vars.villageid.replace(/\s/g,"");
call.vars.villageid = villageid;
var Villagetable = project.getOrCreateDataTable("VillageInfo");
VillageRowcursor = Villagetable.queryRows({
    vars: {'villageid' :villageid}
});
VillageRowcursor.limit(1);

// The second section of this checks whether this returned list is not empty and will set the return_value to "Valid" when the list is not empty  
if(VillageRowcursor.hasNext()){
    return_value = "Valid";
    contact.vars.villageid = villageid;
    contact.save();
}
else{
    return_value = "Not Valid";
}

// Reinitisation logic
// Retrieve table to see if this same service was called by the same user before (within 5 minutes)
var SessionTable = project.getOrCreateDataTable("USSD Menu AMA and GUS");
console.log("Phonenumber current contact:");
console.log(contact.phone_number);
var PN = contact.phone_number;
SessionCursor = SessionTable.queryRows({
    from_number: PN,
    vars: {'villageid':villageid,
            'PN': PN,
            'VilValid':"Valid",
            'completed':"No"},
    sort_dir: "desc"
});
SessionCursor.limit(1);

// add comment here
while (SessionCursor.hasNext()) {
    var row = SessionCursor.next();
    console.log("Phonenumber session found:");
    console.log(row.from_number);
    // Calculate the difference in minutes
    var Diff =(state.time_updated-row.time_updated) / 60;
    console.log('Reint session found');
    console.log('Min diff is: '+Diff);
    console.log('row.time_updated: '+ row.time_updated);
    console.log('state.time_updated: '+ state.time_updated); 
    // add comment here
    if (Diff<15){
        $ReInit = 1;
        $Status = row.vars.Status;
        console.log('Reint session <15min');
        console.log('Status reint: '+$Status);
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
        call.vars.Status = row.vars.Status;
        row.vars.completed = "Reint";
        row.save();
    }
    else{
        $ReInit = 0;
    }
}

// Retrieve question table and set question states
var table = project.getOrCreateDataTable("SurveyQuestions");
cursor = table.queryRows({
    vars: {'cropid':call.vars.SurveyStart,
        'questionnum':call.vars.Status}
});
cursor.limit(1);
var row = cursor.next();
// add comment 
state.vars.questiontext = row.vars.questiontext;
state.vars.numoptions = row.vars.numoptions;
state.vars.opt1 = row.vars.opt1;
state.vars.opt2 = row.vars.opt2;
state.vars.opt3 = row.vars.opt3;    
state.vars.opt4 = row.vars.opt4;
state.vars.correctopt = row.vars.correctopt;
}