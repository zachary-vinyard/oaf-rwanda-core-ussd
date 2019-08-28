/*
    Function: serial-verify.js
    Purpose: checks if the input account # has a registered serial number.
    Status: in progress
*/

module.exports = function(accnum){
    // load in relevant modules and data tables
    var admin_alert = require('./lib/admin-alert');
    var serial_table = project.getOrCreateDataTable("valid serial numbers");

    // save api cursor pointing to row from the serial table where the entered serial number matches
    var client_pointer = serial_table.queryRows({
        vars: {'Registered account number': accnum}
    });

    // options: if no client row exists; if one client row exists; if multiple client rows exist
    // if one client row exists, return true and save payg code as a state var (or just return the payg code, and null if not there?)
    if(client_pointer.count() === 1){
        var client_row = client_pointer.next(); // save the row that has client's account number
        state.vars.payg_code = client_row.vars.payg_code;
        return true;
    }
    else if(client_pointer.count() === 0){
        state.vars.acc_status = true;
        return false;
    }
    else{
        state.vars.acc_status = false;
        admin_alert('duplicate rows in valid serial numbers for account number: ' + accnum, 'Duplicate Account Numbers in valid serial numbers', 'marisa');
        return false;
    }
}