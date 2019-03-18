/*
admin alert module
relies on 'admin_emails' table in Telerivet
defaults to 'default' which will send to ZV
*/

module.exports.admin_alert = function(title = 'Telerivet Error', content = 'error - no content supplied', name = 'default'){
    try{
        var cursor = project.getOrCreateDataTable('admin_emails').queryRows({'name' : name})
        if(cursor.hasNext()){
            admin_email = cursor.next().vars.email;
            sendEmail(admin_email, title, content);
        }
        else{
            throw 'ADMIN ALERT FAILED: No user ' + name + ' in admin database'
        }
    }
    catch(error){
        console.log(error);
    }
}