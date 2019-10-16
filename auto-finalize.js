/*
    Script: auto-finalize.js
    Description: labels client USSD orders as finalized if they haven't been changed in a given timeframe
    Status: in progress
*/

// load necessary tables and modules
var client_table = project.getOrCreateDataTable('20b_client_data');
var clients_updated = []; // potentially save a list of updated clients?
const last_order = 7; // number of days 
const day = 24 * 60 * 60 * 1000; // milliseconds in one day, used for date subtraction

// filter client table for unfinalized clients who have ordered
var cursor = client_table.queryRows({'vars' : 
            {   'finalized'     : 0,
                'placed_order'  : 1}
});

// update finalized to 1 and alert client
while(cursor.hasNext()){
    client = cursor.next();
    days_since_last_update = Math.round(Math.abs((new Date() - client.vars.time_updated) / day)); 
    if(days_since_last_update > last_order){
        client.vars.finalized = 1;
        client.save();
        // retrieve the phone number associated with the order
        
        // outgoing text to client: your order has been finalized, call the hotline if you need assistance
        project.sendMessage({
            message_type : 'ussd',
            content : 'The TUBURA order entered for account $ACCOUNT has been marked as final. Please call 2580 if you need assistance.', // Translate, etc
            vars : {'$ACCOUNT' : client.vars.account_number},
            to_number : '??', // need to retrieve the user's phone -- if in Roster?
        });
        return;
    }
    else{
        return;
    }
}
