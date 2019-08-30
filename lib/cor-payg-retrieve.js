/*
    Function: cor-payg-retrieve.js
    Purpose: if the input account # has a registered serial number, retrieve the relevant PAYG code.
    Status: in progress
*/

module.exports = function(accnum){
    // load in relevant modules and data tables
    var admin_alert = require('./admin-alert');
    var serial_table = project.getOrCreateDataTable('valid_serial_numbers_TEST');

    // save api cursor pointing to rows from the serial table where the entered serial number matches
    var client_pointer = serial_table.queryRows({'vars' : {'registered_account_number' : accnum}});

    console.log(client_pointer.hasNext());

    // if one client row exists, return true and save payg code as a state variable
    if(client_pointer.count() === 1){
        var client_row = client_pointer.next(); // save the row that has client's account number
        state.vars.payg_code = client_row.vars.payg_code;
        return true;
    }
    // if no rows match the account number, set boolean as true (indicates no error w/ accnum) and return false
    else if(client_pointer.count() === 0){
        var valid = true;
    }
    // if multiple rows match, set boolean as false (indicates an error), alert admin, and return false
    else{
        state.vars.acc_valid = false;
        admin_alert('duplicate rows in valid serial numbers for account number: ' + accnum, 'Duplicate Account Numbers in valid serial numbers', 'marisa');
        var valid = false;
    }
    state.vars.acc_valid = valid;
    return false;
}