/*
function for calculating available chickens
needs some work
*/

var admin_alert = require('./admin-alert');

module.exports = function(account_number, client, chx_client_table_loc){ //client should be an object
    var get_balance = require('./cor-get-balance');
    var balance_info = get_balance(client);
    var paid = balance_info.$PAID;
    console.log('paid: ' + paid)
    var chx_client_table = project.getOrCreateDataTable(chx_client_table_loc)
    var cursor = chx_client_table.queryRows({'vars' : {'account_number' : account_number}});
    // if client account number is in the chicken table, execute this code block
    if(cursor.hasNext()){
        var client_row = cursor.next();
        var ordered_chickens = parseInt(client_row.vars.ordered_chickens);
        // client order cannot exceed 15 chickens
        if(ordered_chickens > 15){
            ordered_chickens = 15;
        }
        // ?? does this have to do with clients who have already confirmed their order?
        if(client_row.vars.confirmed_chickens > 0){
            return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : 0}
        }
        // if the client is chicken only, they are eligible for one chicken for every 500 RwF paid
        var prep_check = 0;
        if(client_row.vars.chicken_only === 1){
            if((paid / 500) >= ordered_chickens){
                prep_check = ordered_chickens;
            }
            else{
                prep_check = Math.floor(paid / 500);
            }
        }
        // if the client is in core, they are eligible for one chicken per 500 RwF of what they've paid less their core balance
        else{
            try{
                //var req_prep = client_row.vars.required_prepayment || 0; // dealing with possible data inconsistency
                //prep_check = Math.max(Math.floor((paid - parseInt(req_prep)) / 500), 0);
                var req_paid = client_rows.vars.required_prepayment || 0;
                var amount_paid = client_rows.vars.amount_paid || 0;
                prep_check = Math.max(Math.floor((amount_paid - parseInt(req_paid)) / 500), 0);
            }
            catch(error){
                console.log(error);
                admin_alert('failure on chicken math. error is : ' + error, 'Telerivet chicken error')
                var req_paid = 0;
                prep_check = Math.max(Math.floor((amount_paid - parseInt(req_paid)) / 500), 0);
            }
        }
        if(prep_check === NaN){
            admin_alert('prep_check is NaN for AN: ' + account_number);
            throw 'Prep_check is NaN';
        }
        var chx_num = (prep_check >= ordered_chickens) ? ordered_chickens : prep_check;
        return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : chx_num}
    }
    else{
        return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : 0}; // returning 0 should signify that the client is not a chicken client
    }
};
