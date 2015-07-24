/**
 * Created by david-maser on 24/07/15.
 */
var first,
    maxed = true
    , resizeTimeout
    , availableWidth
    , availableHeight
    , $window = $(window)
    , eZone = $('#testing')
    , searchField = document.getElementById('search_field')
    , eMessage = $('#message');

var calculateSize = function () {
    var offset = eZone.offset();
    availableWidth = $window.width() - offset.left + $window.scrollLeft();
    availableHeight = $window.height() - offset.top + $window.scrollTop();
};
$window.on('resize', calculateSize);
var dispMess = [],
    dispRow = [],
    dispCol = [];
$(eZone).handsontable({
    startRows: 8,
    //startCols: 8,
    colHeaders: ['ITEM ID','BRAND', 'NAME', 'ACTIVE', 'DATE ADDED', 'COLOR', 'SEASON', 'PRICE', 'MSRP', 'SKU', 'CATEGORY'],
    rowHeaders: true,
    stretchH: 'all',
    columnSorting: true,
    fixedColumnsLeft: 2,
    afterChange: function (change, source) {
        $(eMessage).empty();
        if(change){
            if(change.length>0)
                for(i=0;i<change.length;i++){
                    var cc = change[i];
                    var orRow = cc.slice(-4)[0];
                    var orCol = cc.slice(-3)[0];
                    var orHue = cc.slice(-2)[0];
                    var neCol = cc.slice(-1)[0];
                    var message = $(eZone).handsontable('getColHeader',orCol)+' changed from '+orHue+' to '+neCol+' on line '+(orRow+1)+', column '+(orCol+1);
                    dispMess.push(message);
                    dispRow.push(orRow);
                    dispCol.push(orCol);
                    for(j=0;j<dispMess.length;j++){
                        $(eMessage).append('<div class="status_mess" data-column="'+dispCol[j]+'" data-row="'+dispRow[j]+'">'+dispMess[j]+'<div>');
                    }
                    //$('#message').html(dispMess);
                }
        }
    },
    columns: [
        {data: 0, type: 'text',editor: false},
        //data is mapped to the array index
        {data: 1,type: 'autocomplete',
            source: function (query, process) {
                $.ajax({
                    url: 'assets/data/brands.json',
                    dataType: 'json',
                    data: {
                        query: query
                    },
                    success: function (response) {
                        //process(JSON.parse(response.data)); // JSON.parse takes string as a argument
                        process(response.data);

                    }
                });
            },
            strict: false},
        {data: 2},
        // use default 'text' cell type but overwrite its renderer with yellowRenderer
        {data: 3, type: 'checkbox'},
        {data: 4, type: 'date', dateFormat: 'YYYY-MM-DD'},
        {data: 5,type: 'autocomplete',
            source: function (query, process) {
                $.ajax({
                    url: 'assets/data/colors.json',
                    dataType: 'json',
                    data: {
                        query: query
                    },
                    success: function (response) {
                        //process(JSON.parse(response.data)); // JSON.parse takes string as a argument
                        process(response.data);

                    }
                });
            },
            strict: false},
        {data: 6,type: 'autocomplete',
            source: function (query, process) {
                $.ajax({
                    url: 'assets/data/season.json',
                    dataType: 'json',
                    data: {
                        query: query
                    },
                    success: function (response) {
                        //process(JSON.parse(response.data)); // JSON.parse takes string as a argument
                        process(response.data);

                    }
                });
            },
            strict: false},
        {data: 7,
            type: 'numeric',
            format: '$0,0.00',
            language: 'en'},
        {data: 8,
            type: 'numeric',
            format: '$0,0.00',
            language: 'en'
        },
        {data: 9}
    ],
    contextMenu: true,
    search: {
        searchResultClass: 'customClass'
    },
    fillHandle: true,
    formulas: true,
    width: function () {
        if (maxed && availableWidth === void 0) {
            calculateSize();
        }
        return maxed ? availableWidth : 400;
    },
    height: function () {
        if (maxed && availableHeight === void 0) {
            calculateSize();
        }
        return maxed ? availableHeight : 300;
    }
    /*onChange: function (change) {
     if (first) {
     first = false;
     return; //don't save this change
     }
     $.ajax({ //saves changes from Handsontable
     url: "save.php",
     dataType: "json",
     type: "POST",
     data: {"data": $("#example").handsontable('getData')}, //returns full array of grid data
     //data: change, //contains only information about changed cells
     success: function (data) {
     console.log("saved", data);
     },
     error: function (data) {
     console.log("error", data);
     }
     });
     }*/
});
var hot = $(eZone).handsontable('getInstance');

$.ajax({
    url: 'assets/data/test2.json',
    dataType: 'json',
    type: 'GET',
    success: function(res){
        $("#testing").handsontable("loadData", res.data);
    }
});
function onlyExactMatch(queryStr, value) {
    return queryStr.toString() === value.toString();
}

Handsontable.Dom.addEvent(searchField, 'keyup', function (event) {
    var queryResult = hot.search.query(this.value);
    hot.render();
});
$('body').on( "click", ".status_mess", function() {
    var a = $(this).attr('data-row'),
        b = $(this).attr('data-column');
    hot.selectCell(a,b);
});
$('#sRowHead').change(function(){
    if($(this).is(':checked')){
        hot.updateSettings({
            rowHeaders: true
        });
    }else{
        hot.updateSettings({
            rowHeaders: false
        });
    }
});
$('#sColHead').change(function(){
    if($(this).is(':checked')){
        hot.updateSettings({
            colHeaders: ['ITEM ID','BRAND', 'NAME', 'ACTIVE', 'DATE ADDED', 'COLOR', 'SEASON', 'PRICE', 'MSRP', 'SKU', 'CATEGORY'],
        });
    }else{
        hot.updateSettings({
            colHeaders: false
        });
    }
});