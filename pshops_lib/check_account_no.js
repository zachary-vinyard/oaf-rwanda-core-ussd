/*
    Function: check_account_no.js
    Purpose: checks if the input account number appears as a PShop account in Roster
    Status: complete
*/

module.exports = function(accnum){
    require('../lib/account-verify')(accnum); // run account number through core account verify function
    console.log(state.vars.client_district);
    if(state.vars.client_district === 'RRT P-Shops'){
        var client = api.getClient(account_number);
        state.vars.client_json = JSON.stringify(client);
        state.vars.TotalCredit = client.BalanceHistory[0].TotalCredit;
        state.vars.TotalRepay_Incl = client.BalanceHistory[0].TotalRepayment_IncludingOverpayments;
        state.vars.Balance = client.BalanceHistory[0].Balance;
        return true;
    }
    else{
        return false;
    }
}
