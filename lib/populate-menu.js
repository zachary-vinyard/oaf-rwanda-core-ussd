/*
function for populating a USDD menu
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
    }
    catch(error){
        var lang = 'en';
        var console_lang = 'en';
        admin_alert = require('./admin-alert');
        admin_alert('Options table incomplete\nError: ' + error);
    }
    var output = '';
    var console_output = '';
    console.log(table_name);
    var menu_table = project.getOrCreateDataTable(String(table_name));
    var option_numbers = menu_table.countRowsByValue('option_number');
    for(x in option_numbers){
        var opt_row = menu_table.queryRows({'vars' : {'option_number' : x}}).next();
        console.log(x + " : " + JSON.stringify(opt_row))
        output = output + String(x) + ": " + opt_row.vars[lang] + '\n';
        console_output = console_output + String(x) + ": " + opt_row.vars[console_lang] + '\n';
    }
    console.log(console_output);
    return output;
}
