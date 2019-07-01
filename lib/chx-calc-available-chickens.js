/*
function for calculating available chickens
needs some work
*/

module.exports = function(account_number, client, chx_client_table_loc){ //client should be an object
    var get_balance = require('./cor-get-balance');
    var balance_info = get_balance(client);
    var paid = balance_info.$PAID;
    var chx_client_table = project.getOrCreateDataTable(chx_client_table_loc)
    var cursor = chx_client_table.queryRows({'vars' : {'account_number' : account_number}});
    if(cursor.hasNext()){
        var client_row = cursor.next();
        var ordered_chickens = parseInt(client_row.vars.ordered_chickens);
        console.log('ordered_chickens ' + ordered_chickens)
        if(ordered_chickens > 15){
            ordered_chickens = 15;
        }
        if(client_row.vars.confirmed_chickens > 0){
            return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : 0}
        }
        var prep_check = 0;
        if(client_row.vars.chicken_only === 1){
            if((paid / 500) >= ordered_chickens){
                prep_check = ordered_chickens;
            }
            else{
                prep_check = Math.floor(paid / 500)
            }
        }
        else{
            prep_check = Math.max(Math.floor((paid - parseInt(client_row.vars.required_prepayment)) / 500), 0);
        }
        if(prep_check === NaN){
            throw 'Prep_check is NaN';
        }
        var chx_num = (prep_check >= ordered_chickens) ? ordered_chickens : prep_check;
        console.log('chx_num ' + chx_num)
        return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : chx_num}
    }
    else{
        return {'$NAME' : balance_info.$CLIENT_NAME, '$CHX_NUM' : 0}; // returning 0 should signify that the client is not a chicken client
    }
};
