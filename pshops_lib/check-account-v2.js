
module.exports = function(accnum){
        // Authentication against Roster
        require('../lib/account-verify')(accnum);
        if(state.vars.client_district === "RRT P-Shops"){
            return true;
        }
        else{
            return false;
        }
};
