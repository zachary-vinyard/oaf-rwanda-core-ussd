/*
    Script: ext-sedo-verify.js
    Description: check if the input sedo ID is valid.
    Status: mid-conversion
*/

// The first section of this code will query the contact database by using the incoming message content to search for SEDOID
var Villagetable = project.getOrCreateDataTable("VillageInfo");

// add comment
VillageRowcursor = Villagetable.queryRows({
    vars: {'sedo_id' : state.vars.sedoid.replace(/\s/g,"")
}
});
VillageRowcursor.limit(1);

// add comment
if (VillageRowcursor.hasNext()){
    return_value = "Valid"
}
else{
    return_value = "Not Valid"
}
