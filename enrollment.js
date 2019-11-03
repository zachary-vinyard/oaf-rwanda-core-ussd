/*
main module for all enrollment functions in OAF Rwanda
including core, expansion, and Ruhango
input handler IDs must match the associated menu tables. if input handlers are not available, functions will fail
*/

var msgs = require('./lib/msg-retrieve');
var populate_menu = require('./lib/populate-menu');
var get_menu_option = require('./lib/get-menu-option');
var get_client = require('./lib/enr-retrieve-client-row');
var get_time = require('./lib/enr-timestamp');

/*
global options - feel free to refactor someday
ideally we want something that allows for attaching these datatables by a user? or we should just document this to make it a bit more portable
*/
var settings_table = project.getOrCreateDataTable('ussd_settings');
const lang = settings_table.queryRows({'vars' : {'settings' : 'enr_lang'}}).next().vars.value;
const an_pool = settings_table.queryRows({'vars' : {'settings' : 'enr_client_pool'}}).next().vars.value;
const glus_pool = settings_table.queryRows({'vars' : {'settings' : 'glus_pool'}}).next().vars.value;
const geo_menu_map = settings_table.queryRows({'vars' : {'settings' : 'geo_menu_map'}}).next().vars.value;
const enr_splash = settings_table.queryRows({'vars' : {'settings' : 'enr_splash'}}).next().vars.value;
const timeout_length = parseInt(settings_table.queryRows({'vars' : {'settings' : 'timeout_length'}}).next().vars.value);
const max_digits_for_input = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits'}}).next().vars.value); //only for testing
const max_digits_for_nid = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_nid'}}).next().vars.value); 
const max_digits_for_pn = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_pn'}}).next().vars.value); 
const max_digits_for_glus = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_glvv'}}).next().vars.value); 
const max_digits_for_name = parseInt(settings_table.queryRows({'vars' : {'settings' : 'max_digits_name'}}).next().vars.value); 

/*
main function
*/
global.main = function(){
    state.vars.start_time = new Date().toString(); 
    var splash_menu = populate_menu(enr_splash, lang, 300);
    var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
    state.vars.current_menu_str = current_menu;
    state.vars.session_authorized = false;
    sayText(current_menu);
    promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
};

addInputHandler('enr_splash', function(input){ //input handler for splash - expected inputs in table 'enr_splash' on tr
    state.vars.current_step = 'enr_splash';
    input = parseInt(input.replace(/\D/g,''));
    var selection = get_menu_option(input, state.vars.current_step); //add if selection order inputs, review inputs pass to post auth if already authed
    if(selection == null){
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
    }
    else{
        var current_menu = msgs(selection, {}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits(selection, {'submitOnHash' : false, 'maxDigits' : max_digits_for_nid, 'timeout' : timeout_length})
    }
    get_time();
}); // end of splash

/*
input handlers for registration steps
*/
addInputHandler('enr_reg_start', function(input){ //input is first entry of nid - next step is nid confirm
    state.vars.current_step = 'enr_reg_start';
    input = String(input.replace(/\D/g,''));
    var check_if_nid = require('./lib/enr-check-nid');
    var is_already_reg = require('./lib/enr-check-dup-nid');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else if(!check_if_nid(input)){
        sayText(msgs('enr_invalid_nid', {}, lang));
        promptDigits('enr_reg_start', {'submitOnHash' : false, 'maxDigits' : max_digits_for_nid, 'timeout' : timeout_length})
    }
    else if(is_already_reg(input, an_pool)){
        var get_client_by_nid = require('./lib/dpm-get-client-by-nid');
        var client = get_client_by_nid(input, an_pool);
        var enr_msg = msgs('enr_reg_complete', {'$ACCOUNT_NUMBER' : client.account_number, '$NAME' : client.name1 + ' ' + client.name2}, lang)
        sayText(enr_msg);
        var enr_msg_sms = msgs('enr_reg_complete_sms', {'$ACCOUNT_NUMBER' : client.account_number, '$NAME' : client.name1 + ' ' + client.name2}, lang);
        var messager = require('./lib/enr-messager');
        messager(contact.phone_number, enr_msg_sms);
        if(state.vars.reg_pn){
            messager(state.vars.reg_pn, enr_msg_sms);
        }
        promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
    }
    else{
        state.vars.reg_nid = input;
        sayText(msgs('enr_nid_confirm', {}, lang));
        promptDigits('enr_nid_confirm', {'submitOnHash' : false, 'maxDigits' : max_digits_for_nid, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_nid_confirm', function(input){ //step for dd of nid. input here should match stored nid nee
    state.vars.current_step = 'enr_nid_confirm';// need to add section to check if nid registerd already
    input = String(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else if(state.vars.reg_nid == input){
        sayText(msgs('enr_name_1', {}, lang));
        promptDigits('enr_name_1', {'submitOnHash' : false, 'maxDigits' : max_digits_for_name, 'timeout' : timeout_length});
    }
    else{
        sayText(msgs('enr_unmatched_nid', {}, lang));
        promptDigits('enr_reg_start', {'submitOnHash' : false, 'maxDigits' : max_digits_for_nid, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_name_1', function(input){ //enr name 1 step
    state.vars.current_step = 'enr_name_1';
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    input = input.replace(/[^a-z_]/ig,'');
    if(contact.phone_number == '5550123'){ // allows for testing on the online testing env
        input = 'TEST1'
    }
    if(input === undefined || input == ''){
        sayText(msgs('enr_invalid_name_input', {}, lang));
        promptDigits('enr_name_1',  {'submitOnHash' : false, 'maxDigits' : max_digits_for_name, 'timeout' : timeout_length});
    }
    else{
        state.vars.reg_name_1 = input;
        sayText(msgs('enr_name_2', {}, lang));
        promptDigits('enr_name_2',  {'submitOnHash' : false, 'maxDigits' : max_digits_for_name, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_name_2', function(input){ //enr name 2 step
    state.vars.current_step = 'enr_name_2';
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    input = input.replace(/[^a-z_]/ig,'');
    if(contact.phone_number == '5550123'){ // allows for testing on the online testing env
        input = 'TEST1'
    }
    if(input === undefined || input == ''){
        sayText(msgs('enr_invalid_name_input', {}, lang));
        promptDigits('enr_name_2',  {'submitOnHash' : false, 'maxDigits' : max_digits_for_name, 'timeout' : timeout_length});
    }
    else{
        state.vars.reg_name_2 = input;
        sayText(msgs('enr_pn', {}, lang));
        promptDigits('enr_pn', {'submitOnHash' : false, 'maxDigits' : max_digits_for_pn, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_pn', function(input){ //enr phone number step
    state.vars.current_step = 'enr_pn';
    input = input.replace(/\D/g,'');
    var check_pn = require('./lib/phone-format-check');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    if(check_pn(input)){
        state.vars.reg_pn = input;
        sayText(msgs('enr_glus', {}, lang));
        promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : max_digits_for_glus, 'timeout' : timeout_length});
    }
    else{
        sayText(msgs('invalid_pn_format', {}, lang));
        promptDigits('enr_pn', {'submitOnHash' : false, 'maxDigits' : max_digits_for_pn, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_glus', function(input){ //enr group leader / umudugudu support id step. last registration step
    if(state.vars.current_step == 'entered_groupname'){
        input = state.vars.glus;
    }
    state.vars.current_step = 'enr_glus';
    input = input.replace(/\^W/g,'');
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    state.vars.glus = input;
    var check_glus = require('./lib/enr-check-glus');
    var geo = check_glus(input, glus_pool);
    var check_live = require('./lib/enr-check-geo-active');
    if(geo){
        try{ // get this out of a try block as soon as bandwidth
            if(!check_live(geo, geo_menu_map)){
                sayText(msgs('enr_order_period_finished', {}, lang));
                promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : max_digits_for_glus, 'timeout' : timeout_length});
                return 0;
            }
        }
        catch(error){
            console.log(error);
            var admin_alert = require('./lib/admin-alert');
            admin_alert('error on live - dead check\n' + error);
        }
        var client_log = require('./lib/enr-client-logger');
        state.vars.glus = input;
        var account_number = client_log(state.vars.reg_nid, state.vars.reg_name_1, state.vars.reg_name_2, state.vars.reg_pn, state.vars.glus, geo, an_pool);
        //check if group leader here
        var gl_check = require('./lib/enr-group-leader-check');
        var is_gl = gl_check(account_number, state.vars.glus, an_pool, glus_pool);
        console.log('is gl? : ' + is_gl);
        // if the client is a group leader and the group is not yet named, prompt them to enter a group name
        if(is_gl && state.vars.needs_name){
            sayText(msgs('enr_add_groupname', {}, lang));
            promptDigits('enr_enter_groupname', {'submitOnHash' : false, 'maxDigits' : 60, 'timeout' : timeout_length});
        }
        else{
            var enr_msg = msgs('enr_reg_complete', {'$ACCOUNT_NUMBER' : account_number, '$NAME' : state.vars.reg_name_2}, lang);
            sayText(enr_msg);
            var enr_msg_sms = msgs('enr_reg_complete_sms', {'$ACCOUNT_NUMBER' : account_number, '$NAME' : state.vars.reg_name_2}, lang);
            var messager = require('./lib/enr-messager');
            messager(contact.phone_number, enr_msg_sms);
            messager(state.vars.reg_pn, enr_msg_sms);
            promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        }
    }
    else{
        sayText(msgs('enr_invalid_glus', {}, lang));
        promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : max_digits_for_glus, 'timeout' : timeout_length});
    }
    get_time();
});//end registration steps input handlers

/*
input handlers for input ordering
*/
addInputHandler('enr_order_start', function(input){ //input is account number
    if(state.vars.current_step == 'entered_groupname' || state.vars.current_step == 'entered_glvv'){
        input = state.vars.account_number;
    }
    state.vars.current_step = 'enr_order_start';
    input = parseInt(input.replace(/\D/g,''));
    // reassign input to account number if user is entering input handler through glvv step
    state.vars.account_number = input;
    state.vars.multiple_input_menus = 1;
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    var client = get_client(input, an_pool, true);
    if(client === null || client.vars.registered == 0){
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length})
    }
    else if(client.vars.finalized == 1 && client.vars.geo !== 'Ruhango'){ //fix next tine for generallity
        sayText(msgs('enr_order_already_finalized', {}, lang));
        promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(client.vars.registered == 1){
        // if client does not have a glvv id entered, prompt them to enter it before continuing
        glvv_check = client.vars.glus;
        if(glvv_check == null || glvv_check == 0){
            sayText(msgs('enr_missing_glv', {}, lang));
            promptDigits('enr_glvv_id', {'submitOnHash' : false, 'maxDigits' : 8, 'timeout' : timeout_length});
            return null;
        }
        // save glvv in client row
        client.vars.glus = state.vars.glus;
        client.save();
        // check if client is a group leader
        var gl_check = require('./lib/enr-group-leader-check');
        var is_gl = gl_check(account_number, state.vars.glus, an_pool, glus_pool);
        // if the client is a group leader and the group is not yet named, prompt them to enter a group name
        if(is_gl && state.vars.needs_name){
            sayText(msgs('enr_add_groupname', {}, lang));
            promptDigits('enr_enter_groupname', {'submitOnHash' : false, 'maxDigits' : 60, 'timeout' : timeout_length});
        }
        // continue with order steps
        var check_live = require('./lib/enr-check-geo-active');
        if(!check_live(client.vars.geo, geo_menu_map)){
            sayText(msgs('enr_order_already_finalized', {}, lang));
            promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            return 0;
        }
        state.vars.session_authorized = true;
        state.vars.session_account_number = input;
        state.vars.client_geo = client.vars.geo;
        var prod_menu_select = require('./lib/enr-select-product-menu');
        var product_menu_table_name = prod_menu_select(state.vars.client_geo, geo_menu_map);
        state.vars.product_menu_table_name = product_menu_table_name;
        var menu = populate_menu(product_menu_table_name, lang);
        if(typeof(menu) == 'string'){
            state.vars.current_menu_str = menu;
            sayText(menu);
            state.vars.multiple_input_menus = 0;
            state.vars.input_menu = menu;
            promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
        else if(typeof(menu) == 'object'){
            state.vars.input_menu_loc = 0; //watch for off by 1 errors - consider moving this to start at 1
            state.vars.multiple_input_menus = 1;
            state.vars.input_menu_length = Object.keys(menu).length; //this will be 1 greater than max possible loc
            state.vars.current_menu_str = menu[state.vars.input_menu_loc];
            sayText(menu[state.vars.input_menu_loc]);
            state.vars.input_menu = JSON.stringify(menu);
            promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
    }
    else{
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length})
    }
    get_time();
});

addInputHandler('enr_input_splash', function(input){ //main input menu
    state.vars.current_step = 'enr_input_splash';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    var product_menu_table_name = state.vars.product_menu_table_name;
    if(state.vars.multiple_input_menus){ //needs some serious cleanup here - this is messy
        if(input == 44 &&  state.vars.input_menu_loc > 0){
            state.vars.input_menu_loc = state.vars.input_menu_loc - 1;
            var menu = JSON.parse(state.vars.input_menu)[state.vars.input_menu_loc];
            state.vars.current_menu_str = menu;
            sayText(menu);
            promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
        else if(input == 77 && (state.vars.input_menu_loc < state.vars.input_menu_length - 1)){
            state.vars.input_menu_loc = state.vars.input_menu_loc + 1;
            var menu = JSON.parse(state.vars.input_menu)[state.vars.input_menu_loc]
            state.vars.current_menu_str = menu;
            sayText(menu);
            promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
        else if(input == 44 && state.vars.input_menu_loc == 0){
            var splash_menu = populate_menu('enr_splash', lang, 300);
            var menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
            state.vars.current_menu_str = menu;
            sayText(menu);
            promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        }
        else{
            var selection = get_menu_option(input, product_menu_table_name);
            if(selection == null){
                sayText(msgs('enr_invalid_product_selection', {}, lang))
                promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            }
            else{
                state.vars.current_product = selection;
                var get_product_options = require('./lib/enr-get-product-options')
                var product_deets = get_product_options(selection, product_menu_table_name);
                state.vars.product_deets = JSON.stringify(product_deets);
                var process_prod = require('./lib/enr-format-product-options');
                var prod_deets_for_msg = process_prod(product_deets, lang);
                var prod_message = msgs('enr_product_selected', prod_deets_for_msg, lang)
                state.vars.prod_message = prod_message;
                sayText(prod_message);
                promptDigits('enr_input_order', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
            }
        }
    }
    else{
        var selection = get_menu_option(input, product_menu_table_name);
        if(selection == null){
            sayText(msgs('enr_invalid_product_selection', {}, lang))
            promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length})
        }
        else{
            state.vars.current_product = selection;
            var get_product_options = require('./lib/enr-get-product-options')
            var product_deets = get_product_options(selection, product_menu_table_name);
            state.vars.product_deets = JSON.stringify(product_deets);
            var process_prod = require('./lib/enr-format-product-options');
            var prod_deets_for_msg = process_prod(product_deets, lang);
            var prod_message = msgs('enr_product_selected', prod_deets_for_msg, lang)
            state.vars.prod_message = prod_message;
            sayText(prod_message);
            promptDigits('enr_input_order', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
    }
    get_time();
});

addInputHandler('enr_input_order', function(input){ //input ordering function
    state.vars.current_step = 'enr_input_order';
    state.vars.current_menu_str = state.vars.prod_message;
    input = parseFloat(input.replace(/[^0-9,.,,]/g,'').replace(/,/g,'.'));
    var product_deets = JSON.parse(state.vars.product_deets);
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    if(input < product_deets.min || input > product_deets.max){
        sayText(msgs('enr_input_out_of_bounds', {}, lang)); //this shoud include 1 to continue 99 to quite
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    else if(input % product_deets.increment === 0){
        var format_order_message = require('./lib/enr-format-input-message');
        state.vars.current_input_quantity = input;
        var input_confirm_opts = format_order_message(input, product_deets, lang);
        var input_confirm_msg = msgs('enr_confirm_input_order', input_confirm_opts, lang);
        state.vars.current_menu_str = input_confirm_msg;
        sayText(input_confirm_msg);
        promptDigits('enr_confirm_input_order', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    else if(input % product_deets.increment !== 0){
        sayText(msgs('enr_bad_input_increment', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    get_time();
});

addInputHandler('enr_confirm_input_order', function(input){ //input ordering confirmation
    state.vars.current_step = 'enr_confirm_input_order'
    input = parseInt(input.replace(/\D/g,''));
    if(input === 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else if(input === 44){
        if(state.vars.multiple_input_menus){
            var menu = JSON.parse(state.vars.input_menu)[0];
        }
        else{
            var menu = state.vars.input_menu;
        }
        state.vars.current_menu_str = menu;
        sayText(menu)
        promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    else if(input === 1){
        var log_input_order = require('./lib/enr-log-input-order');
        var product_deets = JSON.parse(state.vars.product_deets)
        console.log('product deets : ' + product_deets)
        var input_name = product_deets.input_name;
        log_input_order(state.vars.session_account_number, an_pool, input_name, state.vars.current_input_quantity)
        sayText(msgs('enr_input_order_success', {'$NAME' : product_deets[lang]}, lang));
        promptDigits('enr_input_order_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
    }
    else{
        sayText(msgs('invalid_input', {}, lang));
        promptDigits('invalid_input', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    get_time();
});

addInputHandler('enr_input_order_continue', function(input){
    state.vars.current_step = 'input_order_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else{
        if(state.vars.multiple_input_menus){
            var menu = JSON.parse(state.vars.input_menu)[0];
        }
        else{
            var menu = state.vars.input_menu;
        }
        state.vars.current_menu_str = menu;
        sayText(menu)
        promptDigits('enr_input_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length})
    }
    get_time();
});
//end input order handlers

/*
input handlers for order review
*/
addInputHandler('enr_order_review_start', function(input){ //input is account number
    state.vars.current_step = 'enr_order_review_start';
    input = parseInt(input.replace(/\D/g,''));
    var client = get_client(input, an_pool);
    if(client === null || client.vars.registered === 0){
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else{
        var prod_menu_select = require('./lib/enr-select-product-menu');
        var gen_input_review = require('./lib/enr-gen-order-review'); //todo: add prepayment calc
        var input_review_menu = gen_input_review(input, prod_menu_select(client.vars.geo, geo_menu_map), an_pool, lang);
        if(typeof(input_review_menu) == 'string'){
            sayText(input_review_menu);
            promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input,'timeout' : timeout_length});
        }
        else{
            state.vars.multiple_review_frames = 1;
            state.vars.review_frame_loc = 0;
            state.vars.review_frame_length = Object.keys(input_review_menu).length;
            state.vars.current_review_str = input_review_menu[state.vars.review_frame_loc];
            sayText(state.vars.current_review_str);
            state.vars.review_menu = JSON.stringify(input_review_menu);
            promptDigits('enr_order_review_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        }
    }
    get_time();
});

addInputHandler('enr_order_review_continue', function(input){
    state.vars.current_step = 'enr_order_review_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    else if(state.vars.review_frame_loc < state.vars.review_frame_length - 1){ //watch for off by 1 errors
        state.vars.review_frame_loc = state.vars.review_frame_loc + 1;
        var input_review_menu = JSON.parse(state.vars.review_menu);
        state.vars.current_review_str = input_review_menu[state.vars.review_frame_loc];
        sayText(state.vars.current_review_str);
        promptDigits('enr_order_review_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else{
        var splash_menu = populate_menu('enr_splash', lang, 300);
        var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    get_time();
});
//end order review

/*
input handlers for finalize order
*/
addInputHandler('enr_finalize_start', function(input){ //input is account number
    state.vars.current_step = 'enr_finalize_start';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    var client = get_client(input, an_pool);
    if(client == null || client.vars.registered == 0){
        sayText(msgs('account_number_not_found', {}, lang));
        contact.vars.account_failures = contact.vars.account_failures + 1;
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(client.vars.finalized !== 1 || client.vars.finalized === undefined){
        state.vars.session_account_number = input;
        sayText(msgs('enr_finalize_verify', {}, lang));
        promptDigits('enr_finalize_verify',  {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(client.vars.finalized == 1){
        sayText(msgs('enr_already_finalized', {}, lang));
        promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    get_time();
});

addInputHandler('enr_finalize_verify', function(input){
    state.vars.current_step = 'enr_finalize_verify';
    input = parseInt(input.replace(/\D/g, ''));
    if(input == 1){
        sayText(msgs('enr_finalized', {}, lang));
        var client = get_client(state.vars.session_account_number, an_pool)
        client.vars.finalized = 1;
        client.save(); 
    }
    else{
        sayText(msgs('enr_not_finalized', {}, lang));
    }
    promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    get_time();
});

//end finalize order

/*
input handlers for gl id retrieve 
*/
addInputHandler('enr_glus_id_start', function(input){ //input is nid for glus retrieval
    state.vars.current_step = 'enr_glus_id_start';
    input = String(input.replace(/\D/g,''));
    if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    var nid_glus = require('./lib/enr-glus-id-nid-retrieve');
    var glus_str = nid_glus(input, glus_pool);
    if(glus_str === null){
        sayText(msgs('enr_invalid_nid_lookup', {}, lang))
        promptDigits('enr_glus_id_start', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else{
        var messager = require('./lib/enr-messager');
        var glus_sms = msgs('enr_glus_sms', {'$GLUS' : glus_str}, lang);
        messager(contact.phone_number, glus_sms);
        sayText(msgs('enr_glus_retrieved', {'$GLUS' : glus_str}, lang));
        promptDigits('enr_continue', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    get_time();
});
//end gl id retrieve

/*
generic input handler for returning to main splash menu
*/
addInputHandler('enr_continue', function(input){
    state.vars.current_step = 'enr_continue';
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){
        var splash_menu = populate_menu('enr_splash', lang);
        var current_menu = msgs('enr_splash', {'$ENR_SPLASH' : splash_menu}, lang);
        state.vars.current_menu_str = current_menu;
        sayText(current_menu);
        promptDigits('enr_splash', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(input == 99){
        sayText(msgs('exit', {}, lang));
        stopRules();
    }
    get_time();
});

/*
input handler for invalid input - input handlers dump here for unrecognized input if there's not already a loop
*/
addInputHandler('invalid_input', function(input){
    input = parseInt(input.replace(/\D/g,''));
    if(input == 1){ //continue on to previously failed step
        sayText(state.vars.current_menu_str);
        promptDigits(state.vars.current_step, {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
        return null;
    }
    else if(input == 99){ //exit
        sayText(msgs('exit', {}, lang));
        stopRules();
        return null;
    }
    get_time();
});

// input handler for entering glvv id. note, do we want to check if this matches the client's district?
addInputHandler('enr_glvv_id', function(input){
    state.vars.current_step = 'entered_glvv'; 
    input = parseInt(input.replace(/\D/g,''));
    // check if glvv is valid
    var check_glus = require('./lib/enr-check-glus');
    if(check_glus(input, 'glus_ids') == !null){
        state.vars.glus = input;
        var gl_check = require('./lib/enr-group-leader-check');
        var is_gl = gl_check(account_number, state.vars.glus, an_pool);
        console.log('is gl? : ' + is_gl);
        // return to enr_order_start - give the client their account number in the message?
        sayText(msgs('enr_continue', {'$GROUP' : state.vars.glus}, lang));
        promptDigits('enr_order_start', {'submitOnHash' : false, 'maxDigits' : 1, 'timeout' : timeout_length});
        return null;
    }
    else{
        sayText(msgs('enr_incorrect_glvv', {}, lang));
        promptDigits('enr_glvv_id', {'submitOnHash' : false, 'maxDigits' : 8, 'timeout' : timeout_length});
        return null;
    }
});

// input handler for entering group name
addInputHandler('enr_enter_groupname', function(input){
    // assign input as the group name
    input = parseInt(input.replace(/\D/g,''));
    var name_group = require('./lib/enr-name-group');
    name_group(state.vars.glus, glus_pool, input);
    // return the client to the last completed step
    if(state.vars.current_step == 'enr_glus'){
        state.vars.current_step = 'entered_group_name';
        sayText(msgs('enr_continue', {'$GROUP' : state.vars.glus}, lang));
        promptDigits('enr_glus', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
    else if(state.vars.current_step == 'enr_order_start'){
        state.vars.current_step = 'entered_group_name';
        sayText(msgs('enr_continue', {'$GROUP' : state.vars.glus}, lang));
        promptDigits('enr_order_start', {'submitOnHash' : false, 'maxDigits' : max_digits_for_input, 'timeout' : timeout_length});
    }
});
