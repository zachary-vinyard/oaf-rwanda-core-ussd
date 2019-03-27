/*
todo - convert object.keys into menu for geo loc
*/

module.exports = function(branch){
    if ('fo_name' in branch){
        return {'$FO_NAME' : branch['fo_name'], '$FO_PHONE' : branch}
    }
    else{
        k = Object.keys(branch);
        out_str = ''
        for(i = 1; i < k.length + 1; i++){
            out_str = out_str + i + ': ' + k[i-1] + '\n';
        }
        return {'$GEO_MENU' : out_str};
    }
}