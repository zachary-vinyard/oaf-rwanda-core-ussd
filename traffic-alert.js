/*
recurring traffic alert for telerivet
*/

global.main = function(){
    cursor = project.queryMessages({message_type: "call", sort_dir: "desc"});
    cursor.limit(1);
    var Row = cursor.next();
    var now = moment().format('X');
    dif_min = (now - Row.time_updated)/60;
    console.log("Last message reveived in " + dif_min +" minutes");
    if (dif_min > 15){
        var subject = "ALERT: No traffic on USSD service the last 15 min";
        var body = "No traffic on USSD service the last 15 min please check https://telerivet.com/p/8799a79f/messages for more information";
        var admin_alert = require('./lib/admin-alert');
        admin_alert(body, subject);
        admin_alert(body, subject, 'norbert');
        admin_alert(body, subject, 'tom');
        admin_alert(body, subject, 'ammar');
        admin_alert(body, subject, 'africas_talking');
    }
};
