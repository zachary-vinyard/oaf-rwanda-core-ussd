/*
    Script: auto-confirm.js
    Description: confirms client USSD orders if they haven't been changed in a given timeframe
    Status: in progress
*/

// schedule recurring check at what frequency?

// load necessary tables and modules
var client_table = project.getOrCreateDataTable('enr_client_pool');
var clients_updated = []; // potentially save a list of updated clients?
const last_order = 14; // number of days 

/* filter for relevant clients:
    - not finalized
    - order placed
    - what's the structure of the client_table?
*/
var cursor = client_table.queryRows({'vars' : 
            {   'finalized' : notfinalized,
                'order' : notempty}
});

// update finalized to 1
while(cursor.hasNext()){
    client = cursor.next();
    days_since_last_update = new Date() - client.vars.time_updated; // need to convert to days subtraction
    if(days_since_last_update > last_order){
        client.vars.finalized = 1;
        client.save();
        // add client to clients_updated list?
        return;
    }
    else{
        return;
    }
}
