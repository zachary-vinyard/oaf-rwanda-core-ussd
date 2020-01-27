/*
    Script: chx-check-eligibility.js
    Description: returns message based on how many chickens a client is eligible for
    Status: mid-update
*/

var admin_alert = require('./admin-alert');

module.exports = function(client){ 
    // retrieve client's balance information
    var get_balance = require('./cor-get-balance');
    var balance_info = get_balance(client);
    var paid = balance_info.$PAID;
    var req_percent = 0.6;
    var chx_price = 500; 
    console.log('paid: ' + paid)

    // retrieve A season credit and balance data
    const arrayLength = client.BalanceHistory.length;
    if(arrayLength > 1){
        const index = arrayLength - 1;
        var balance = client.BalanceHistory[index].Balance;
        var credit = client.BalanceHistory[index].TotalCredit;
        var paid = credit - balance;
    }

    // if client has not met 60% of A season credit, they are eligible for 0 chickens
    var percent_paid = paid / credit;
    var amount_over = paid - req_percent * credit;
    var chx_num = Math.floor(amount_over / chx_price);
    console.log('amount over: ' + amount_over + ' paid: ' + paid + ' credit: ' + credit + ' chx_num: ' + chx_num);

    // make sure that the max number stays within bounds
    if(percent_paid < req_percent || chx_num < 2){
        chx_num = 0;
    }
    else{
        if(chx_num > 5){
            chx_num = 5;
        }
    }
    return chx_num; // possibly update so that this returns the message
};
