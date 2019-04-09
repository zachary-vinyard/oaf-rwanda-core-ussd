/*
messaging module for enr
*/

module.exports = function(phone_number, message){
    var settings = project.getOrCreateDataTable('ussd_settings')
    var msg_route = settings.queryRows({'vars' : {'settings' : 'sms_push_route'}}).next().vars.value;
    project.sendMessage({'to_number' : phone_number,'route_id' : msg_route, 'content' : message});
}
