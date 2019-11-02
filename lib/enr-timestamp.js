/*
module for tracking the length of each interaction
*/

module.exports = function(){
    // store relevant modules and constants
    var get_client = require('./enr-retrieve-client-row');
    var settings_table = project.getOrCreateDataTable('ussd_settings');
    const an_pool = settings_table.queryRows({'vars' : {'settings' : 'enr_client_pool'}}).next().vars.value;

    // calculate interaction time and save in client row
    var end_date = new Date();
    var interaction_time = Math.abs(end_date - state.vars.start_date) / 1000; // convert from milliseconds to seconds
    var client = get_client(state.vars.account_number, an_pool);
    client.vars.interaction_time = interaction_time;
    client.save();
};

