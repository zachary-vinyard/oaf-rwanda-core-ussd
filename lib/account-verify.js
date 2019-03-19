/*
main function for interacting with Roster API and retrieving client JSONs
*/

module.exports.account_verify = function(account_number){
    var client = null;
    var api = require('ext/Roster_v1_1_0'); //roster. to make more general
    api.dataTableAttach('ExternalApis');
    var country = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'country'}}).next().vars.value; //todo: make more general
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
        }
    }
    catch(error){
            console.log('error : ' + error);
            require('./admin-alert').admin_alert('API Failure','API failure on account number ' + acctNum + '\nError : ' + error + '\n' + JSON.stringify(client));
    }
};
