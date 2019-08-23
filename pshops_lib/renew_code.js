/*
    Function: renew_code.js
    Purpose: allows a client to renew their PAYG code
    Status: reviewed + questions added; possibly convert to boolean?
*/

module.exports = function(accnum, serial_no){
    // load relevant data tables from Telerivet
    var table = project.getOrCreateDataTable("SerialNumberTable");
    var ActTable = project.getOrCreateDataTable("ActivationCodes");

    // retrieve the row in the serial table with the relevant account number
    ListRows = table.queryRows({
        vars: {'accountnumber': accnum}
    });

    ListRows.limit(1); // replace with error controls

    var Serial = ListRows.next();
    var now = moment(); // this is triggering an error
    var PrePayment = Number(5000); // store prepayment value somewhere in telerivet?
    console.log("Total Credit: " + state.vars.TotalCredit + "\n Historic Credit: " + Serial.vars.historic_credit);

    // calculate various numbers based on prepayment, credit, etc
    var CreditThisCycle = state.vars.TotalCredit - Serial.vars.historic_credit - PrePayment;
    var MaxBalance = CreditThisCycle - ((CreditThisCycle/12) *(Serial.vars.NumberCodes));
    var MonthsBetween = moment.duration(now.diff(Serial.vars.dateregistered)).asMonths();
    console.log("MonthsBetween: " + MonthsBetween + "\n MaxBalance: " + MaxBalance + "\n Balance: " + state.vars.Balance);

    // access the rows from activation codes table with the input serial number that have been activated
    ListActActive = ActTable.queryRows({
        vars: {'serialnumber': serial_no,
                'activated': "Yes"
        }
    });
        
    var MonthsBetweenLastCode = -99; // why is this initialized as 99?
    while(ListActActive.hasNext()){
        var ActRowActive = ListActActive.next();
        var MonthsCheck = moment.duration(now.diff(ActRowActive.vars.dateactivated)).asMonths();
        console.log(MonthsCheck);
        if (MonthsBetweenLastCode < MonthsCheck){
            MonthsBetweenLastCode =  MonthsCheck;
        } 
    }

    console.log("Months since last code retrieval: " + MonthsBetweenLastCode);

    if(state.vars.Balance === 0 && MonthsBetween > 1){
        state.vars.NewCodeStatus = "Unlock";
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Unlock",
                    'activated': "No"
            }
        });         
        ListAct.limit(1); // replace with troubleshooting code
        Serial.vars.unlock = "Yes";
        Serial.save();
    }
    else if(state.vars.Balance <= MaxBalance){
        state.vars.NewCodeStatus = "Yes";
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Activation",
                    'activated': "No"
            }
        });  
        ListAct.limit(1); // replace with error flags
    }
    else{
        state.vars.NewCodeStatus = "No";
        state.vars.RemainBal = state.vars.Balance - MaxBalance;
    }

    if(state.vars.NewCodeStatus == "Unlock" || state.vars.NewCodeStatus == "Yes"){
        var Act = ListAct.next();
        Act.vars.activated = "Yes";
        Act.vars.dateactivated = moment().format("DD-MM-YYYY, HH:MM:SS");
        Act.save();
        state.vars.ActCode = Act.vars.code;
    }
};
