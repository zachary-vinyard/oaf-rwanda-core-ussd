/*
    Function: registration_check.js
    Purpose: allows a client to register their SHS product
    Status: in progress (early stages)
*/

modules.export = function(accnum){
    // access serial number table
    var table = project.getOrCreateDataTable("SerialNumberTable");

    // STEP 2 CHECK IF PERSON HAS REGISTERED
    ListRows = table.queryRows({
        vars: {'accountnumber': call.vars.AccountNumber} // would I change this to accnum if that's my input variable?
    });

    ListRows.limit(1);

    if(ListRows.count()==1){
        state.vars.HasReg = 'Yes';
        var Serial = ListRows.next();
        state.vars.Serial = Serial.vars.serialnumber;
        var Activationtable = project.getOrCreateDataTable("ActivationCodes");

        if (Serial.vars.unlock == "Yes"){
            state.vars.unlock = "Yes";
            // Get unlock code
            ActList = Activationtable.queryRows({
                vars: {
                    'activated': "Yes",
                    'unlock': "Yes",
                    'serialnumber':Serial.vars.serialnumber
                },
            });

            ActList.limit(1);
            var Act = ActList.next();
            state.vars.ActCode = Act.vars.code;
        }

        else{
        
        // Get lastest activation code
            state.vars.unlock = "No";
            var Activationtable = project.getOrCreateDataTable("ActivationCodes");
            ActList = Activationtable.queryRows({
                vars: {
                    'activated': "Yes",
                    'serialnumber':Serial.vars.serialnumber
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
        }
    }
}