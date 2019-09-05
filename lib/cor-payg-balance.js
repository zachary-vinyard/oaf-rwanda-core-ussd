/*
    Function: cor-payg-balance.js
    Purpose: returns true if the client's balance is sufficient to provide a new PAYG code
    Status: in progress
*/

module.exports = function(){
    // lines needed to run get_balance - inelegant
    const x = 0.6; // the percentage needed to get a new code. Double check, save in a table somewhere
    const lang = settings_table.queryRows({'vars' : {'settings' : 'cor_lang'}}).next().vars.value;
    get_balance = require('./lib/cor-get-balance');
    var balance_data = get_balance(JSON.parse(state.vars.client_json), lang);

    // calculate repayment percentage - may trigger errors depending on how numbers work in Javascript
    repayment = (state.vars.credit - state.vars.balance) / state.vars.credit;

    // decide if client has paid enough
    if(repayment > x){
        return true;
    }
    else{
        return false;
    }
}