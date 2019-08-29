/*
    Function: cor-serial-verify.js
    Purpose: check if the input serial number is valid; if valid, update table.
    Status: in progress
*/

module.exports = function(serial_no){
    var serial_table = project.getOrCreateDataTable("valid serial numbers");

    // save api cursor pointing to row from the serial table where the entered serial number matches
    var serial_pointer = serial_table.queryRows({
        vars: {'Serial Number': serial_no}
    });

    // options: if no matching row exists; if one matching row exists; if multiple matching rows exist
    // if one client row exists, return true and save payg code as a state variable
    if(serial_pointer.count() === 1){
        var serial_row = serial_pointer.next(); // save the row that has client's serial number
        serial_row.vars.registered_account_number = state.vars.accnum;
        serial_row.save();
        state.vars.payg_code = serial_row.vars.payg_code;
        return true;
    }
    else if(serial_pointer.count() === 0){
        state.vars.serial_status = true;
        return false;
    }
    else{
        state.vars.serial_status = false;
        admin_alert('duplicate rows in valid serial numbers for serial number: ' + accnum, 'Duplicate Serial Numbers in valid serial numbers', 'marisa');
        return false;
    }
}