
module.exports = function(response){
    // load in relevant tables
    var session_table = project.getOrCreateDataTable('Training_survey');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
         vars        : {
                         'status' : {'eq' : 'complete'}},
        sort_dir    : 'desc'
    });
    if(session_cursor.hasNext() & !state.vars.test){
        row = session.next();
        call.vars.attempts = row.vars.attempts;
    }
    else{
        call.vars.attempts = 1 ;
    }

}