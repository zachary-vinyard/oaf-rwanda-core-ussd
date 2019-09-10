/*
    Function: cor-payg-balance.js
    Purpose: returns true if the client's balance is sufficient to provide a new PAYG code
    Status: complete
*/

module.exports = function(){
    // load data tables and functions
    var admin_alert = require('./admin-alert');
    var get_balance = require('./cor-get-balance');
    var repayment_table = project.getOrCreateDataTable('repayment_schedule');
    var settings_table = project.getOrCreateDataTable('ussd_settings');

    // initialize constants and variables
    const lang = settings_table.queryRows({'vars' : {'settings' : 'cor_lang'}}).next().vars.value;
    var cutoff = 0;
    var repayment = 0;

    // retrieve relevant balance and credit numbers for the client
    object = get_balance(JSON.parse(state.vars.client_json), lang);
    balance = object["$BALANCE"];
    credit = object["$CREDIT"];

    // retrieve the cutoff repayment percentage for the current month
    current_month = new Date().getMonth();
    console.log('Current month is ' + current_month);

    repayment_cursor = repayment_table.queryRows({'vars' : {'month_number' : current_month}});
    if(repayment_cursor.hasNext()){
        cutoff = repayment_cursor.next().vars.percent_repaid;
    }
    else{ // note if you don't end the program, you'll give clients a code regardless of repayment
        admin_alert('Current month not found in the month table: ' + current_month, 'Current month is not found', 'marisa');
    }

    // calculate the client's repayment amount
    repayment = (credit - balance) / credit * 100;
    console.log('Repayment is ' + repayment + ' and cutoff is ' + cutoff);
    // return true if the client has surpassed the minimum repayment threshold
    if(repayment >= cutoff){
        return true;
    }
    else{
        return false;
    }
};
