module.exports = function(glus_id, an_table_name){
    var an_table = project.getOrCreateDataTable(an_table_name);
    var group = an_table.queryRows({vars : {'glus_id' : glus_id}});
    if(group.count() > 1){
        return false;
    }
    else{
        return true;
    }
};
