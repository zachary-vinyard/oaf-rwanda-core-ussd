module.exports = function(client, glus_id, an_table_name){
    var an_table = project.getOrCreateDataTable(an_table_name);
    var group = an_table.queryRows({vars : {'glus_id' : glus_id}});
    if(group.count() > 1){
        return false;
    }
    else{
        client = an_table.queryRows({vars : {'account_number' : client}}).next(); //assumes that this client has been saved already
        client.vars.group_leader = 1;
        client.save()
        return true;
    }
};
