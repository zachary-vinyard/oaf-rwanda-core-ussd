/*
module for getting client by nid
*/

module.exports = function(nid, table_name){
    var data_table = project.getOrCreateDataTable(table_name);
    var cursor = data_table.queryRows({'vars' : {'nid' : nid}})
    if(nid === null){
        throw 'ERROR: null nid';
    }
    if(cursor.hasNext()){
        var client = cursor.next()
        var account_num = client.vars.account_number;
        var oafid = client.vars.oafid;
        if(cursor.hasNext()){
            var admin_alert = require('./admin-alert');
            admin_alert('duplicate nids : ' + nid + '\ntable : ' + table_name, 'Dupicate NIDS')
        }
        return {'account_number' : account_num, 'oafid' : oafid}
    }
    else{
        return null;
    }
}