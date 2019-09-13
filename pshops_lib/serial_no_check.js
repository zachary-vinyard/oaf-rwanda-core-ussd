/*
    Function: serial_no_check.js
    Purpose: checks if the input SHS serial number is in our data
    Status: reviewed with questions, possibly convert to boolean?
*/

module.exports = function(accnum, serial_no){
    var admin_alert = require('../lib/admin-alert');
    // retrieve Telerivet table with saved serial numbers
    var SerialTable = project.getOrCreateDataTable("SerialNumberTable");
    console.log("Duplicate is " + state.vars.duplicate);

    // save as variable the row from the serial table where the entered serial number matches
    if(state.vars.duplicate){
        var ListRows = SerialTable.queryRows({
            vars: {'serialnumber': serial_no, 'accountnumber' : accnum}
        });
    }
    else{
        var ListRows = SerialTable.queryRows({
            vars: {'serialnumber': serial_no, 'accountnumber' : {exists : 0}}
        });
    }

    console.log("number of rows is " + ListRows.count());

    // if there's a row in serial table with the serial number and no account number, assign the account to that serial
    if(ListRows.count() === 1){
        var Serial = ListRows.next();
        // assign account to serial number
        state.vars.SerialStatus = 'Reg';
        Serial.vars.accountnumber = accnum; 
        Serial.vars.historic_credit = state.vars.TotalCredit - state.vars.Balance;
        Serial.vars.dateregistered = new Date().toString();
        Serial.save(); 
        
        // retrieve one unused activation code for this serial number
        var ActTable = project.getOrCreateDataTable("ActivationCodes");
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Activation",
                    'activated': "No"
            }
        });
        if(ListAct.count() < 1){
            var admin_alert = require('./lib/admin-alert');
            admin_alert('No codes remaining for SHS product with serial number: ' + serial_no, 'No remaining serial numbers', 'marisa');
        }
        else{
            ListAct.limit(1);
        }
        
        console.log('Activation rows number ' + ListAct.count());
        // update the activation table to say that this code has been used
        var Act = ListAct.next();
        state.vars.ActCode = Act.vars.code;
        Act.vars.activated = "Yes";
        Act.vars.dateactivated = new Date().toString();
        Act.save();
    }
    // if there are more than one rows with the input serial number, flag an error
    else if(ListRows.count() > 1){
        var admin_alert = require('./lib/admin-alert');
        admin_alert('duplicate serial numbers in PSHOPs database sn: ' + serial_no, 'Duplicate Serial Numbers in TR DB', 'marisa');
        return false;
    }
    // if there are zero rows in the table with the serial number, return false
    else{
        state.vars.SerialStatus = 'NotFound';
        return false;
    }
}
