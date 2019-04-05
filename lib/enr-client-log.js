/*
module for logging client data collected through the USSD enr system
*/

module.exports = function(nid, name1, name2, pn, glus, geo){
    var an_table = project.getOrCreateDataTable('20a_client_data');
    var cursor = an_table.queryRows({'vars' : {'geo' : geo}});
    if(!cursor.hasNext()){
        admin_alert = require('./admin-alert');
        admin_alert('NO REMAINING ANs for location : ' + geo, 'TR: NO REMAING ANs');
    }
}