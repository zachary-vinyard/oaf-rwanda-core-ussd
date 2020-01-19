/*
    Script: ext-vid-verify.js
    Description: returns true if the input village ID is in the table of village ids
    Status: complete
*/
module.exports = function(vid){
    // save number of demographic questions
    var demo_table = project.getOrCreateDataTable('demo_table');
    var demo_cursor = demo_table.queryRows({'vars' : {  'survey_type' : state.vars.survey_type}});
    var num_demo = demo_cursor.count()
    console.log('num questions is ' + num_demo);

    // load the rows of village table that match the input vid
    var village_table = project.getOrCreateDataTable("VillageInfo");
    var village_cursor = village_table.queryRows({vars: {'villageid' : vid}});
    village_cursor.limit(1); // replace with checks

    // return true if the input vid is in the village table
    if(village_cursor.hasNext()){
        var valid = true;
        state.vars.vid = vid;
        contact.vars.villageid = vid;
        contact.save();
        // check if village information has already been completed
        var village = village_cursor.next();
        if(village.vars.demo_complete){
            state.vars.step = num_demo + 1;
        }
        console.log('step is ' + state.vars.step);
    }
    else{
        var valid = false;
    }
    return valid;
}