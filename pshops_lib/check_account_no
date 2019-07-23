
module.exports = function(accnum){
    // Authentication against Roster
    var rosterAPI = require('ext/Roster_v1_0_2/api');
    catchAll(function() {
        rosterAPI.verbose = true;
        rosterAPI.dataTableAttach();

        if (rosterAPI.authClient(accnum,'RW')) {
            var client = rosterAPI.getClient(accnum,'RW');
            if(client.DistrictName == "RRT P-Shops"){
                state.vars.AccStatus = "Valid P-shop";
                state.vars.Client = JSON.stringify(client);
                state.vars.TotalCredit = client.BalanceHistory[0].TotalCredit;
            state.vars.TotalRepay_Incl = client.BalanceHistory[0].TotalRepayment_IncludingOverpayments;
            state.vars.Balance = client.BalanceHistory[0].Balance;
            state.vars.farmername = client.ClientName;
            }
        else {
            state.vars.AccStatus = "Non P-Shop"}
        }
    });
    return state.vars.AccStatus;
}
