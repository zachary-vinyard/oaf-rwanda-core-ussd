/*
module for retrieving retrieving account number rows from database
takes account number, table name as arguements and returns an object representing the row
*/

module.exports = function(account_number, an_table, enrollment){
    enrollment = enrollment || false;
    var table = project.getOrCreateDataTable(an_table);
    var cursor = table.queryRows({'vars' : {'account_number' : account_number}});
    if(!cursor.hasNext()){
        //console.log('got a false hasNext')
        if(enrollment){
            var account_verify = require('./account-verify');
            if(account_verify(account_number)){
                client = table.createRow({'vars' : {'account_number' : account_number, 'via_api' : true}})
                client.save();
                return client;
            }
            else{
                return null;
            }
        }
        return null;
    }
    var client = cursor.next();
    if(cursor.hasNext()){
        var admin_alert = require('./admin-alert');
        admin_alert('Duplicate account number : ' + account_number)
    }
    return client;
};
