/*
messaging module for CTA
*/

module.exports = function(fo_dat, client_dat){
    var settings = project.getOrCreateDataTable('ussd_settings')
    var msg_route = settings.queryRows({'vars' : {'settings' : 'sms_push_route'}}).next().vars.value;
    var cta_live = parseInt(settings.queryRows({'vars' : {'settings' : 'cta_live'}}).next().vars.value);
    var fo_phone = fo_dat['$FO_PHONE'];
    var client_phone = client_dat['$CLIENT_PHONE'];
    var msgs = require('./msg-retrieve');
    var client_message_content = "";
    if(!(fo_phone === 0)){
        var fo_message_content = msgs('cto_fo_message_content', client_dat); //need to fix this line
        if(cta_live === 0){ //if project is not live defaults to sending messages to zach + anisha
            fo_phone = settings.queryRows({'vars' : {'settings' : 'zach_phone'}}).next().vars.value;
            var anisha_phone = settings.queryRows({'vars' : {'settings' : 'anisha_phone'}}).next().vars.value;
            project.sendMessage({'to_number' : anisha_phone, 'route_id' : msg_route, 'content' : fo_message_content});
        }
        client_message_content = msgs('cto_fo_information', fo_dat);
        project.sendMessage({'to_number' : fo_phone, 'route_id' : msg_route, 'content' : fo_message_content});
    }
    else{
        client_message_content = msgs('cto_no_fo', fo_dat);
    }
    project.sendMessage({'to_number' : client_phone,'route_id' : msg_route, 'content' : client_message_content});
}
