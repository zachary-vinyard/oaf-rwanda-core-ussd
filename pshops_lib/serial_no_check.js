/*
    Function: serial_no_check.js
    Author: Tom ft. Marisa
    Purpose: checks if the input SHS serial number is in our data
*/

// STEP 1 GET A TABLE WHERE SERIAL # IS SAVED
// Note - is this available in Roster? Would it be faster to pull the data from there?
var SerialTable = project.getOrCreateDataTable("SerialNumberTable");


// STEP 2 CHECK IF PERSON HAS REGISTERED
ListRows = SerialTable.queryRows({
    vars: {'serialnumber': call.vars.EnterSerialNumber}
});

 state.vars.Serial = call.vars.EnterSerialNumber;

ListRows.limit(1);

if(ListRows.count()==1){
    
    var Serial = ListRows.next();
    
    if(Serial.vars.accountnumber>0){state.vars.SerialStatus = 'AlreadyReg'}
    
    else {
        
        // Asign account to serial number
        state.vars.SerialStatus = 'Reg';
        Serial.vars.accountnumber = call.vars.AccountNumber;
        Serial.vars.historic_credit = state.vars.TotalCredit- state.vars.Balance;
        Serial.vars.dateregistered = moment().format("DD-MM-YYYY, HH:MM:SS");
        Serial.save();
        
        // Asign activation code
        var ActTable = project.getOrCreateDataTable("ActivationCodes");
        
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': call.vars.EnterSerialNumber,
                    'type': "Activation",
                    'activated':"No"
            }
        });
        
        ListAct.limit(1);
        console.log("List.count:");
        console.log(ListAct.count());

        if (ListAct.count()>0){
        
            var Act = ListAct.next();
            state.vars.ActCode = Act.vars.code;
            Act.vars.activated="Yes";
            Act.vars.dateactivated = moment().format("DD-MM-YYYY, HH:MM:SS");
            Act.save();
        
        }
        else {
            sendEmail("innocent.wafula@oneacrefund.org", "No activation code during registration for serialnumber: "+call.vars.EnterSerialNumber, "No activation code during registration for serialnumber: "+call.vars.EnterSerialNumber);
            state.vars.SerialStatus = 'Error'
        }
        
    }
    state.vars.Serial = Serial.vars.serialnumber;
    
}

else {state.vars.SerialStatus = 'NotFound'}