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
    , jumpField = document.getElementById('jump-to-row')
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
    colWidths: [30, 100, 200, 30, 50, 47, 47, 47, 47, 47],
    columnSorting: true,
    //fixedColumnsLeft: 2,
    manualColumnFreeze: true,
    manualColumnResize: true,
    manualRowResize: true,
    minSpareRows: 10,
    //groups: true,
    afterChange: function (change, source) {
        $(eMessage).empty();
        if(change){
            //save
            if($('#autosave-feature').is(':checked')) {
                saveData();
            }
            //end save
            if(change.length>0)
                for(i=0;i<change.length;i++){
                    var cc = change[i];
                    var orRow = cc.slice(-4)[0];
                    var orCol = cc.slice(-3)[0];
                    var orHue = cc.slice(-2)[0] || 'empty value';
                    var neCol = cc.slice(-1)[0] || 'empty value';
                    var message = $(eZone).handsontable('getColHeader',orCol)+' changed from '+orHue+' to '+neCol+' on line '+(orRow+1)+', column '+(orCol+1);
                    dispMess.push(message);
                    dispRow.push(orRow);
                    dispCol.push(orCol);
                    for(j=0;j<dispMess.length;j++){
                        $(eMessage).append('<div class="status_mess num'+[j]+' new" data-column="'+dispCol[j]+'" data-row="'+dispRow[j]+'">'+dispMess[j]+'<div>');
                        $('#message div:last-child').focus();
                        $('#message div:last-child').removeClass('new');
                        updateScroll();
                    }
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
});
var hot = $(eZone).handsontable('getInstance');

function saveData() {
    $.ajax({ //saves changes from Handsontable
        url: "assets/data/test2.json",
        dataType: "json",
        type: "POST",
        data: {"data": $("#testing").handsontable('getData')}, //returns full array of grid data
        //data: change, //contains only information about changed cells
        success: function (data) {
            Date.prototype.getMinutesTwoDigits = function()
            {
                var retval = this.getMinutes();
                if (retval < 10)
                {
                    return ("0" + retval.toString());
                }
                else
                {
                    return retval.toString();
                }
            }
            Date.prototype.getHoursTwoDigits = function()
            {
                var retval = this.getHours();
                if (retval < 10)
                {
                    return ("0" + retval.toString());
                }
                else
                {
                    return retval.toString();
                }
            }
            Date.prototype.getSecondsTwoDigits = function()
            {
                var retval = this.getSeconds();
                if (retval < 10)
                {
                    return ("0" + retval.toString());
                }
                else
                {
                    return retval.toString();
                }
            }
            var d = new Date(),
                dformat = [d.getMonth() + 1,
                        d.getDate(),
                        d.getFullYear()].join('/') + ' at ' +
                    [d.getHoursTwoDigits(),
                        d.getMinutesTwoDigits(),
                        d.getSecondsTwoDigits()].join(':');
            $('.save-message').remove();
            $(eMessage).append('<div class="save-message new-atsave">Data Saved on ' + dformat + '</div>');
            setTimeout("$('.save-message').focus();$('.save-message').removeClass('new-atsave')", 1500);
            updateScroll();
        },
        error: function (data) {
            console.log("error", data);
        }
    });
}

function loadData() {
    $.ajax({
        url: 'assets/data/test2.json',
        dataType: 'json',
        type: 'GET',
        success: function (res) {
            $("#testing").handsontable("loadData", res.data);
            //$('.load-message').remove();
            $(eMessage).append('<div class="load-message new-atsave">Data loaded</div>');
            setTimeout("$('.load-message').focus();$('.load-message').removeClass('new-atsave')", 1500);
            updateScroll();
        }
    });
}
loadData();

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
$('.flush span').click(function(){
    dispMess = [];
    $(eMessage).empty();
});
$('.calc span').click(function(){
    if($('#calculator').css('display') == 'none'){
        $('#calculator').show();
        $('.calc span').html('Hide Calculator');
    }else{
        $('#calculator').hide();
        $('.calc span').html('Show Calculator');
    }

});
$('.save span').click(function(){
    saveData();
});
$('.load span').click(function(){
    loadData();
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
function updateScroll(){
    var element = document.getElementById("message");
    element.scrollTop = element.scrollHeight;
}
//calculator code
(function($) {
    $.fn.drags = function(opt) {

        opt = $.extend({handle:"",cursor:"move"}, opt);

        if(opt.handle === "") {
            var $el = this;
        } else {
            var $el = this.find(opt.handle);
        }

        return $el.css('cursor', opt.cursor).on("mousedown", function(e) {
            if(opt.handle === "") {
                var $drag = $(this).addClass('draggable');
            } else {
                var $drag = $(this).addClass('active-handle').parent().addClass('draggable');
            }
            var z_idx = $drag.css('z-index'),
                drg_h = $drag.outerHeight(),
                drg_w = $drag.outerWidth(),
                pos_y = $drag.offset().top + drg_h - e.pageY,
                pos_x = $drag.offset().left + drg_w - e.pageX;
            $drag.css('z-index', 1000).parents().on("mousemove", function(e) {
                $('.draggable').offset({
                    top:e.pageY + pos_y - drg_h,
                    left:e.pageX + pos_x - drg_w
                }).on("mouseup", function() {
                    $(this).removeClass('draggable').css('z-index', z_idx);
                });
            });
            e.preventDefault(); // disable selection
        }).on("mouseup", function() {
            if(opt.handle === "") {
                $(this).removeClass('draggable');
            } else {
                $(this).removeClass('active-handle').parent().removeClass('draggable');
            }
        });

    }
})(jQuery);
$('#calculator').drags();
// Get all the keys from document
var keys = document.querySelectorAll('#calculator span');
var operators = ['+', '-', 'x', '÷'];
var decimalAdded = false;

// Add onclick event to all the keys and perform operations
for(var i = 0; i < keys.length; i++) {
    keys[i].onclick = function(e) {
        // Get the input and button values
        var input = document.querySelector('.screen');
        var inputVal = input.innerHTML;
        var btnVal = this.innerHTML;

        // Now, just append the key values (btnValue) to the input string and finally use javascript's eval function to get the result
        // If clear key is pressed, erase everything
        if(btnVal == 'C') {
            input.innerHTML = '';
            decimalAdded = false;
        }
        if(btnVal == 'CLOSE') {
            input.innerHTML = '';
            $('#calculator').hide();
            $('.calc span').html('Show Calculator');
        }

        // If eval key is pressed, calculate and display the result
        else if(btnVal == '=') {
            var equation = inputVal;
            var lastChar = equation[equation.length - 1];

            // Replace all instances of x and ÷ with * and / respectively. This can be done easily using regex and the 'g' tag which will replace all instances of the matched character/substring
            equation = equation.replace(/x/g, '*').replace(/÷/g, '/');

            // Final thing left to do is checking the last character of the equation. If it's an operator or a decimal, remove it
            if(operators.indexOf(lastChar) > -1 || lastChar == '.')
                equation = equation.replace(/.$/, '');

            if(equation)
                input.innerHTML = eval(equation);

            decimalAdded = false;
        }

        // Basic functionality of the calculator is complete. But there are some problems like
        // 1. No two operators should be added consecutively.
        // 2. The equation shouldn't start from an operator except minus
        // 3. not more than 1 decimal should be there in a number

        // We'll fix these issues using some simple checks

        // indexOf works only in IE9+
        else if(operators.indexOf(btnVal) > -1) {
            // Operator is clicked
            // Get the last character from the equation
            var lastChar = inputVal[inputVal.length - 1];

            // Only add operator if input is not empty and there is no operator at the last
            if(inputVal != '' && operators.indexOf(lastChar) == -1)
                input.innerHTML += btnVal;

            // Allow minus if the string is empty
            else if(inputVal == '' && btnVal == '-')
                input.innerHTML += btnVal;

            // Replace the last operator (if exists) with the newly pressed operator
            if(operators.indexOf(lastChar) > -1 && inputVal.length > 1) {
                // Here, '.' matches any character while $ denotes the end of string, so anything (will be an operator in this case) at the end of string will get replaced by new operator
                input.innerHTML = inputVal.replace(/.$/, btnVal);
            }

            decimalAdded =false;
        }

        // Now only the decimal problem is left. We can solve it easily using a flag 'decimalAdded' which we'll set once the decimal is added and prevent more decimals to be added once it's set. It will be reset when an operator, eval or clear key is pressed.
        else if(btnVal == '.') {
            if(!decimalAdded) {
                input.innerHTML += btnVal;
                decimalAdded = true;
            }
        }

        // if any other key is pressed, just append it
        else {
            input.innerHTML += btnVal;
        }

        // prevent page jumps
        e.preventDefault();
    }
}