/*
    Function: main_menu_display.js
    Author: Marisa
    Purpose: displays main menu for the PShop client portal
*/

module.exports = function(farmer_name){
    // print main menu text
    sayText(msgs('pshop_main_menu', farmer_name));
    // >> need to call pshop main menu table

    // does anything else need to go here?
    promptDigits('main_menu', {'timeout' : 180 });
}
