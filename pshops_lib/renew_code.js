/*
    Function: renew_code.js
    Purpose: allows a client to renew their PAYGO code
    Status: put into modules.export format but otherwise unadapted
*/

modules.export = function(input){
    // STEP 1 GET TABLES
    var table = project.getOrCreateDataTable("SerialNumberTable");
    var ActTable = project.getOrCreateDataTable("ActivationCodes");

    // STEP 2 CHECK IF PERSON HAS REGISTERED
    ListRows = table.queryRows({
        vars: {'accountnumber': call.vars.AccountNumber}
    });

    ListRows.limit(1);

    var Serial = ListRows.next();
    var now = moment();
    var PrePayment = Number(5000);

    console.log("Total Credit");
    console.log(state.vars.TotalCredit);
    console.log("Historic Credit");
    console.log(Serial.vars.historic_credit);

    var CreditThisCycle = state.vars.TotalCredit - Serial.vars.historic_credit - PrePayment;
    var MaxBalance = CreditThisCycle - ((CreditThisCycle/12) *(Serial.vars.NumberCodes));
    var MonthsBetween = moment.duration(now.diff(Serial.vars.dateregistered)).asMonths();

    console.log("MonthsBetween");
    console.log(MonthsBetween);
    console.log("MaxBalance");
    console.log(MaxBalance);

    ListActActive = ActTable.queryRows({
        vars: {'serialnumber': state.vars.Serial,
                'activated':"Yes"
        }
    });
        
    var MonthsBetweenLastCode = -99;
        
    while(ListActActive.hasNext()){
        var ActRowActive = ListActActive.next();
        var MonthsCheck = moment.duration(now.diff(ActRowActive.vars.dateactivated)).asMonths();
        console.log(MonthsCheck);
        if (MonthsBetweenLastCode < MonthsCheck){
            MonthsBetweenLastCode =  MonthsCheck;
        } 
    }
    
    console.log("Months since last code retrieval:"+MonthsBetweenLastCode);

    if(state.vars.Balance === 0 && MonthsBetween>1){
        state.vars.NewCodeStatus = "Unlock";
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': state.vars.Serial,
                    'type': "Unlock",
                    'activated':"No"
            }
        });         
        ListAct.limit(1);
        Serial.vars.unlock = "Yes";
        Serial.save();
    }
    else if(state.vars.Balance <= MaxBalance){
        state.vars.NewCodeStatus = "Yes";
        ListAct = ActTable.queryRows({
            vars: {'serialnumber': state.vars.Serial,
                    'type': "Activation",
                    'activated':"No"
            }
        });  
        ListAct.limit(1);
    }
    else {
        state.vars.NewCodeStatus = "No";
        state.vars.RemainBal = state.vars.Balance - MaxBalance;
    }

    if(state.vars.NewCodeStatus == "Unlock"|| state.vars.NewCodeStatus == "Yes"){
        var Act = ListAct.next();
        Act.vars.activated = "Yes";
        Act.vars.dateactivated = moment().format("DD-MM-YYYY, HH:MM:SS");
        Act.save();
        state.vars.ActCode = Act.vars.code;
    }
};
