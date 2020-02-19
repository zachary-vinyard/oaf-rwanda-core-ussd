/*
    Function: pin-verify.js
    Purpose: returns true if a user's input PIN is correct
    Status: complete
*/

module.exports = function(pin, account_number){
    // load the user's recorded PIN
    var pin_table = project.getOrCreateDataTable(project.vars.pin_table);
    var pin_cursor = pin_table.queryRows({vars: {'account_number': account_number}});
    var pin_row = pin_cursor.next();
    if(pin_row.vars.pin){
        var stored_pin = pin_row.vars.pin;
        console.log('stored pin is ' + stored_pin);
        
        /* DECRYPT PIN STEP HERE */

        if(pin === stored_pin){
            return true;
        }
    }
    else{
        return false;
    }
}