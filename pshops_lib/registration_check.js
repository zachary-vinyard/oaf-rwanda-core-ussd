/*
    Function: registration_check.js
    Purpose: allows a client to register their SHS product
    Status: in progress (early stages). Returns true if client has registered, else false. Saves unlock status as boolean.
*/

modules.export = function(accnum){

    var admin_alert = require('./lib/admin-alert');
    var table = project.getOrCreateDataTable("SerialNumberTable");

    // retrieve rows where account number in table corresponds to input account number
    ListRows = table.queryRows({
        vars: {'accountnumber': accnum} 
    });

    // get unlock code if client has registered; else get the latest activation code
    if(ListRows.count() === 1){
        var Serial = ListRows.next();
        state.vars.serial_no = Serial.vars.serialnumber;
        var Activationtable = project.getOrCreateDataTable("ActivationCodes");

        if (Serial.vars.unlock == "Yes"){
            state.vars.unlock = true;
            // get unlock code
            ActList = Activationtable.queryRows({
                vars: {
                    'activated': "Yes",
                    'unlock': "Yes",
                    'serialnumber': state.vars.serial_no
                },
            });
            
            ActList.limit(1); // Replace with error controls
            var Act = ActList.next();
            state.vars.ActCode = Act.vars.code;
            return true;
        }
        else{
        // Get latest activation code
            state.vars.unlock = false;
            var Activationtable = project.getOrCreateDataTable("ActivationCodes");
            ActList = Activationtable.queryRows({
                vars: {
                    'activated': "Yes",
                    'serialnumber': state.vars.serial_no
                },
            });
            
            Serial.vars.NumberCodes = ActList.count();
            Serial.save();
        
            var LatestDateActivated = "";
            while (ActList.hasNext()) {
                var Act = ActList.next();
                if(Act.vars.dateactivated>LatestDateActivated){
                    LatestDateActivated = Act.vars.dateactivated;
                    state.vars.ActCode = Act.vars.code;
                }
            }
            return true;
        }
    }
    else if(ListRows.count() > 1){
        admin_alert('Multiple rows in SerialNumberTable for account: ' + accnum, 'Duplicate Account Numbers in SerialNumberTable', 'marisa');
        return false;
    }
    else{
        return false;
    }
}