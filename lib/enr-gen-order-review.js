/*
module to generate order review string from client row and input menu string
*/

// load in different modules
var account_verify = require('./account-verify');
var get_balance = require('./cor-get-balance');
var messager = require('./enr-messager');
var msgs = require('./msg-retrieve');
var settings_table = project.getOrCreateDataTable('ussd_settings');
const lang = settings_table.queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;

// save options for calculating prepayment
const repayment_calc_options = {
    'Input_Table_20B'   : rgo_prepayment_calc,
    'default'           : core_prepayment_calc
};

// calculate prepayment based on Ruhango rules
function rgo_prepayment_calc(client, input_menu_name){
    var new_client = client.vars.new_client;
    if(!new_client){
        // returning client prepayment: 60% of 20A total credit eligibility, but this won't stop them from ordering
        // save client json and retrieve balance
        account_verify(client.vars.account_number);
        var client_object = get_balance(JSON.parse(state.vars.client_json), 'ki');
        var balance = client_object["$BALANCE"];
        var credit = client_object["$CREDIT"];
        // calculate necessary figures
        const req_perc = 0.6;
        var perc_repaid = (credit - balance) / credit;
        var remainder = (perc_repaid - req_perc) * credit;
        // if perc_repaid is over 0.60, client is eligible to take inputs; else message them
        if(perc_repaid < req_perc){
            // send client a message saying that they need to pay 60% of 20A credit
            var enr_repayment_sms = msgs('enr_repayment_alert', {'$REMAINDER' : remainder}, lang);
            messager(client.vars.user_pn, enr_repayment_sms);
        }
    }
    else{
        // new client prepayment: 30% of 20B credit
        var input_table = project.getOrCreateDataTable(input_menu_name);
        //var percent = parseFloat(project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'rgo_prep_perc'}}).next().value);
        var percent = .3; //this isn't loading correctly from the table so hard coding for now
        var products = input_table.countRowsByValue('input_name');
        var price = 0;
        for(prod in products){
            var prod_row = input_table.queryRows({'vars' : {'input_name' : prod}}).next();
            if(parseFloat(client.vars[prod_row.vars.input_name]) > 0){
                if(prod == 'shs_20a'){
                    price += 18625; //using this because our prices arent consistent!!
                    //prep += parseFloat(client.vars[prod_row.vars.input_name]) * parseFloat(prod_row.vars.price) * 0.25;
                }
                else{
                    price += parseFloat(client.vars[prod_row.vars.input_name]) * parseFloat(prod_row.vars.price);
                }
            }
        }
    }
    var prepayment = price * percent;
    var enr_repayment_sms = msgs('enr_prepayment_alert', {'$PREPAYMENT' : prepayment}, lang);
    messager(client.vars.user_pn, enr_prepayment_sms);
    return prepayment;
}

function core_prepayment_calc(client_row, input_menu_name){
    console.log('trying core prep calc on : ' + client_row + ' ' + input_menu_name);
    throw 'Passing on prepayment for the moment here';
}

module.exports = function(account_number, input_menu_name, an_table, lang, max_chars){ //here there be tygers
    var get_client = require('./enr-retrieve-client-row');
    var client = get_client(account_number, an_table);
    max_chars = max_chars || 130;
    var settings = project.getOrCreateDataTable('ussd_settings'); // can maybe move this out into another module
    var next_prev_tab_name = settings.queryRows({'vars' : {'settings' : 'next_page_table_name'}}).next().vars.value;
    var next_prev_tab = project.getOrCreateDataTable(next_prev_tab_name);
    var next_page = next_prev_tab.queryRows({'vars' : {'name' : 'next_page'}}).next().vars[lang] || '77)Next';
    var input_table = project.getOrCreateDataTable(input_menu_name);
    var products = input_table.countRowsByValue('input_name');
    var msgs = require('./msg-retrieve');
    var pre_str = ''
    try{
        pre_str = msgs('enr_prepayment', {'$PREP' : repayment_calc_options[input_menu_name](client, input_menu_name)}, lang) || ' ';
        console.log('prepayment string is : "' + pre_str + ' "');
    }
    catch(err){
        console.log(err);
        pre_str = '';
    }
    var outstr = client.vars.name1 + ' ' + client.vars.name2 + '\n' + pre_str + '\n';
    var outobj = {}
    var loc = 0;
    for(prod in products){
        var prod_row = input_table.queryRows({'vars' : {'input_name' : prod}}).next();
        if(parseFloat(client.vars[prod_row.vars['input_name']]) > 0){
            tempstr = prod_row.vars[lang]+':'+client.vars[prod_row.vars['input_name']]+' ' +prod_row.vars.unit+' - '+(parseFloat(client.vars[prod_row.vars['input_name']])*parseFloat(prod_row.vars.price))+'RWF';
            if((outstr + tempstr + next_page).length > max_chars){
                outobj[loc] = outstr + '\n' + next_page;
                outstr = tempstr;
                loc = loc + 1;
            }
            else{
                outstr = outstr + '\n' + tempstr;
            }
        }
    }
    if(Object.keys(outobj).length > 0){
        outobj[loc] = outstr + '\n' + next_page
        return outobj;
    }
    else if(outstr.length > 0){
        return outstr;
    }
    else{
        var msgs = require('./msg-retrieve');
        return msgs('enr_empty_order_review', {}, lang);
    }
};
