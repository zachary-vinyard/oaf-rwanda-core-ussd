

module.exports = function(gid, table_name,lang){
    console.log('group Id'+gid);
    var data_table = project.getOrCreateDataTable(table_name);
    var districtId = gid.slice(0,5);
    var siteId = gid.slice(5,8);
    var groupId = gid.slice(8,(gid.length));
    var id = districtId + '-' + siteId + '-'+ groupId;
    var districtName = '';
    var siteName = '';
    var groupName = '';

    console.log('district'+ districtId +'siteId'+siteId+'groupId'+groupId);

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
        console.log('district', districtName+'siteId'+siteName+'groupId'+groupName);
        return msgs('enr_group_id_info',{'$DISTRICT' : districtName, '$SITE': siteName, '$GROUP': groupName},lang);
    }
    else{
        return null;
    }
};