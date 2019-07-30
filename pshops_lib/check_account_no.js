/*
    Function: check_account_no.js
    Purpose: checks if the input account number appears as a PShop account in Roster
    Status: complete
*/

module.exports = function(accnum){
    require('../lib/account-verify')(accnum); // run account number through core account verify function
    if(state.vars.client_district === 'RRT P-Shops'){
        return true;
    }
    else{
        return false;
    }
}
