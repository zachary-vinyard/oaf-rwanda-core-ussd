/*
module to generate order review string from client row and input menu string
*/

module.exports = function(client, input_menu_name, lang){
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
        var prod_row = input_table.queryRows(prod).next();
        console.log(JSON.stringify(prod_row));
        if(parseFloat(client.vars[prod_row.vars[prod]]) > 0){
            tempstr = prod_row[lang]+' : '+client.vars[prod_row.vars['input_name']]+' ' +prod_row.vars.unit+' - '+(parseFloat(client.vars[prod_row.vars['input_name']])*prod_row.vars.price)+'RWF';
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
    else{
        return outstr;
    }
};