/*
function for populating a USDD menu
takes as input a table + a lang
every table should exist in TR. lang options should be available as used
*/

module.exports = function(table, lang){
    try{
        var settings = project.getOrCreateDataTable('ussd_settings'); // can maybe move this out into another module
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
    var menu_table = project.getOrCreateDataTable(table);
    var t = menu_table.countRowsByValue('option_number');
    console.log(JSON.stringify(t));
    //var cursor = menu_table.queryRows('')
}