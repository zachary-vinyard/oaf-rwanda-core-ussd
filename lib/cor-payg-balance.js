/*
    Function: cor-payg-balance.js
    Purpose: returns true if the client's balance is sufficient to provide a new PAYG code
    Status: complete but not tested
*/

module.exports = function(){
    // load data tables and functions
    var admin_alert = require('./admin-alert');
    var repayment_table = project.getOrCreateDataTable('repayment_schedule');
    var settings_table = project.getOrCreateDataTable('ussd_settings');
    const lang = settings_table.queryRows({'vars' : {'settings' : 'cor_lang'}}).next().vars.value;
    var cutoff = 0;
    var repayment = 0;
    get_balance = require('./cor-get-balance');

    // retrieve relevant balance and credit numbers for the client
    object = get_balance(JSON.parse(state.vars.client_json), lang);
    balance = object["$BALANCE"];
    credit = object["$CREDIT"];

    console.log("Balance is " + balance);

    // retrieve the cutoff repayment percentage for the current month
    current_date = new Date();
    current_month = current_date.getMonth();
    repayment_cursor = repayment_table.queryRows({'vars' : {'month_number' : current_month}});
    console.log(repayment_cursor.hasNext());

    if(repayment_cursor.hasNext()){
        cutoff = repayment_cursor.next().vars.percent_repaid;
    }
    else{ // note if you don't end the program, you'll give clients a code regardless of repayment
        admin_alert('Current month not found in the month table: ' + current_month, 'Current month is not found', 'marisa');
    }

    // calculate the client's repayment amount; return true if it exceeds the cutoff amount
    repayment = (credit - balance) / credit * 100;
    console.log("Repayment: " + repayment + "Cutoff: " + cutoff + "Month: " + current_month + "Credit: " + credit);

    if(repayment >= cutoff){
        return true;
    }
    else{
        return false;
    }
};
