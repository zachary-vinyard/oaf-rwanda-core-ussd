var geo_select = require('./lib/cta-geo-select');
var geo_process = require('./lib/cta-geo-string-processer');
var geo_data = require('./dat/rwanda-tubura-geography');
var msgs = require('./lib/msg-retrieve');
var msgs = require('./lib/msg-retrieve');

const max_digits_for_account_number = project.vars.max_digits_an;

global.main = function () {

    var geo_list = geo_process(geo_data);
    state.vars.current_menu = JSON.stringify(geo_list);
    sayText(msgs('train_main_splash', geo_list));
    promptDigits('district', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
};

addInputHandler('district', function(input){
    sayText('you have entered'+ input);
});