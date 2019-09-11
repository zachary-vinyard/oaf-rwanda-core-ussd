/*
    Function: renew_code.js
    Purpose: allows a client to renew their PAYG code
    Status: reviewed + questions added; possibly convert to boolean?
*/

module.exports = function(accnum, serial_no){
    // load relevant data tables from Telerivet
    var serial_table = project.getOrCreateDataTable("SerialNumberTable");
    var act_table = project.getOrCreateDataTable("ActivationCodes");

    // retrieve the row in the serial table with the relevant account number
    serial_pointer = serial_table.queryRows({
        vars: {'accountnumber': accnum}
    });

    serial_pointer.limit(1); // replace with error controls

    var serial = serial_pointer.next();
    var prepayment = Number(5000); // store in telerivet
    console.log("Total Credit: " + state.vars.TotalCredit + "\n Historic Credit: " + serial.vars.historic_credit);

    // calculate various numbers based on prepayment, credit, etc
    var CreditThisCycle = state.vars.TotalCredit - serial.vars.historic_credit - prepayment;
    var MaxBalance = CreditThisCycle - ((CreditThisCycle / 12) * (serial.vars.numbercodes));

    // calculate the months between the current date and when the product was registered
    var current_month = new Date().getMonth();
    var date_reg = serial.vars.dateregistered;
    var month_reg = 0;
    if(date_reg.length < 20){
        month_reg = parseInt(date_reg.split("-")[1]);
    }
    else{
        month_reg = date_reg.getMonth();
    }
    var months_between = current_month - month_reg;
    console.log("MonthsBetween: " + months_between + "\n MaxBalance: " + MaxBalance + "\n Balance: " + state.vars.Balance);

    /* 
        add code here that checks what the most recent activation date was. 
        will need to do messy date conversion.
    */

    if(state.vars.Balance === 0 && months_between > 1){
        state.vars.NewCodeStatus = "Unlock";
        ListAct = act_table.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Unlock",
                    'activated': "No"
            }
        });         
        ListAct.limit(1); // replace with error flags
        Serial.vars.unlock = "Yes";
        Serial.save();
    }
    else if(state.vars.Balance <= MaxBalance){
        state.vars.NewCodeStatus = "Yes";
        ListAct = act_table.queryRows({
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
        Act.vars.dateactivated = new Date();
        Act.save();
        state.vars.ActCode = Act.vars.code;
    }
};
