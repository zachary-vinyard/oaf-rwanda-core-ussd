/*
module for selecting product menu based on geography
*/

module.exports = function(geo_str, table_name){
    var data_table = project.getOrCreateDataTable(table_name);
    console.log(table_name + ' : ' + geo_str);
    var cursor = data_table.queryRows({'vars' : {'geo' : geo_str}});
    if(cursor.hasNext()){
        var geo_row = cursor.next();
        console.log(JSON.stringify(geo_row));
        console.log(JSON.stringify(geo_row.vars));
        if(cursor.hasNext()){
            admin_alert = require('./admin-alert')
            admin_alert('Duplicate geo mapping for product menus : ' + geo_str);
        }
        var prod_tab_name = geo_row.vars.value;
        console.log(prod_tab_name);
        return prod_tab_name;
    }
    else{
        admin_alert = require('./admin-alert')
        admin_alert('No geo mapping for geo_str : ' + geo_str);
        return null;
    }
}
