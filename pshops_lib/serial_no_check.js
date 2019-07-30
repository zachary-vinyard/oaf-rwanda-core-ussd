/*
    Function: serial_no_check.js
    Purpose: checks if the input SHS serial number is in our data
    Status: reviewed with questions, possibly convert to boolean?
*/

module.exports = function(serial_no){
    // retrieve Telerivet table with saved serial numbers
    var SerialTable = project.getOrCreateDataTable("SerialNumberTable");

    // save as variable the row from the serial table where the entered serial number matches
    ListRows = SerialTable.queryRows({
        vars: {'serialnumber': call.vars.EnterSerialNumber}
    });

    // save serial state var as the entered serial number
    state.vars.Serial = call.vars.EnterSerialNumber;
    ListRows.limit(1); // should we flag somehow if the serial number appears more than once?

    // what is count(), how is serial different from state.vars.Serial? 
    if(ListRows.count() == 1){
        var Serial = ListRows.next(); // what does this next() command do?
        if(Serial.vars.accountnumber > 0){
            state.vars.SerialStatus = 'AlreadyReg';
        }
        else{
            // assign account to serial number
            state.vars.SerialStatus = 'Reg';
            Serial.vars.accountnumber = call.vars.AccountNumber; // will this find the right thing? may need to change var name
            Serial.vars.historic_credit = state.vars.TotalCredit - state.vars.Balance;
            Serial.vars.dateregistered = moment().format("DD-MM-YYYY, HH:MM:SS");
            Serial.save(); // does this save the new info in telerivet?
            
            // assign activation code
            var ActTable = project.getOrCreateDataTable("ActivationCodes");
            
            // find activation code associated with input serial number
            ListAct = ActTable.queryRows({
                vars: {'serialnumber': call.vars.EnterSerialNumber,
                        'type': "Activation",
                        'activated': "No"
                }
            });
            
            ListAct.limit(1); // should this flag an error if there are multiple?
            console.log("List.count: " + ListAct.count());

            // if there's an activation code available, save the code as a state var and update the table
            if (ListAct.count() > 0){
                var Act = ListAct.next();
                state.vars.ActCode = Act.vars.code;
                Act.vars.activated = "Yes";
                Act.vars.dateactivated = moment().format("DD-MM-YYYY, HH:MM:SS");
                Act.save();
            }
            else{
                sendEmail("innocent.wafula@oneacrefund.org", "No activation code during registration for serialnumber: " + call.vars.EnterSerialNumber, "No activation code during registration for serialnumber: " + call.vars.EnterSerialNumber);
                state.vars.SerialStatus = 'Error';
            }
        }
        state.vars.Serial = Serial.vars.serialnumber;
    }
    else{
        state.vars.SerialStatus = 'NotFound';
    }
}