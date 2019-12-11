/*
    Script: ext-num-validation.js
    Description: ??
    Status: mid-conversion
*/

if(!isNaN(state.vars.number.replace(/\s/g,""))){
    return_value = 1;
}
else{
    return_value = 0;
}
console.log('Running number validation. result: '+ return_value);