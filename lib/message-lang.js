/*
lib module for retrieving by outgoing messages by language
use this for simple messages that do not require modification or insertion of other variables
options now are EN, KI - can be generalized
function should takes a message 'name', and return the message translation in the corresponding lang
requires a table in TR with a column for message name, and one column each for each implemented language
*/

module.exports.get_message = function(msg_name, msg_lang, opts = [], regex = /xxx/, console_lang = 'en'){
    var output = '';
    try{
        var messages = project.getOrCreateDataTable('message_translations');
        var cursor = messages.queryRows({
            vars: {
                name : msg_name,
            }
        });
        if(cursor.hasNext()){
            var msg_row = cursor.next();
            var output = msg_row.vars[msg_lang];
            var con_msg = msg_row.vars[console_lang];
            if(opts.length > 0){
                for(opt in opts){
                    output = output.replace(regex, opts[opt]);
                    con_msg = con_msg.replace(regex, opts[opt]);
                }
            }
            console.log(con_msg);
        }
        else{
            throw 'Message ' + msg_name + ' | ' + msg_lang + ' not found';
        }
    }
    catch(error){
        console.log('Error: ' + error);
        if(msg_lang != 'en' || msg_lang != 'ki'){ //checks for msg_lang and sets to en if en or ki not found.
            msg_lang = 'en';
        }
        var error_msg = {'en' : 'Error. Call TUBURA at 2580', 'ki' : 'TUBURA : Hamagara 2580'}
        output = error_msg[msg_lang];
    }
    finally{
        return output;
    }
}
