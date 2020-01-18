/*
    Script: ext-vid-verify.js
    Description: returns true if the input village ID is in the table of village ids
    Status: complete
*/
module.exports = function(vid){
    // save number of demographic questions (not great)
    var num_demo = 8;

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
    }
    else{
        var valid = false;
    }
    return valid;
}