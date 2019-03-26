/*
todo - convert object.keys into menu for geo loc
*/

module.exports = function(branch){
    if ('fo_name' in branch){
        return branch
    }
    else{
        k = Object.keys(branch);
        out_str = ''
        for(i = 0; i < k.length; i++){
            out_str = out_str + i + ': ' + k[i] + '\n';
        }
    }
}