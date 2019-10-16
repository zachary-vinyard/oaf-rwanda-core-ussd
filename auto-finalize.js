/*
    Script: auto-finalize.js
    Description: labels client USSD orders as finalized if they haven't been changed in a given timeframe
    Status: in progress
*/

// load necessary tables and modules
var client_table = project.getOrCreateDataTable('20b_client_data');
var enr_table = project.getOrCreateDataTable('Enrollment - Core + RGO');
const last_order = 7; // number of days before an order gets finalized; can store in telerivet
const day = 24 * 60 * 60 * 1000; // milliseconds in one day, used for date subtraction

// filter client table for unfinalized clients who have ordered
var cursor = client_table.queryRows({'vars' : 
            {   'finalized'     : 0,
                'placed_order'  : 1
            }
});

// update finalized to 1 and alert client
while(cursor.hasNext()){
    client = cursor.next();
    days_since_last_update = Math.round(Math.abs((new Date() - client.vars.time_updated) / day)); 
    if(days_since_last_update > last_order){
        client.vars.finalized = 1;
        client.save();
        // send outgoing USSD message to client
        client_phone = enr_table.queryRows({'vars' : {'enr_order_start' : client.vars.account_number}}).next().from_number;
        project.sendMessage({
            message_type : 'ussd',
            content : 'The TUBURA order entered for account $ACCOUNT has been marked as final. Please call 2580 if you need assistance.', // Translate, store, etc
            vars : {'$ACCOUNT' : client.vars.account_number},
            to_number : client_phone
        });
        return;
    }
    else{
        return;
    }
}
