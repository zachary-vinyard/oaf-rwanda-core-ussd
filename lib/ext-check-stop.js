/*
    Script: ext-check-stop.js
    Description: resets the survey if user hits 9999 or has word "stop"
    Status: in progress
*/

module.exports = function(input){
    // list of possible options
    var stop_list = ['9', '9999', '99', 'stop', 'Stop', 'STOP'];

    // end survey if input is in the stop list
    if(input in stop_list){
        call.vars.completed = false;
        sayText('Murakoze');
    }
}