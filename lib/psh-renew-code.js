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
    var serial_pointer = serial_table.queryRows({
        vars: {'accountnumber': accnum}
    });

    serial_pointer.limit(1); // replace with error controls
    var serial = serial_pointer.next();
    var prepayment = Number(5000); // store in telerivet
    console.log("Total Credit: " + state.vars.TotalCredit + " Historic Credit: " + serial.vars.historic_credit);

    // calculate various numbers based on prepayment, credit, etc
    var CreditThisCycle = state.vars.TotalCredit - serial.vars.historic_credit - prepayment;
    var MaxBalance = CreditThisCycle - ((CreditThisCycle / 12) * (serial.vars.numbercodes));

    // calculate the months between the current date and when the product was registered
    var current_month = new Date().getMonth();
    var date_reg = serial.vars.dateregistered;
    var month_reg = 0;
    if(date_reg.length < 24){
        month_reg = parseInt(date_reg.split("-")[1], 10) - 1;
    }
    else{
        month_reg = new Date(date_reg).getMonth();
    }
    var months_between = current_month - month_reg;
    console.log("MonthsBetween: " + months_between + "\n MaxBalance: " + MaxBalance + "\n Balance: " + state.vars.Balance);

    // the section below checks how long ago the past activation code was given
    // initialize variables
    var act_pointer = act_table.queryRows({
        vars: { 'serialnumber' : serial_no,
                'dateactivated' : {exists : 1}}
    });
    var month_active = 0;
    var month_check = 0;
    var year_active = 2019;
    var year_check = 0;

    // find the month and year of the most recent activation code 
    while(act_pointer.hasNext()){
        var act_row = act_pointer.next();
        var date_active = new String(act_row.vars.dateactivated);
        console.log('date active is ' + date_active + ' and its type is ' + typeof(date_active));
        if(date_active.length < 24){
            month_active = parseInt(date_active.split("-")[1], 10) - 1;
            year_active = parseInt(date_active.split("-")[0], 10);
        }
        else{ // note: this will crash if month is not in the correct date format
            month_active = date_active.getMonth();
            year_active = date_active.getYear();
        }
        // save month_active as the most recent value in the listed rows
        if(month_active > month_check && year_active >= year_check){
            month_check = month_active;
            year_check = year_active;
            cursor = act_row;
        }
    }

    // calculate the months since the last activation
    var months_since = 0;
    var month_valid = false;
    const current_year = new Date().getYear;
    if((current_year - year_check) > 1){
        month_valid = true;
    }
    else if(year_check == current_year){
        months_since = current_month - month_check;
    }
    else{
        months_since = (12 - month_check) + current_month;
    }
    // if the last activation was less than two months ago, we won't get a new code
    if(months_since >= 2){
        month_valid = true;
    }
    else{
        month_valid = false;
    }

    // if balance is zero and months between is larger than one, client has unlocked product
    if(state.vars.Balance === 0 && months_between > 1){
        state.vars.NewCodeStatus = "Unlock";
        var ListAct = act_table.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Unlock",
                    'activated': "No"
            }
        });         
        ListAct.limit(1); // replace with error flags
        serial.vars.unlock = "Yes";
        serial.save();
    }
    else if(state.vars.Balance <= MaxBalance && month_valid){
        state.vars.NewCodeStatus = "Yes";
        var ListAct = act_table.queryRows({
            vars: {'serialnumber': serial_no,
                    'type': "Activation",
                    'activated': "No"
            }
        });  
        ListAct.limit(1); 
    }
    else if(state.vars.Balance <= MaxBalance && !month_valid){
        state.vars.NewCodeStatus = "StillActive";
        state.vars.ActCode = act_row.vars.code;
    }
    else{
        state.vars.NewCodeStatus = "No";
        state.vars.RemainBal = state.vars.Balance - MaxBalance;
    }

    if(state.vars.NewCodeStatus == "Unlock" || state.vars.NewCodeStatus == "Yes"){
        var Act = ListAct.next();
        Act.vars.activated = "Yes";
        Act.vars.dateactivated = new Date().toString();
        Act.save();
        state.vars.ActCode = Act.vars.code;
    }
};
