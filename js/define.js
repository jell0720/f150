/*
1.jquery的ajax post 重新定義
2.jquery的ajax jsonp 重新定義(跨域呼叫)
3.table 物件的建立 含新增,刪除,修改等功能
*/

//1.jquery的ajax post 重新定義

function AJAX(url, data, fun) {
  
    $.ajax({
            url: url,
            type: 'GET',
            data: data,
            timeout: 180000,
            //async: false,//tmp
            error: function(xhr, ajaxOptions, thrownError) {
                //alert(xhr.status);
                //alert(thrownError);
            },
            success: function(response) {
                fun(response);
            }
        }); //$.ajax
} // end function AJAX

//2.jquery的ajax jsonp 重新定義(跨域呼叫)
function JSONP(url, data, fun) {
    $.ajax({
            url: url,
            type: 'GET',
            data: data,
            dataType: 'jsonp',
            crossDomain: true,  
            timeout: 180000,
            error: function(xhr, ajaxOptions, thrownError) {
                alert(xhr.status);
                alert(thrownError);
            },
            success: function(response) {
         
                fun(response);
            }
        }); //$.ajax
} // end function JSONP


//3.Map.table 物件的建立 含增加地圖跟表單功能
CreateGeoDataObj = function() {
    //共同資料
    this.geoData;
    this.mapObj;
    this.chartObj;
    this.tableObj;
    
    //建立http://data.thicloud.org/api/的data table
    this.getDataTable= function(xmldata){
        var data = new google.visualization.DataTable();
        var sortArray = new Array(0);
        $.each(xmldata.result.fields, function (i, field) {
        //轉換google chart 內建資料格式
        var type=field.type
            switch (type) {
            case 'text':
            case 'float':
            case 'int':
                type= 'string';
                break;
            default:        
                break;
            }//end switch
            sortArray.push(field.id);
            data.addColumn(type, field.id);
        });
        //data.addRows(parseInt(xmldata.result.total,10));
        $.each(xmldata.result.records, function (i, fields) {
            var tmpArray = new Array(0);
            var fieldsLength = xmldata.result.fields.length-1
           //根據json api 提供的欄位做排序
            $.each(sortArray, function (j, value) {        
                $.each(fields, function (name, field) {
                    if(value===name)
                        tmpArray.push(field);
                });
             }); 
            data.addRow(tmpArray);
        });  //end  $.each(xmldata.result.records

        return data;
    };//end this.getDataTable

    //轉換google chart 的格式

    //建立表格
    this.createTable = function(geoTable,tableId) {
   
        this.tableObj =
            new google.visualization.Table(document.getElementById(tableId));

        var cssClassNames = {
            headerCell: 'text-info',
            oddTableRow: 'success',
            tableCell: 'table table-bordered'
        };
        this.tableObj.draw(geoTable);

    }; //end this.createTable
    
     //建立底圖
     this.createMap = function(geoView,mapId) {
        this.mapObj =
            new google.visualization.Map(document.getElementById(mapId));
        this.mapObj.draw(geoView, {
                mapType: 'normal',
                showTip: true,
                icons: {
      default: {
        normal: 'http://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Ball-Azure-icon.png',
        selected: 'http://icons.iconarchive.com/icons/icons-land/vista-map-markers/48/Map-Marker-Ball-Right-Azure-icon.png'
      }}
            });
      
    }; //end this.createMapObj

      //建立多重折線圖
     this.createMutiLine = function(geotable,chartId) {
      
      //var reginArray = geotable.getDistinctValues(0);
     
        var data=new google.visualization.DataTable();
        //儲存欄位名稱
        var columnDataArray=new Array(0);
        //讀取資料個數
        var NumberOfColumns= geotable.getNumberOfColumns();
        var NumberOfRows =geotable.getNumberOfRows();


      
        //columnDataArray.push(geotable.getColumnLabel(0));
        for (var i = 0; i < NumberOfRows; i++) {
          columnDataArray.push(geotable.getFormattedValue(i, 0));
         }

        //建立欄位
        data.addColumn('string', 'Year');
        $.each(columnDataArray, function (i, field) {
           data.addColumn('number', field);
        });
         
      

        //跑迴圈把年份資料撈出來,先求第一筆
        //取得總欄位數跑迴圈
        for (var i = 1; i < NumberOfColumns; i++) {
            var rowDataArray=new Array(0);
            rowDataArray.push(geotable.getColumnLabel(i));
            for (var j = 0; j < NumberOfRows; j++) {
                rowDataArray.push(Number(geotable.getFormattedValue(j, i)));
            }
            data.addRow( rowDataArray);
        }//end  for (var i = 1
       

        


        var options = {
          title: '各縣市歷年人口變化圖',
          curveType: 'function',
          legend: { position: 'right' },     
           vAxis: {title: "人口數"},
           hAxis: {title: "年份"}
        };

        var chart = new google.visualization.LineChart(document.getElementById(chartId));

        chart.draw(data, options);
     
     }//end  this.createMutiLine

       //建立多重長條圖
     this.createMutiBar = function(geotable,chartId) {
           
        var data=new google.visualization.DataTable();
        //儲存欄位名稱
        var columnDataArray=new Array(0);
        //讀取資料個數
        var NumberOfColumns= geotable.getNumberOfColumns();
        var NumberOfRows =geotable.getNumberOfRows();
        // 讀取城市名稱
        var city= geotable.getFormattedValue(0, 0);
        if(NumberOfRows>3)
        return;

      
        //columnDataArray.push(geotable.getColumnLabel(1));
        for (var i = 0; i < NumberOfRows; i++) {
          columnDataArray.push(geotable.getFormattedValue(i, 1));
         }
     
        //建立欄位
        data.addColumn('string', 'Year');
        $.each(columnDataArray, function (i, field) {
           data.addColumn('number', field);
        });
         data.addColumn('number', '平均'); 
      

        //跑迴圈把年份資料撈出來,先求第一筆
        //取得總欄位數跑迴圈,第二欄開始計算
        //把人口平均值加入
       
        for (var i = 2; i < NumberOfColumns; i++) {
            var rowDataArray=new Array(0);
            var counter=0,average=0;
            rowDataArray.push(geotable.getColumnLabel(i));
            for (var j = 0; j < NumberOfRows; j++) {
                rowDataArray.push(Number(geotable.getFormattedValue(j, i)));
                counter+=Number(geotable.getFormattedValue(j, i))
            }
            average=counter/Number(NumberOfRows);
            rowDataArray.push(average);
            data.addRow( rowDataArray);
        }//end  for (var i = 1
       
/*
        var data1 = google.visualization.arrayToDataTable([
          ['縣市年份','0-14歲','15-64歲','65歲以上','平均'],
          ['新北市1991',885002,2064586,157690,1035759],
          ['新北市1992',875971,2119635,166740,1054115],
           ['新北市1993',868216,2177489,176924,1074210],
          ['新北市1994',843265,2232567,184899,1086910],
        
        ]);


        */
       
  var options = {
    title : city+'各年齡人口數',
    vAxis: {title: "人口數"},
    hAxis: {title: "縣市年份"},
    seriesType: "bars",
    series: {3: {type: "line"}}
  };

  var chart = new google.visualization.ComboChart(document.getElementById(chartId));
  chart.draw(data, options);
    

     

     }//end  this.createMutiBar





    //建立圓餅圖
     this.createPieChartObj = function(mode,dataType,geoView,rowIndex,chartId) {
        var location= geoView.getFormattedValue(rowIndex, 0);
        var timeType=dataType;
        var timeCount=0; //計算24小時個數 
        var direction='';
        var motoSum=0;//機車總合
        var smallCarSum=0;//小型車總合
        var bigPagCarSum=0;//大貨車總合
        var bigComCarSum=0;//大客車總合
        var conCarSum=0;//聯結車總合
        var totalSum=0;//TOTAL總合
     //1.跑迴圈，先做平假日
     for (var i = 0; i < geoView.getNumberOfRows(); i++) {
     //如果其值為相符合位置，就抓出各車種車數
            if (geoView.getFormattedValue(i, 0)==location) {
             //判斷timeType屬性併抓出其值過濾
             if (geoView.getFormattedValue(i, 2)==timeType) {
                //每個方向應該只跑24次
                switch(mode){
                case 1:  //西(北向)
                 if (timeCount<23) {
                     //抓出機車(輛)	小型車(輛)	大貨車(輛)	大客車(輛)	聯結車(輛)與TOTAL(輛)
                    motoSum+=parseInt(geoView.getFormattedValue(i, 5));
                    smallCarSum+=parseInt(geoView.getFormattedValue(i, 6));
                    bigPagCarSum+=parseInt(geoView.getFormattedValue(i, 7));
                    bigComCarSum+=parseInt(geoView.getFormattedValue(i, 8));
                    conCarSum+=parseInt(geoView.getFormattedValue(i, 9));
                    totalSum+=parseInt(geoView.getFormattedValue(i, 10));
                    //抓出方向
                    direction=geoView.getFormattedValue(i, 3);
                    timeCount++;
                }//end    if (timeCount<23) {
                
                break;
                case 2:  //東(南向)
                  if (timeCount<47) {
                     //抓出機車(輛)	小型車(輛)	大貨車(輛)	大客車(輛)	聯結車(輛)與TOTAL(輛)
                    motoSum+=parseInt(geoView.getFormattedValue(i, 5));
                    smallCarSum+=parseInt(geoView.getFormattedValue(i, 6));
                    bigPagCarSum+=parseInt(geoView.getFormattedValue(i, 7));
                    bigComCarSum+=parseInt(geoView.getFormattedValue(i, 8));
                    conCarSum+=parseInt(geoView.getFormattedValue(i, 9));
                    totalSum+=parseInt(geoView.getFormattedValue(i, 10));
                    //抓出方向
                    direction=geoView.getFormattedValue(i, 3);
                    timeCount++;
                  }//end    if (timeCount<47) {
                break;
                }//end switch
               
             }//end  if (geoView.getFormattedValue(i, 2)
             
        }// end  if (geoView.getFormattedValue(i, 0)
     }//end for
    

        var data = google.visualization.arrayToDataTable([
          ['種類', '數量'],
          ['機車',     motoSum],
          ['小型車',     smallCarSum],
          ['大貨車', bigPagCarSum],
          ['大客車', bigComCarSum],
          ['聯結車',  conCarSum]
        ]);

        var options = {
          title:location+'('+direction+')'
        };

        var chart = new google.visualization.PieChart(document.getElementById(chartId));

        chart.draw(data, options);

       
    }; //end this.createPieChartObj



    //建立人口圓餅圖
     this.createPieChartPopulationObj = function(year, geoView,chartId) {
       //建立一個容器陣列
        var data=new google.visualization.DataTable();
        data.addColumn('string', '縣市');
        data.addColumn('number', '佔比');

         //跑迴圈
     for (var i = 0; i < geoView.getNumberOfRows(); i++) {
        //年份要過濾
       var tmpArray=new Array(0);
       tmpArray.push(geoView.getFormattedValue(i, 0).toString());
       tmpArray.push(parseFloat(geoView.getFormattedValue(i, parseInt(year))));
       data.addRow( tmpArray);
     }//end for (var i = 0; i < geoView
    
        var title=$("#year_select option:selected").text();
        var options = {
          title: title+'年各縣市佔比'
        };

     

        var chart = new google.visualization.PieChart(document.getElementById(chartId));

        chart.draw(data, options);

       
    }; //end this.createPieChartPopulationObj


      //建立人口折線圖
     this.createSLineChartPopulationObj = function(county, geoView,chartId) {
       var data=new google.visualization.DataTable();
        data.addColumn('string', 'Year');
        data.addColumn('number', county);
     //跑迴圈
     for (var i = 0; i < geoView.getNumberOfRows(); i++) {
         if (geoView.getFormattedValue(i, 0)==county) {
             for (var j = 1991; j < 2015; j++) {
                var tmpArray=new Array(0);
                tmpArray.push(j.toString());
                tmpArray.push(parseFloat(geoView.getFormattedValue(i,j-1990)));
                data.addRow( tmpArray);  
             }// end for(var j = 0; 
         
         }//end  if (geoView.getFormattedValue(i, 0)==county) {

        //年份要過濾
      
     }//end for (var i = 0; i < geoView

        var options = {
      
          title: '各縣市歷年人口變化圖',
  
          curveType: 'function',

          legend: { position: 'right' },
        
           vAxis: {title: "人口數"},
           hAxis: {title: "年份"},
         
        };


        var chart = new google.visualization.LineChart(document.getElementById(chartId));

        chart.draw(data, options);

       
    }; //end this.createPieChartPopulationObj





    //建立折線圖
     this.createSLineChartObj = function(mode,dataType,geoView,rowIndex,chartId) {
     
        var location= geoView.getFormattedValue(rowIndex, 0);
        var timeType=dataType;
        var timeCount=0; //計算24小時個數 
        var direction='';
        var motoSum=0;//機車總合
        var smallCarSum=0;//小型車總合
        var bigPagCarSum=0;//大貨車總合
        var bigComCarSum=0;//大客車總合
        var conCarSum=0;//聯結車總合
        var totalSum=0;//TOTAL總合

        //建立一個容器陣列
        var dataArray=new google.visualization.DataTable();
        dataArray.addColumn('string', 'Year');
        dataArray.addColumn('number', '機車(PCU)');
        dataArray.addColumn('number', '小型車(PCU)');
        dataArray.addColumn('number', '大貨車(PCU)');
        dataArray.addColumn('number', '大客車(PCU)');
        dataArray.addColumn('number', '聯結車(PCU)');


     //1.跑迴圈，先做平假日
     for (var i = 0; i < geoView.getNumberOfRows(); i++) {
     //如果其值為相符合位置，就抓出各車種車數
            if (geoView.getFormattedValue(i, 0)==location) {
             //判斷timeType屬性併抓出其值過濾
             if (geoView.getFormattedValue(i, 2)==timeType) {
                //每個方向應該只跑24次getFormattedValue(i,3)
                  switch(mode){
                case 1:  //西(北向)
                 if (timeCount<23) {
                  var tmpArray=new Array(0);
                  tmpArray.push(geoView.getFormattedValue(i, 4).toString());
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 11)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 12)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 13)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 14)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 15)));
                  dataArray.addRow( tmpArray);
                  direction=geoView.getFormattedValue(i, 3);
                    timeCount++;
                }//end    if (timeCount<23) {
                
                break;
                case 2:  //東(南向)
                  if (timeCount<47) {
                  var tmpArray=new Array(0);
                  tmpArray.push(geoView.getFormattedValue(i, 4).toString());
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 11)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 12)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 13)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 14)));
                  tmpArray.push(parseFloat(geoView.getFormattedValue(i, 15)));
                  dataArray.addRow( tmpArray);
                  direction=geoView.getFormattedValue(i, 3);
                    timeCount++;
                  }//end    if (timeCount<47) {
                break;
                }//end switch
               
               
             }//end  if (geoView.getFormattedValue(i, 2)
             
        }// end  if (geoView.getFormattedValue(i, 0)
     }//end for
  
        var options = {
          title: location+'('+direction+')',
          curveType: 'function',
          legend: { position: 'bottom' }
        };

        var chart = new google.visualization.LineChart(document.getElementById(chartId));

        chart.draw(dataArray, options);


       
    }; //end this.createSLineChartObj

    
      //建立概觀圖
     this.createOverviewChartObj = function(geoChart,chartId) {

        this.chartObj = new google.charts.Bar(document.getElementById(chartId));

        var options = {
            width: 1200,
            height: 900,
            bars: 'horizontal',
            chartObj: {
                title: '各站點整月上下車刷卡量',
                /* subtitle: 'distance on the left, brightness on the right'*/
            },
            series: {
                0: {
                    axis: 'distance'
                }, // Bind series 0 to an axis named 'distance'.
                1: {
                    axis: 'brightness'
                } // Bind series 1 to an axis named 'brightness'.
            },
            axes: {
                y: {
                    distance: {
                        label: 'parsecs'
                    }, // Left y-axis.
                    brightness: {
                        side: 'right',
                        label: 'apparent magnitude'
                    } // Right y-axis.
                }
            }
        }; // end if options
        this.chartObj.draw(geoChart, options);
        return this.chartObj;
    }; //end this.createOverviewChartObj
    
    //建立站點流量圖表
      this.createStopFlowChartObj = function(StopFlowId) {
       var data = new google.visualization.DataTable();
    data.addColumn('string', 'From');
    data.addColumn('string', 'To');
    data.addColumn('number', 'Weight');
    data.addRows([
       ['西區→','北區',8902.07],
       ['北區→','西區',9714.67],
        ['北區→','東區',3079.35],
        ['北區→','中區',26557.47],
        ['北區→','南區',14379.79],
        ['北區→','西屯區',15071.69],
        ['北區→','南屯區',8944.84],
        ['北區→','北屯區',27978.82],
       ['西區→','中區',11797.51],
       ['中區→','西區',11859.29],
       ['中區→','北區',27111.09],
       ['中區→','南屯區',5873.09],
       ['中區→','西屯區',21570.16],
       ['中區→','南區',15236.12],
       ['中區→','東區',4046.4],
       ['中區→','北屯區',12816.83],
       ['西區→','東區',2352.28],
       ['東區→','西區',1695.07],
      
  ['東區→','中區',4837.14],
    ['東區→','南區',1662.75],
   ['東區→','北區',7184.67],
    ['東區→','西屯區',1756.37],
   ['東區→','南屯區',692.38],
          ['東區→','北屯區',3288.44],
       ['西區→','南區',4865.18],
       ['南區→','西區',4503.55],
       ['南區→','東區',4363.36],
        ['南區→','北屯區',2879.76],
        ['南區→','北區',10381.87],
        ['南區→','中區',14627.38],
        ['南區→','西屯區',6761.73],
        ['南區→','南屯區',4974.48],
       ['西區→','西屯區',12094.52],
       ['西屯區→','西區',12728.44],
        ['西屯區→','東區',1215.11],
        ['西屯區→','中區',22292],
        ['西屯區→','南區',9132.07],
        ['西屯區→','北區',19191.27],
        ['西屯區→','南屯區',10856.6],
        ['西屯區→','北屯區',8034.82],
       ['西區→','南屯區',6858.2],
       ['南屯區→','西區',6900.02],
           ['南屯區→','東區',774.11],
        ['南屯區→','中區',4178.5],
        ['南屯區→','南區',3850.61],
        ['南屯區→','北區',10273.52],
        ['南屯區→','西屯區',11190.67],
        ['南屯區→','北屯區',2357.51],
       ['西區→','北屯區',1622.36],
       
       ['北屯區→','東區',1269.28],
        ['北屯區→','西區',2625.52],
        ['北屯區→','中區',8385.99],
        ['北屯區→','南區',5094.7],
        ['北屯區→','北區',22665.99],
        ['北屯區→','西屯區',7999.18],
        ['北屯區→','南屯區',2639.78]
       
  
        
    ]);
    
    // Set chart options
    var options = {
      width: 500,
       sankey: {
          link: {color: { fill:'#e7711c' ,fillOpacity: 0.5}}
          } 
      
        
    };

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.Sankey(document.getElementById(StopFlowId));
    chart.draw(data, options);
      };// end this.createStopFlowChartObj


    

    //處理微觀圖表
    this.drawDetailChart = function(geoTable, rowIndex) {
       
        var headArray = ['站點', 'in', 'out'];
        var usualArray = new Array(0);
        var holidayArray = new Array(0);

        usualArray.push(geoTable.getFormattedValue(rowIndex, 2) + '平日');
        usualArray.push(geoTable.getFormattedValue(rowIndex, 5));
        usualArray.push(geoTable.getFormattedValue(rowIndex, 6));
        holidayArray.push(geoTable.getFormattedValue(rowIndex, 2) + '假日');
        holidayArray.push(geoTable.getFormattedValue(rowIndex, 7));
        holidayArray.push(geoTable.getFormattedValue(rowIndex, 8));

        var data = google.visualization.arrayToDataTable([
                headArray,
                usualArray,
                holidayArray,

            ]);

        var options = {
            width: 300,
            height: 250,
            chart: {
                title: '該站平假日上車量變化',


            }
            //bars: 'horizontal', // Required for Material Bar Charts.


        };

        var chart = new google.charts.Bar(document.getElementById('chartDetail_div'));

        chart.draw(data, options);

    }; //end drawDetailChart


}; //end CreateGeoDataObj

