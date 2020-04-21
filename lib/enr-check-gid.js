

module.exports = function(gid, table_name,lang){
    var data_table = project.getOrCreateDataTable(table_name);
    var districtId = gid.slice(0,5);
    var siteId = gid.slice(5,8);
    var groupId = gid.slice(8,(status.length));
    var id = districtId + '-' + siteId + '-'+ groupId;
    var districtName = '';
    var siteName = '';
    var groupName = '';

    var cursor = data_table.queryRows({'vars' : {'group_code' : id}})
    if(id === null){
        throw 'ERROR: null group code';
    }
    else if(cursor.hasNext()){

        var row = cursor.next();
        districtName = row.vars.district;
        siteName = row.vars.site;
        groupName = row.vars.group;
        var msgs = require('./msg-retrieve');
        return msgs('enr_group_id_info',{'$DISTRICT' : district, '$SITE': siteName, '$GROUP': groupName},lang);
    }
    else{
        return null;
    }
};