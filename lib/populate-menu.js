/*
function for populating a USSD menu
takes as input a table + a lang
tables accessed by this function should have a field for each lang, plus an 'option_number' and 'option_name' field
option number is the numbered option that will apear in the menu
option name is the name of the response handler that will handle the selected option
*/

module.exports = function(table_name, lang){
    try{
        var settings = project.getOrCreateDataTable('ussd_settings'); // need something along the lines of a data table attach???
        var lang = lang || settings.queryRows({'vars' : {'settings' : 'lang'}}).next().vars.value;
        var console_lang = settings.queryRows({'vars' : {'settings' : 'console_lang'}}).next().vars.value;
        var next_prev_tab_name = settings.queryRows({'vars' : {'settings' : 'next_page_table_name'}}).next().vars.value;
        var next_prev_tab = project.getOrCreateDataTable(next_prev_tab_name);
        var next_page = next_prev_tab.queryRows({'vars' : {'name' : 'next_page'}}).next().vars[lang];
        var prev_page = next_prev_tab.queryRows({'vars' : {'name' : 'prev_page'}}).next().vars[lang];
    }
    catch(error){
        var lang = 'en';
        var console_lang = 'en';
        admin_alert = require('./admin-alert');
        admin_alert('Options table incomplete\nError: ' + error);
    }
    var output = '';
    var console_output = '';
    var menu_table = project.getOrCreateDataTable(String(table_name));
    var option_numbers = menu_table.countRowsByValue('option_number');
    var out_obj = {};
    var loc = 0;
    for(var x = 1; x <= Object.keys(option_numbers).length; x++){
        try{
            var opt_row = menu_table.queryRows({'vars' : {'option_number' : x}}).next();
            var temp_out = output + String(x) + ")" + opt_row.vars[lang] + '\n';
            if(temp_out.length < 140){
                output = output + String(x) + ")" + opt_row.vars[lang] + '\n';
            }
            else{
                out_obj[loc] = output + next_page;
                output = prev_page + '\n' + String(x) + ")" + opt_row.vars[lang] + '\n'
                loc = loc + 1;
            }
            console_output = console_output + String(x) + ")" + opt_row.vars[console_lang] + '\n';
        }
        catch(error){
            admin_alert = require('./admin-alert');
            admin_alert('Options table length does not match option labeling\nError: ' + error+'\ntable : ' + table_name);
            break;
        }
    }
    if(Object.keys(out_obj).length > 0){
        return out_obj;
    }
    else{
        return output;
    }
}
