var geo_select = require('./lib/cta-geo-select');
var geo_process = require('./lib/cta-geo-string-processer');
var geo_data = require('./dat/rwanda-tubura-geography');
var msgs = require('./lib/msg-retrieve');
var msgs = require('./lib/msg-retrieve');

const max_digits_for_account_number = project.vars.max_digits_an;

global.main = function () {

    state.vars.current_menu = JSON.stringify('1: Marketing');
    sayText(msgs('train_main_splash', {'$Division_MENU' : '1) Marketing'}));
    promptDigits('division_selection', { 'submitOnHash' : false,
    'maxDigits'    : max_digits_for_account_number,
    'timeout'      : 180 });
};



addInputHandler('division_selection',function(input){

    state.vars.current_step = 'division_selection';
    input = parseInt(input.replace(/\D/g,''));

    if(input === 1){
    call.vars.current_division = 'Marketing'
    var survey_table = project.getOrCreateDataTable('Surveys');
    var survey_cursor = survey_table.queryRows({
        vars        : { 'survey_division': call.vars.current_division},
        sort_dir    : 'desc'
    });
    var surveys_obj = '';
    var counter = 1;
    while(survey_cursor.hasNext()){
        try
        {
        var row = survey_cursor.next();
        var survey_type = row.vars.survey_type;
        surveys_obj = surveys_obj + String(counter) + ")" + survey_type + '\n';
        counter ++;
    }
    catch(error){
       console.log("error"+error);
        break;
    }
}
    call.vars.current_menu = surveys_obj;

    sayText(msgs('train_type_splash', {'$Type_MENU' : surveys_obj}));
    promptDigits('surveyType_selection', { 'submitOnHash' : false,
                                            'maxDigits'    : 1,
                                            'timeout'      : 180 }); 
    

}
    else if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    else{
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('train_main_splash', {'$Division_MENU' : '1: Marketing'}));
        promptDigits('division_selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});

    }
});


addInputHandler('surveyType_selection',function(input){

    state.vars.current_step = 'surveyType_selection';
    input = parseInt(input.replace(/\D/g,''));

    if(input > 0){
    var survey_table = project.getOrCreateDataTable('Surveys');
    var survey_cursor = survey_table.queryRows({
        vars        : { 'survey_division': call.vars.current_division},
        sort_dir    : 'desc'
    });
    var counter = 1;
    while(survey_cursor.hasNext()){
        try{
        var row = survey_cursor.next();
        if(input  == counter){
            call.vars.survey_code = row.vars.survey_code;
            call.vars.number_of_questions = row.vars.number_of_questions;
            console.log("current code : "+call.vars.survey_code);
            break;
        }
        counter ++;
    }
    catch(error){
       console.log("error"+error);
        break;
    }
    }
    console.log("Selected one: "+call.vars.survey_code)

    var geo_list = geo_process(geo_data);
    sayText(msgs('training_province_splash', geo_list));
    promptDigits('province_selection', { 'submitOnHash' : false,
                                            'maxDigits'    : 1,
                                            'timeout'      : 180 });
                                         }
    else if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    else{ // selection not within parameters
        sayText("ivalid input");
        sayText(msgs('train_type_splash', {'$Type_MENU' : call.vars.current_menu}));
        promptDigits('surveyType_selection', { 'submitOnHash' : false,
                                                'maxDigits'    : 1,
                                                'timeout'      : 180 });
    }
                                    

});

addInputHandler('province_selection', function(input){
    state.vars.current_step = 'geo_selection_1';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.region = selection;
        state.vars.region_name = keys[selection];
        call.vars.region = state.vars.region_name;
        geo_data = geo_select(selection, geo_data)
        var selection_menu = geo_process(geo_data);
        state.vars.current_menu = JSON.stringify(selection_menu);
        sayText(msgs('training_district_splash', selection_menu));
        promptDigits('district_selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
    else if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('training_province_splash', JSON.parse(state.vars.current_menu)));
        promptDigits('province_selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});
// input handler for district selection
addInputHandler('district_selection', function(input){
    state.vars.current_step = 'geo_selection_2';
    input = parseInt(input.replace(/\D/g,''));//cleans out anything nonnumeric in the input - really, input should only be digits 1 -?
    var region = parseInt(state.vars.region);
    geo_data = geo_select(region, geo_data);
    var keys = Object.keys(geo_data);
    if(input > 0 && input <= keys.length){
        var selection = input - 1;
        state.vars.district = selection;
        state.vars.district_name = keys[selection];
        call.vars.district = state.vars.district_name;
        // initialize variables for tracking place in impact quiz6
        state.vars.survey_type = call.vars.survey_code;
        state.vars.step = 1;
        state.vars.num_correct = 0;
        // ask first quiz question
        var ask = require('./lib/training-ask-question');
        ask();
        sayText('The question id is : '+ state.id);
    }
    else if (input == 99){ // exit
        sayText(msgs('exit')); // need to add this to the list
        stopRules();
    }
    else{ // selection not within parameters
        sayText(msgs('imp_invalid_geo'));
        sayText(msgs('geo_selections', JSON.parse(state.vars.current_menu)));
        promptDigits('district selection', {'submitOnHash' : false, 'maxDigits' : 1,'timeout' : 180});
    }
});

// input handler for survey questions
addInputHandler('quiz_question', function(input){
    // test and store input response
    input = parseInt(input.replace(/\s/g,''));
    if (input === 99){ // exit
        sayText(msgs('exit'));
        stopRules();
    }
    call.vars.status = state.vars.survey_type + state.vars.step;
    call.vars[call.vars.status] = input;
    var survey_length = call.vars.number_of_questions ; // pull direct from table

    // verify response and retrieve relevant feedback string
    var verify = require('./lib/training-answer-verify');
    var feedback = verify(input);
    state.vars.step += 1;

    // ask next question or display score if complete
    if(state.vars.step <= survey_length){
        var ask = require('./lib/training-ask-question');
        ask();
        return null;
    }
    else{
        call.vars.status = 'complete';
        sayText(msgs('imp_closing_message', {   '$FEEDBACK'    : feedback,
                                            '$NUM_CORRECT' : state.vars.num_correct}, lang));
        return null;
    }
});