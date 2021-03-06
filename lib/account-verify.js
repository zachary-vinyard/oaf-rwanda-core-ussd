/*
main function for interacting with Roster API and retrieving client JSONs
*/

module.exports = function(account_number){
    var client = null;
    var api = require('ext/Roster_v1_2_0/api'); //roster. occasionally will need update
    api.dataTableAttach('ExternalApis');
    var country = project.vars.country;
    api.verbose = true;
    api.dataTableAttach('ExternalApis'); //todo: make more general
    try{
        client_auth = api.authClient(account_number, country);
        if(client_auth){
            var client = api.getClient(account_number);
            state.vars.client_json = JSON.stringify(client);
            state.vars.client_name = client.ClientName;
            state.vars.client_district = client.DistrictName;
            state.vars.client_site = client.SiteName;
            console.log('name: ' + state.vars.client_name);
            console.log('district: ' + state.vars.client_district);
            console.log('site: ' + state.vars.client_site)
            return true;
        }
        else{
            return false;
        }
    }
    catch(error){
            console.log('error : ' + error);
            admin_alert = require('./admin-alert')
            admin_alert('API failure on account number ' + account_number + '\nError : ' + error + '\n' + JSON.stringify(client));
            return false;
    }
};
