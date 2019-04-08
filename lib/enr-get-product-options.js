/*
module for retrieving product option rows
*/

module.exports = function(product_name, product_table){
    var table = project.getOrCreateDataTable(product_table);
    var cursor = table.queryRows({'vars' : {'product_name' : product_name}});
    if(cursor.hasNext){
        var product_row = cursor.next();
        if(cursor.hasNext){
            admin_alert = require('./admin-alert');
            admin_alert('Duplicate product in database : ' + product_name);
        }
        return {'input_name': product_row.vars.input_name,
                'increment' : product_row.vars.increment,
                'price'     : product_row.vars.price,
                'max'       : product_row.vars.max,
                'min'       : product_row.vars.min,
                'unit'      : product_row.vars.unit,
                'en'        : product_row.vars.en,
                'ki'        : product_row.vars.ki}
    }
    else{
        throw 'ERROR: missing product in database : ' + product_name + ' on table name ; ' + table_name;
    }
}
