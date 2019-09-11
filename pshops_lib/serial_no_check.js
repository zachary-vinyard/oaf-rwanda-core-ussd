/*
    Function: serial_no_check.js
    Purpose: checks if the input SHS serial number is in our data
    Status: reviewed with questions, possibly convert to boolean?
*/

module.exports = function(accnum, serial_no){
    var admin_alert = require('../lib/admin-alert');
    // retrieve Telerivet table with saved serial numbers
    var SerialTable = project.getOrCreateDataTable("SerialNumberTable");

    // save as variable the row from the serial table where the entered serial number matches
    var ListRows = SerialTable.queryRows({
        vars: {'serialnumber': serial_no, 'registered_account_number' : {exists : 0}}
    });

    // check registration status
    if(ListRows.count() === 1){
        var Serial = ListRows.next(); // this accesses the data row that you get from API cursor using queryRows
        // assign account to serial number
        state.vars.SerialStatus = 'Reg';
        Serial.vars.accountnumber = accnum; 
        Serial.vars.historic_credit = state.vars.TotalCredit - state.vars.Balance;
        Serial.vars.dateregistered = new Date();
        Serial.save(); 
        
        // assign activation code
        var ActTable = project.getOrCreateDataTable("ActivationCodes");
        
        // find activation code associated with input serial number
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Activation",
                    'activated': "No"
            }
        });

        // if there's one activation code available, save the code as a state var and update the table; otherwise flag errors in source data
        if(ListAct.count() === 1){
            var Act = ListAct.next();
            state.vars.ActCode = Act.vars.code;
            Act.vars.activated = "Yes";
            Act.vars.dateactivated = new Date();
            Act.save();
        }
        else if(ListAct.count() > 1){
            admin_alert('duplicate rows in ActivationCodes for serial number: ' + serial_no, 'Duplicate Serial Numbers in ActTable', 'marisa');
            state.vars.SerialStatus = 'Error';
            return false; 
        }
        else{
            admin_alert('No rows in ActivationCodes for serial number: ' + serial_no, 'No corresponding rows in ActTable', 'marisa');
            state.vars.SerialStatus = 'Error';
            return false; 
        }
    }
    else if(ListRows.count() > 1){
        var admin_alert = require('./lib/admin-alert');
        admin_alert('duplicate serial numbers in PSHOPs database sn: ' + serial_no, 'Duplicate Serial Numbers in TR DB', 'marisa');
        return false;
    }
    else{
        state.vars.SerialStatus = 'NotFound';
        return false;
    }
}
