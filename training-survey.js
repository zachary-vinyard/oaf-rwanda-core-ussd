
var msgs = require('./lib/msg-retrieve');

const max_digits_for_account_number = project.vars.max_digits_an;

global.main = function () {
    sayText(msgs('cor_main_splash'));
    promptDigits('account_number_splash', { 'submitOnHash' : false,
                                            'maxDigits'    : max_digits_for_account_number,
                                            'timeout'      : 180 });
};

addInputHandler('account_number_splash', function(input){
    sayText('you have entered'+input);
});