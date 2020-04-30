
var registrationEndpoint = "/Api/Registrations/RegisterClient";

var exampleRequestData = {
    "districtId" : 1404,
    "siteId":14,
    "groupId":14,
    "firstName":"Angello",
    "lastName":"Obel",
    "nationalIdNumber":"{{$randomInt}}",
    "phoneNumber":"0776320345"
}

var exampleResponse ={
    "EntityType": "Client",
    "DistrictId": 1404,
    "ClientId": -1014000370,
    "FirstName": "Angello",
    "LastName": "Obel",
    "EnrollmentDate": "2020-04-29T13:29:52.36",
    "Ban": false,
    "BannedDate": null,
    "DateCreated": "2020-04-29T13:29:52.36",
    "Deceased": false,
    "DeceasedDate": null,
    "AccountNumber": "27509737",
    "GlobalClientId": "dd65a009-8bcf-475e-86b4-bc5ea5dc7939",
    "FirstSeasonId": 280,
    "LastActiveSeasonId": null,
    "NationalId": "358",
    "OldGlobalClientId": null,
    "ParentGlobalClientId": null,
    "ValidationCode": null,
    "CanEnrollAsNewMember": null,
    "SiteId": 14
}



module.exports = function(clientJSON){

        var fullUrl = project.vars.server_name + registrationEndpoint;

        var opts ={};
        opts.headers['Authorization'] = "Token " + project.vars.roster_api_key;
        opts.method = "POST";
        opts.data = clientJSON;
        var response = httpClient.request(fullUrl,opts);
        if(response.status == 200){
            console.log('****************************************',response);
            return response.content;
        }
        console.log(response);
    
}