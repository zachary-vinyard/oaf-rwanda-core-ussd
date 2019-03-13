var admin_email = project.getOrCreateDataTable('admin_emails').queryRows({'name' : 'zach'}).next().vars.email;
var chick_loc_info = project.getOrCreateDataTable('chick_loc_info');
var cursor = chick_loc_info.queryRows({vars : {'site' : state.vars.client_site}});
if(!cursor.hasNext()){
    sendEmail(admin_email, 'Chicken problems','chicken get agent row 2');
}
var loc = cursor.next();
$agent_loc = loc.vars.agent_loc;
$agent_cell = loc.vars.agent_cell;
$agent_village = loc.vars.agent_village;