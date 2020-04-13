
module.exports = function(){
    // load in relevant tables
    var session_table = project.getOrCreateDataTable('Training_survey');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
         vars        : {
                         'status' : {'eq' : 'complete'},
                         'survey_code':{'eq': state.vars.survey_type}},
        sort_dir    : 'desc'
    });
    if(session_cursor.hasNext()){
        row = session_cursor.next();
        call.vars.attempt = ParseInt(row.vars.attempt);
    }
    else{
        call.vars.attempt = 1 ;
    }

}