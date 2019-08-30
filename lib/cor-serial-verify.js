/*
    Function: cor-serial-verify.js
    Purpose: check if the input serial number is valid; if valid, update table and store the PAYG code.
    Status: in progress
*/

module.exports = function(serial_no){
    // load in relevant modules and tables
    var admin_alert = require('./admin-alert');
    var serial_table = project.getOrCreateDataTable('valid_serial_numbers_TEST');

    // save API cursor pointing to row from the serial table where the entered serial number matches
    var serial_pointer = serial_table.queryRows({
        vars: {'serial_number' : serial_no, 'registered_account_number[exists]' : false}
    });

    // if one client row exists, return true and save payg code as a state variable
    if(serial_pointer.count() === 1){
        var serial_row = serial_pointer.next(); // save the row that has client's serial number
        serial_row.vars.registered_account_number = state.vars.account_number;
        serial_row.save();
        state.vars.payg_code = serial_row.vars.payg_code;
        return true;
    }
    // if no rows match the input serial number, return false
    else if(serial_pointer.count() === 0){
        state.vars.serial_status = true;
        return false;
    }
    else{
    // if multiple serial numbers match the input, return false and alert Marisa
        state.vars.serial_status = false;
        admin_alert('duplicate rows in valid serial numbers for serial number: ' + accnum, 'Duplicate Serial Numbers in valid serial numbers', 'marisa');
        return false;
    }
}