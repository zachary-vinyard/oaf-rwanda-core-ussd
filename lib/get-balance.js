/*
main get-balance function for core USSD
needs major updates - do not use in current state
*/

module.exports = function(){
    var client = JSON.parse(state.vars.client_json);
    var arrayLength = client.BalanceHistory.length;
    var districts = project.getOrCreateDataTable('districts');
    var $mm_client = 0 //check MM
    var d_cur = districts.queryRows({vars: {'district' : state.vars.client_district}});
    if(d_cur.hasNext()){
        $mm_client = d_cur.next().mm;
    }
    else{
        sendEmail(admin_email, 'unknown district in TR DB', 'district: ' + state.vars.client_district + '\nnot found in database');
    }
    var $balance = '';
    var $paid = 0;
    var $credit = 0;
    if(state.vars.account_number == 14375312){ //alert if audrey is using the system. redact
        sendEmail(admin_email, 'audrey\'s json', 'here: \n' + state.vars.client_json)
    }
    $overpayment = 0;
    for (var i = 0; i < arrayLength; i++) {
        if (client.BalanceHistory[i].Balance>0){    
            $paid = client.BalanceHistory[i].TotalCredit-client.BalanceHistory[i].Balance;
            $balance = client.BalanceHistory[i].Balance;
            $credit = client.BalanceHistory[i].TotalCredit;
            
        }
        if(client.BalanceHistory[i].Balance<0){
            $overpayment += client.BalanceHistory[i].Balance;
        }
    }

    if(!$paid){$paid = 0}
    if(!$credit){$credit = 0}
    if ($balance === ''){
        $balance = 0;
    }

    var $overpay_str = ''
    if($credit === 0 && $overpayment < 0){
        $overpay_str = 'Overpayment from previous season:' + -1*$overpayment + '\n';
    }

    var $sixty_perc = Math.max(0, (Math.ceil((parseFloat($credit)*0.6 - parseFloat($paid))/10)*10));
    var SubtractDays = 1;
    if($mm_client){
        if (moment().format('dddd') === "Monday"){SubtractDays = 3}
        else if (moment().format('dddd') === "Sunday"){SubtractDays = 2}
    }
    else{
        switch(moment().format('dddd')){
            case 'Tuesday'   : 
                SubtractDays = 0;
                break;
            case 'Wednesday' : 
                SubtractDays = 1;
                break;
            case 'Thursday'  : 
                SubtractDays = 2;
                break;
            case 'Friday'    : 
                SubtractDays = 3;
                break;
            case 'Saturday'  : 
                SubtractDays = 4;
                break;
            case 'Sunday'    : 
                SubtractDays = 5;
                break;
            case 'Monday'    : 
                SubtractDays = 6;
                break;
            default          :
                SubtractDays = 7;
                break;
        }
    }

    var DayName = moment().subtract(SubtractDays, 'days').format('dddd');
    var DayNR = moment().subtract(SubtractDays, 'days').format('DD');
    var Month = moment().subtract(SubtractDays, 'days').format('MMMM');

    var ki_month_lookup = {'January'   : 'Ukwambere',
                           'February'  : 'Ukwakabiri',
                           'March'     : 'Ukwagatatu',
                           'April'     : 'Ukwakane',
                           'May'       : 'Ukwagatanu',
                           'June'      : 'Ukwagatandatu',
                           'July'      : 'Ukwakarindwi',
                           'August'    : 'Ukwamunani',
                           'September' : 'Ukwacyenda',
                           'October'   : 'Ukwacumi',
                           'November'  : 'Ukwacuminakumwe',
                           'December'  : 'Ukwacuminabiri',
    };

    var ki_day_lookup   = {'Monday'    : 'Kuwambere',
                           'Tuesday'   : 'Kuwakabiri',
                           'Wednesday' : 'Kuwagatatu',
                           'Thursday'  : 'Kuwakane',
                           'Friday'    : 'Kuwagatanu',
                           'Saturday'  : 'Kuwagatandatu',
                           'Sunday'    : 'Kucyumweru'
    };

    var $DateUpdateMonth = ki_month_lookup[Month];
    var $DateUpdateDayName = ki_day_lookup[DayName];
    var $DateUpdateDayNR = DayNR;

    //Create Record for PowerBI retrieve - abstract this out

    var GBTable = project.getOrCreateDataTable("GetBalance");
    var GBRow = GBTable.createRow({

        vars: {'District': client.DistrictName, 
        'Site': client.SiteName,
        'Group': client.GroupName,
        'AccountNumber':state.vars.account_number,
        'PhoneNumber':contact.phone_number}
    });

    GBRow.save();
    //Create row in stats table
    var StatsTable = project.getOrCreateDataTable("MobileStats");    
    DateString = String(moment().format("DD-MM-YYYY"));

    StatsCursor = StatsTable.queryRows({
        vars: {'date': DateString,
        'site': client.SiteName}});

    StatsCursor.limit(1);

    if (StatsCursor.hasNext()) {
        var StatsRow = StatsCursor.next();
        StatsRow.vars.countBalance = Number(StatsRow.vars.countBalance)+Number(1);
        StatsRow.save();
        console.log("stats row found");
    }

    else{
        var NewStatsRow = StatsTable.createRow({
        vars: {'site':client.SiteName,
            'district':client.DistrictName,
            'countBalance':Number(1),
            'date': DateString}});
        NewStatsRow.save();
    }

    //end of powerBI integration

    return {'$CLIENT_NAME' : client.ClientName,
            '$PAID'        : $paid,
            '$BALANCE'     : $balance,
            '$CREDIT'      : $credit,
            '$DAY_NAME'    : $DateUpdateDayName,
            '$MONTH'       : $DateUpdateMonth,
            '$DAYNR'       : $DateUpdateMonth };
};