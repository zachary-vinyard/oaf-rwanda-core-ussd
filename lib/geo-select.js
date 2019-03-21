/*
main function for retrieving location during ad-response flow
pretty basic here - call with only selection argument to include full geography. specify geo_data to get more specific. selection should only be strings
*/

module.exports = function(selection, geo_data){
    if(typeof(selection) != 'string'){
        throw 'Argument "selection" is not a string';
    }
    geo_data = geo_data || require('../dat/rwanda-gov-geography') // default value for geodata is to include default
    if(typeof(geo_data[selection]) != 'object'){
        console.log(' reached full depth');
    }
    return(geo_data[selection])
}