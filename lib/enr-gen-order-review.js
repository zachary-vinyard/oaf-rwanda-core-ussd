/*
module to generate order review string from client row and input menu string
*/

const repayment_calc_options = {
    'RGO_Input_Table_20A'  : rgo_prepayment_calc,
    'Input_Table_20A'      : rgo_prepayment_calc,
    'default'              : core_prepayment_calc
};

function rgo_prepayment_calc(client, input_menu_name){
    var input_table = project.getOrCreateDataTable(input_menu_name);
    var percent = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'rgo_prep_perc'}}).next().value;
    var products = input_table.countRowsByValue('input_name');
    var prep = 0;
    for(prod in products){
        var prod_row = input_table.queryRows({'vars' : {'input_name' : prod}}).next();
        if(parseFloat(client.vars[products.vars['input_name']]) > 0){
            prep += parseFloat(client.vars[prod_row.vars['input_name']])*parseFloat(prod_row.vars.price);
        }
    }
    return prep*percent;
}

function core_prepayment_calc(client_row, input_menu_name){
    var input_table = project.getOrCreateDataTable(input_menu_name);
    var percent = project.getOrCreateDataTable('ussd_settings').queryRows({'vars' : {'settings' : 'rgo_prep_perc'}})
    var get_client = require('./enr-retrieve-client-row');
    var client = get_client(account_number, an_table);
    var products = input_table.countRowsByValue('input_name');
    var prep = 0;
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
    }
    catch(err){
        console.log(err);
        pre_str = '';
    }
    var outstr = client.vars.name1 + ' ' + client.vars.name2 + '\n' + pre_str + '\n';
    var outobj = {}
    var loc = 0;
    for(prod in products){
        console.log(prod)
        var prod_row = input_table.queryRows({'vars' : {'input_name' : prod}}).next();
        console.log(prod_row);
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
