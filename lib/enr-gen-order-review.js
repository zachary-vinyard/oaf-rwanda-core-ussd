/*
module to generate order review string from client row and input menu string
*/

module.exports = function(account_number, input_menu_name, an_table, lang){
    var get_client = require('./enr-retrieve-client-row');
    var client = get_client(account_number, an_table);
    var settings = project.getOrCreateDataTable('ussd_settings'); // can maybe move this out into another module
    var next_prev_tab_name = settings.queryRows({'vars' : {'settings' : 'next_page_table_name'}}).next().vars.value;
    var next_prev_tab = project.getOrCreateDataTable(next_prev_tab_name);
    var next_page = next_prev_tab.queryRows({'vars' : {'name' : 'next_page'}}).next().vars[lang] || '77)Next';
    var input_table = project.getOrCreateDataTable(input_menu_name);
    var products = input_table.countRowsByValue('input_name');
    var outstr = ''
    var outobj = {}
    var loc = 0;
    for(prod in products){
        console.log(prod)
        var prod_row = input_table.queryRows({'vars' : {'input_name' : prod}}).next();
        console.log(prod_row);
        if(parseFloat(client.vars[prod_row.vars['input_name']]) > 0){
            tempstr = prod_row.vars[lang]+' : '+client.vars[prod_row.vars['input_name']]+' ' +prod_row.vars.unit+' - '+(parseFloat(client.vars[prod_row.vars['input_name']])*prod_row.vars.price)+'RWF';
            if((outstr + tempstr + next_page).length > 140){
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