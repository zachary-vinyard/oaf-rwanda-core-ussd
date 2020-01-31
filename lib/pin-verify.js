/*
    Function: pin-verify.js
    Purpose: returns true if a user's input PIN is correct
    Status: in progress
*/

module.exports = function(pin, account_number){
    // load the user's recorded PIN
    var pin_table = getOrCreateDataTable(project.vars.pin_table);
    var pin_cursor = pin_table.queryRows({vars: {'account_number': account_number}});
    var stored_pin = pin_cursor.next().vars.pin;

    /* DECRYPT PIN STEP HERE */

    // if input pin matches stored PIN, return true; else false
    if(pin === stored_pin){
        return true;
    }
    else{
        return false;
    }
}