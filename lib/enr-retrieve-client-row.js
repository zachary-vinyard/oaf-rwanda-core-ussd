/*
module for retrieving retrieving account number rows from database
takes account number, table name as arguements and returns an object representing the row
*/

module.exports = function(account_number, table_name){
    var data_table = project.getOrCreateDataTable(table_name);
    var cursor = data_table.queryRows({'vars' : {'account_number' : account_number}});
    if(!(cursor.hasNext())){
        var account_verify = require('./account-verify');
        if(account_verify(account_number)){
            client = data_table.createRow({'vars' : {'account_number' : account_number, 'via_api' : true}})
            client.save();
            return client;
        }
        else{
            return null;
        }
        return null;
    }
    else{
        client = cursor.next();
        if(cursor.hasNext()){
            admin_alert = require('./admin-alert');
            admin_alert('Duplicate account number : ' + account_number + '\nTable name : ' + table_name);
        }
        return client;
    }
};
