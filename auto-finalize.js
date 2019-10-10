/*
    Script: auto-finalize.js
    Description: labels client USSD orders as finalized if they haven't been changed in a given timeframe
    Status: in progress
*/

// schedule recurring check at what frequency? when?

// load necessary tables and modules
var client_table = project.getOrCreateDataTable('enr_client_pool');
var clients_updated = []; // potentially save a list of updated clients?
const last_order = 14; // number of days 
const day = 24 * 60 * 60 * 1000; // milliseconds in one day, used for date subtraction

// filter client table for unfinalized clients who have ordered
var cursor = client_table.queryRows({'vars' : 
            {   'finalized'     : 0,
                'placed_order'  : 1}
});

// update finalized to 1
while(cursor.hasNext()){
    client = cursor.next();
    days_since_last_update = Math.round(Math.abs((new Date() - client.vars.time_updated) / day)); 
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
