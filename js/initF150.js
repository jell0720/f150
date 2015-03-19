google.load('visualization', '1.1', {
    'packages': ['table', 'map', 'bar', 'sankey', 'corechart']
});

var ColArray = null; //篩選欄位的陣列(橫向)
var RowArray = null; //篩選欄位的陣列(縱向)
var CheckMode = 1; //1: peopleList,2: carList,3: imcomeList
var ChartMode = 'Line';// Line: 折線圖 ,Bar :長條圖
var Resource_id = ''; //資料表編號

$(document).ready(function () {
    
    //賦予選單1的勾選動作應有的功能
    $('div.menu1').delegate('input', 'click', function () {
        switch ($(this).parent().parent().parent().attr('class')) {
            case 'peopleList':
                CheckMode = 1;
                break;
            case 'carList':
                CheckMode = 2;
                break;
            case 'imcomeList':
                CheckMode = 3;
                break;
        } //end switch
        //取得選單1的資料表編號並且清除不必要的勾選
        checkedResourse();
        var url = 'http://data.thicloud.org/api/action/datastore/search.jsonp';
        var fun = function (response) {
            getGeoData(response);
        };
        var pa = {
            resource_id: Resource_id
        };
        JSONP(url, pa, fun);

    }); //end  $('div.menu1')


});   //end $(document).ready(function () {


//獲取共用資料
function getGeoData(xmldata) {

    //建立物件
    var geoDataObj = new CreateGeoDataObj();

    //取得共同資料
    geoDataObj.geoData = geoDataObj.getDataTable(xmldata);

    //給表格使用的資料
    var geoTable = new google.visualization.DataView(geoDataObj.geoData);
    
    //取得表格的欄位個數並初始化
    var setColumnsArray = new Array(geoDataObj.geoData.getNumberOfColumns());
    $.each(setColumnsArray, function (i, field) {
        setColumnsArray[i] = i;});
   
    //設定顯示的欄位
    geoTable.setColumns(setColumnsArray);

  
    //建立表格
    geoDataObj.createTable(geoTable, 'table_div');

    switch (ChartMode) {
    case 'Line':
        //建立人口折線圖下拉式選單 chart1_div
        geoDataObj.createMutiLine(geoTable, 'chart1_div');
        break;
    case 'Bar':
        //建立人口長條圖 chart1_div
        geoDataObj.createMutiBar(geoTable, 'chart1_div');
        break;

    } //end switch;
   



    //取得選單地區的唯一值
    var reginArray = geoDataObj.geoData.getDistinctValues(0);
    $('div.menu2').html(null);
    $.each(reginArray, function (i, field) {
        switch (ChartMode) {
            case 'Line':
                //建立人口折線圖下拉式選單 chart1_div
                $('div.menu2').append(productCheckBox('checkbox', field));
                break;
            case 'Bar':
                //建立人口長條圖 chart1_div
                $('div.menu2').append(productCheckBox('radio', field));
                break;

        } //end switch;



       
    });

    //取得選單年期的唯一值
    var yearLength = geoDataObj.geoData.getNumberOfColumns();
    $('div.menu3').html(null);
    //選單年期的過濾，有些欄位在年期的前面要扣掉
    var index = 0;
    switch (ChartMode) {
        case 'Line':
            index = 1;
            break;
        case 'Bar':
            index = 2;
            break;
       
    }//end switch;

    //展開選單的年期勾選
    for (var i = index; i < yearLength; i++) {
        var field = geoDataObj.geoData.getColumnLabel(i);
        $('div.menu3').append(productCheckBox('checkbox',field));
    }

    //賦予選單地區篩選的動作
    $('div.menu2').delegate('input', 'click', function () {
        //宣告一陣列儲存條件值做未來篩選用
        var tmpArray = new Array(0);
        //篩選出條件值塞到陣列中
        $.each($('div.menu2').find('input'), function (i, field) {
            switch (field.checked) {
                case true:
                    tmpArray.push(field.value);
                    break;
            } //end switch
        }); //end each
        ColArray = tmpArray;
        queryGeoData();
    }); //end  $('div.menu2')


    //賦予選單年期篩選的動作
    $('div.menu3').delegate('input', 'click', function () {
        //宣告一陣列儲存條件值做未來篩選用
        var tmpArray = new Array(0);
        //勾選年期要設定的順序
        var order = 0;

        switch (CheckMode) {
            case 1:
                //首值要加入city欄位
                switch (ChartMode) {
                    case 'Line':
                        tmpArray.push(0);
                        order = 1990
                        break;
                    case 'Bar':
                        tmpArray.push(0);
                        tmpArray.push(1);
                        order = 1989
                        break;
                }//end switch
             
              
                break;
            case 2:
                //首值要加入city欄位type of car欄位
                tmpArray.push(0);
                tmpArray.push(1);
                order = 1997;
                break;
        }

        //篩選出條件值塞到陣列中
        $.each($('div.menu3').find('input'), function (i, field) {
            switch (field.checked) {
                case true:
                    tmpArray.push(field.value - order);
                    break;
            } //end switch
        }); //end each
        RowArray = tmpArray;
        queryGeoData();
    });     //end  $('div.menu3')

} //end getGeoData {

//取得資料表編號
function checkedResourse() {
    var attrValue = '';
    switch (CheckMode) {
        case 1: //peopleList;
            $.each($('div.peopleList').find('input'), function (i, field) {
                switch (field.checked) {
                    case true:
                        Resource_id = field.value;
                        ChartMode = $(field).attr('mode');
                        break;
                }
            });
            attrValue = 'peopleList';

            break;
        case 2: //carList;
            $.each($('div.carList').find('input'), function (i, field) {
                switch (field.checked) {
                    case true:
                        Resource_id = field.value;
                        ChartMode = $(field).attr('mode');
                        break;
                }
            });
            attrValue = 'carList';
            break;
        case 3: //imcomeList;
            attrValue = 'imcomeList';
            break;

    } //end switch
    clearMenu1CheckBox(attrValue);

    if (Resource_id === '')
        alert('尚未掛載資料表');
} //end checkedResourse()

//清除選單1不該有的input
function clearMenu1CheckBox(attrValue) {
//    //遍歷所有input
    $.each($('div.menu1').find('input'), function (i, field) {
        if ($(field).parent().parent().parent().attr('class') !== attrValue) {
            field.checked = false;
        }
    
    })// end    $('div.menu1')
   
}

//checkbx 生成器
function productCheckBox(mode,field) {
    var htmlStr =null;
    var newDiv = null;

    switch (mode) {
        case 'checkbox': //折線圖的年期要複選
             htmlStr = '<input type="checkbox" value="' + field + '"/><span calss="checkbox">' + field + '</sapn>';
             newDiv = $('<div/>').addClass('checkbox')
            .append($('<label/>')
            .append(htmlStr))
            break;
        case 'radio': //長條圖的年期要單選
            htmlStr = '<input type="radio" name="optionsRadios1" value="' + field + '"/><span calss="radio">' + field + '</sapn>';
            newDiv = $('<div/>').addClass('radio')
            .append($('<label/>')
            .append(htmlStr))
            break;
    }

    return newDiv;
}

//查詢分析資料 需要ColArray與RowArray 相互控制
function queryGeoData() {
    var url = 'http://data.thicloud.org/api/action/datastore/search.jsonp';
    var fun = function (response) {
        formGeoData(response);
    };
    var arrayStr = '';

    if (ColArray !== null)
        $.each(ColArray, function (i, field) {
            arrayStr += field + ',';
        });


    var pa = {
        resource_id: Resource_id,
        'filters[city]': arrayStr
    };
    //如果沒出現限制欄位，全部秀出
    if (ColArray === null)
        delete pa['filters[city]'];


    JSONP(url, pa, fun);

}


//篩選選單區域的資料
function formGeoData(xmldata) {

    //建立物件
    var geoDataObj = new CreateGeoDataObj();

    //取得共同資料
    geoDataObj.geoData = geoDataObj.getDataTable(xmldata);

    //給表格使用的資料
    var geoTable = new google.visualization.DataView(geoDataObj.geoData);

    //如果沒有勾選年期，應該設定初始值
    if (RowArray === null) {
        RowArray = new Array(geoDataObj.geoData.getNumberOfColumns());
        $.each(RowArray, function (i, field) {
            RowArray[i] = i;
        });
    } //end if RowArray

    geoTable.setColumns(RowArray);


    //建立表格
    geoDataObj.createTable(geoTable, 'table_div');

    switch (ChartMode) {
        case 'Line':
            //建立人口折線圖下拉式選單 chart1_div
            geoDataObj.createMutiLine(geoTable, 'chart1_div');
            break;
        case 'Bar':
            //建立人口長條圖 chart1_div
            geoDataObj.createMutiBar(geoTable, 'chart1_div');
            break;

    } //end switch;


} //end formGeoData





//api 說明 http://docs.getdkan.com/docs/dkan-documentation/dkan-api/datastore-api
