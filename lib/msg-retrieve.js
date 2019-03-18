/*
lib module for retrieving by outgoing messages by language
lang options now are EN, KI - can be generalized
function should takes a message 'name', and return the message translation in the corresponding lang
opts should include any additions or changes to the message string - for example, inserting client credit, etc - in order of insertion
opts should be an object - the keys will be the search strings for the regex, and the values will be the replacement strings.
ensure that keys are unique
requires a table in TR with a column for message name, and one column each for each implemented language
order of insertion of opts *must* be consisten across langs
*/

module.exports.get_message = function(msg_lang, msg_name, opts = {}, console_lang = 'en'){
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
            var keys = Object.keys(opts);
            if(keys.length > 0){
                for(k in keys){
                    var regex = RegExp(k);
                    output = output.replace(regex, opts[k]);
                    con_msg = con_msg.replace(regex, opts[k]);
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
