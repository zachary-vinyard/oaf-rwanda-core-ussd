/*
    Function: main_menu_display.js
    Purpose: displays main menu for the PShop client portal
*/

module.exports = function(farmer_name){
    // print main menu text
    sayText(msgs('pshop_main_menu', farmer_name));
    // >> need to call pshop main menu table here - check first core input handler?
    // does anything else need to go here?
    promptDigits('pshop_menu_select', {'timeout' : 180 });
}
