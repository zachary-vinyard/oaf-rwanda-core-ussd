/*
small util to id phones in TR
probably only run once
*/

module.exports = function(){
    console.log('phone_query_running');
    var q = project.queryPhones();
    while(q.has_next){
        phone = q.next();
        console.log(JSON.stringify(phone));
    }
}
