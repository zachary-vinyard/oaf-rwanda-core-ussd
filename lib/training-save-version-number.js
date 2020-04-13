
module.exports = function(){
    // load in relevant tables
    var session_table = project.getOrCreateDataTable('Training_survey');
    var session_cursor = session_table.queryRows({
        from_number : contact.phone_number, 
         vars        : {
                         'status' : 'complete',
                         'survey_code': state.vars.survey_type},
        sort_dir    : 'desc'
    });
    if(session_cursor.hasNext() & !state.vars.test){
        row = session_cursor.next();
        call.vars.attempt = parseInt(row.vars.attempt);
        console.log("has");
        }
    else{
        call.vars.attempt = 1 ;
        console.log("has not");
    }

}