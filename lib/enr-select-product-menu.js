/*
module for selecting product menu based on geography
*/

module.exports = function(geo_str, table_name){
    var data_table = project.getOrCreateDataTable(table_name);
    var cursor = data_table.queryRows({'vars' : {'geo' : geo_str}});
    if(cursor.hasNext()){
        var geo_row = curose.next();
        if(cursor.hasNext()){
            admin_alert = require('./admin-alert')
            admin_alert('Duplicate geo mapping for product menus : ' + geo_str);
        }
        return geo_row.value;
    }
    else{
        return null;
    }
}
