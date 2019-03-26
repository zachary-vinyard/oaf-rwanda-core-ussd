/*
main function for retrieving location during ad-response flow
pretty basic here - call with only selection argument to include full geography. specify geo_data to get more specific. selection should only be strings
needs some work
*/

module.exports = function(sel, branch){
    if('fo_name' in branch.keys()){
        return branch;
    }
    else if(!(sel in Object.keys(branch))){
        throw 'ERROR: Geo selection not in keys';
    }
    else {
        return branch[sel];
    }
}
