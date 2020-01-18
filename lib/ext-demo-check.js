/*
    Script: ext-demo-check.js
    Description: returns true if the current demographic question has been answered.
    Status: in progress
*/

module.exports = function(){
    // load session row for relevant village ID
    var session_table = project.getOrCreateDataTable('USSD Menu AMA and GUS');
    var session_cursor = session_table.queryRows({
        vars        : { 'villageid' : state.vars.vid,
                        'VilValid'  : 'Valid'},
        sort_dir    : 'desc'
    });

    // check completed row
    var demo_array = ['DemoPlotAmount', 'DemoPlotSize', '']

}