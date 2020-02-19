/*
    Function: pin-verify.js
    Purpose: returns true if a user's input PIN is correct
    Status: complete
*/

module.exports = function(pin, account_number){
    // load the user's recorded PIN
    var pin_table = project.getOrCreateDataTable(project.vars.pin_table);
    var pin_cursor = pin_table.queryRows({vars: {'account_number': account_number}});
    if(pin_cursor.hasNext() & pin_cursor.next().vars.pin){
        var stored_pin = pin_cursor.next().vars.pin;
    }
    else{
        state.vars.no_pin = true;
        return false;
    }

    /* DECRYPT PIN STEP HERE */

    // if input pin matches stored PIN, return true; else false
    if(pin === stored_pin){
        return true;
    }
    else{
        return false;
    }
}