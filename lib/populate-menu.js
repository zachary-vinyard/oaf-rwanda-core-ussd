/*
function for populating a USDD menu
takes as input a table + a lang
every table should exist in TR. lang options should be available as used
*/

module.exports = function(table, lang){
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
    console.log(table);
    var menu_table = project.getOrCreateDataTable(table);
    var option_numbers = Object.keys(menu_table.countRowsByValue('option_number'));
    for(x in option_numbers){
        var opt_row = menu_table.queryRows({'vars' : {'option_number' : x}}).next();
        console.log(x + " : " + JSON.stringify(opt_row))
        output = output + String(x) + ": " + opt_row.vars[lang];
        console_output = console_output + String(x) + ": " + opt_row.vars[console_lang];
    }
    console.log(console_output);
    return output;
}
