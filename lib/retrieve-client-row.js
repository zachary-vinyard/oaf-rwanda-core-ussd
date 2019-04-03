/*
module for retrieving retrieving account number rows from database
takes account number, table name as arguements and returns an object representing the row
*/

module.exports = function(account_number, table_name){
    cursor = project.getOrCreateDataTable(table_name).queryRows({'vars' : {'account_number' : input}});
    if(!(cursor.hasNext())){
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
