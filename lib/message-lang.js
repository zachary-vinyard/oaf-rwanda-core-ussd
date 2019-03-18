/*
lib module for retrieving by outgoing messages by language
options now are EN, KI - can be generalized
function should takes a message 'name', and return the message translation in the corresponding lang
requires a table in TR with a column for message name, and one column each for each implemented language
*/

module.exports.get_message = function(msg_name, msg_lang){
    var output = '';
    try{
        var messages = project.getOrCreateDataTable('message_translations');
        var cursor = messages.queryRows({
            vars: {
                name : msg_name,
                lang : msg_lang
            }
        });
        if(cursor.hasNext()){
            output = cursor.next().vars[msg_lang];
        }
        else{
            throw 'Message ' + msg_name + ' | ' + msg_lang + ' not found';
        }
    }
    catch(error){
        console.log('Error: ' + error);
        var error_msg = {'en' : 'Error. Call TUBURA at 2580', 'ki' : 'TUBURA : Hamagara 2580'}
        output = error_msg[msg_lang];
    }
    finally{
        return output;
    }
}
