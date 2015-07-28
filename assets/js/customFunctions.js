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
    , eMessage = $('#message')
    , paginateDefault = parseInt(locStor('get','PIMsetting-paginate',null) || 20);

var calculateSize = function () {
    var offset = eZone.offset();
    availableWidth = $window.width() - offset.left + $window.scrollLeft();
    availableHeight = $window.height() - offset.top + $window.scrollTop();
};

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
    minSpareRows: 2,
    //groups: true,
    afterChange: function (change, source) {
        $(eMessage).empty();
        if(change){
            //save
            if($('#toggle-autosave').is(':checked')) {
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
        calculateSize();
    },
    beforeRender: function(){
        locStor('push');
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
            };
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
            };
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
            };
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
function hackedSplice(index, howMany /* model1, ... modelN */) {
    var args = _.toArray(arguments).slice(2).concat({at: index}),
        removed = this.models.slice(index, index + howMany);

    this.remove(removed).add.apply(this, args);

    return removed;
}
function loadData(idr,reset) {
    $.ajax({
        url: 'assets/data/test2.json',
        dataType: 'json',
        type: 'GET',
        success: function (res) {
            var page  = parseInt(window.location.hash.replace('#', ''), 10) || 1,
                limit = idr,
                row   = (page - 1) * limit,
                count = page * limit,
                apo = [],
                len = Math.round(res.data.length/limit)+1;
            for (;row < count;row++) {
                apo.push(res.data[row]);
            }
            $("#testing").handsontable("loadData", apo);
            if(reset == true){
                initPagination(1, limit, len);
            }
            $(eMessage).append('<div class="load-message new-atsave">Data loaded</div>');
            setTimeout("$('.load-message').focus();$('.load-message').removeClass('new-atsave')", 1500);
            updateScroll();
            if(page > len){
                window.location.hash = "1";
            }
        }
    });
}
loadData(parseInt(locStor('get','PIMsetting-paginate',null) || 20),true);

function onlyExactMatch(queryStr, value) {
    return queryStr.toString() === value.toString();
}
function updateScroll(){
    var element = document.getElementById("message");
    element.scrollTop = element.scrollHeight;
}
function locStor(method,elem,value){
    if(typeof(Storage) !== "undefined") {
        if(method == 'set') {
            localStorage.setItem(elem, value);
        }else if(method == 'get') {
            return localStorage.getItem(elem);
        }else if(method == 'push') {
            for (var a in localStorage) {
                initSettings(a,localStorage[a]);
            }
        }
    } else {
        alert('Browser is not up to date');
    }
}
function initPagination(min,max,units){
    $('.paginate-holder').remove();
    var currentEL = window.location.hash.replace('#','') || 1,
        markup = '<div class="paginate-holder">';
    markup += '<div class="paginate-set" data-min="'+min+'" data-max="'+max+'">';
    for(i=1;i<units;i++) {
        markup += '<div class="paginate-unit';
        if(currentEL == i){
            markup += ' current-page';
        }
        markup += '" data-unit="'+[i]+'">'+[i]+'</div>';
    }
    markup += '</div></div>';
    $('body').append(markup);
    $('body').on('click','.paginate-unit',function(){
        var a = $(this).attr('data-unit');
        window.location.hash = a;
    })

}
function initSettings(item,value){
    var initItem = item.replace('PIMsetting-','');
    var initElem = 'toggle-';
    switch(initItem){
        case 'log':
            if(value == 'true') {
                $('#'+initElem+'log').prop('checked', true);
                $('#message').show();
            }else {
                $('#'+initElem+'log').prop('checked', false);
                $('#message').hide();
            }
            break;
        case 'row':
            if(value == 'true') {
                $('#'+initElem+'row').prop('checked', true);
                hot.updateSettings({
                    rowHeaders: true
                });
            }else{
                $('#'+initElem+'row').prop('checked', false);
                hot.updateSettings({
                    rowHeaders: false
                });
            }
            break;
        case 'col':
            if(value == 'true') {
                $('#'+initElem+'col').prop('checked', true);
                hot.updateSettings({
                    colHeaders: true
                });
            }else{
                $('#'+initElem+'col').prop('checked', false);
                hot.updateSettings({
                    colHeaders: false
                });
            }
            break;
        case 'autosave':
            if(value == 'true') {
                $('#'+initElem+'autosave').prop('checked', true);
            }else{
                $('#'+initElem+'autosave').prop('checked',false);
            }
            break;
    }
}
function gutterToggle(){
    if($('.gutter').css('left') == '-400px'){
        $('.gutter').animate(
            {left:0},
            600
        );
        $('.rl.trigger').animate(
            {left:320},
            600
        );
    }else{
        $('.gutter').animate(
            {left:-400},
            300
        );
        $('.rl.trigger').animate(
            {left:420},
            500
        );
    }
}
//modal
function genModal(type,fData,title,body,cta,labels,call){
    var a = labels.split('::'),
        b = a[0],
        c = a[1];
    if(type == 'form'){
        var gen = '<div class="bi-form">',
            fdx = fData.split('::'),
            fdl = fdx.length;
        for(i=0;i<fdl;i++){
            gen += '<div class="bi-form-line">'+fdx[i]+'</div>';
        }
        gen += '</div>';

    }
    var structure = '<div class="modal message">';
    structure += '<div class="modal content">';
    structure += '<div class="modal title">'+title+'</div>';
    if(type == 'form') {
        structure += '<div class="modal body">' + gen + '</div>';
    }else{
        structure += '<div class="modal body">' + body + '</div>';
    }
    if(cta == 'prompt'){
        structure += '<div class="modal cta"><div class="il prompt hm-accept"><span>'+b+'</span></div></div>';
    }else if(cta == 'chose'){
        structure += '<div class="modal cta"><div class="il prompt hm-accept"><span>'+b+'</span></div><div class="il decline hm-refuse"><span>'+c+'</span></div></div>';
    }
    structure += '</div>';
    structure += '</div>';
    $('body').prepend(structure);
    $('.hm-accept').on('click',function(){
        if(call !== null) {
            if(call == loadData){
                loadData(parseInt(locStor('get','PIMsetting-paginate',null) || 20),null);
            }else {
                call();
            }
        }
        setTimeout("$('.modal.message').remove()",300);
    });
    $('.hm-refuse').on('click',function(){
        $('.modal.message').remove();
    })
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
            locStor('set','PIMsetting-calctop',$('#calculator').offset().top);
            locStor('set','PIMsetting-calcleft',$('#calculator').offset().left);
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
(function() {

    "use strict";

    var toggles = document.querySelectorAll(".c-hamburger");

    for (var i = toggles.length - 1; i >= 0; i--) {
        var toggle = toggles[i];
        toggleHandler(toggle);
    };

    function toggleHandler(toggle) {
        toggle.addEventListener( "click", function(e) {
            e.preventDefault();
            (this.classList.contains("is-active") === true) ? this.classList.remove("is-active") : this.classList.add("is-active");
        });
    }

})();
$('.c-hamburger').on('click',function(){
    gutterToggle();
});
$('body').on( "click", ".status_mess", function() {
    var a = $(this).attr('data-row'),
        b = $(this).attr('data-column');
    hot.selectCell(a,b);
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
    //loadData();
    genModal('mod',null,'Warning','All unsaved data will be lost. Make sure to save your work before proceding.<br/><br/>Click YES to continue or NO to return to the page.','chose','YES::NO',loadData);
});
$('.gutter-settings').click(function(){
    var log = locStor('get','PIMsetting-log',null);
    if(log == 'true' || log == null){
        var logLabel = 'checked';
    }else{
        logLabel = '';
    }
    var aSave = locStor('get','PIMsetting-autosave',null);
    if(aSave == 'true' || aSave == null){
        var saveLabel = 'checked';
    }else{
        saveLabel = '';
    }
    var aCols = locStor('get','PIMsetting-cols',null);
    if(aCols == 'true' || aCols == null){
        var colsLabel = 'checked';
    }else{
        colsLabel = '';
    }
    var aRows = locStor('get','PIMsetting-rows',null);
    if(aRows == 'true' || aRows == null){
        var rowsLabel = 'checked';
    }else{
        rowsLabel = '';
    }
        var pagiLabel = locStor('get','PIMsetting-paginate',null) || 20;
    genModal('form','<label for="toggle-log"><input type="checkbox" id="toggle-log" '+logLabel+'>Toggle Log</label>::<label for="toggle-row"><input type="checkbox" class="checkbox" id="toggle-row" '+rowsLabel+' />Show Row Headers</label>::<label for="toggle-col"><input type="checkbox" class="checkbox" id="toggle-col" '+colsLabel+' />Show Column Headers</label>::<label for="autosave-feature"><input type="checkbox" class="checkbox" id="autosave-feature" '+saveLabel+' />Autosave</label>::<label for="paginate-line" style="margin: 0 30px;">Paginate <input type="text" value="'+pagiLabel+'" id="paginate-line"> articles</label>','Settings',null,'prompt','CLOSE::NO',null);
    $('.c-hamburger').trigger('click');
});
$('body').on('change', 'input[type="checkbox"],input#paginate-line', function() {
    var a = $(this).attr('id');
    switch(a){
        case 'toggle-log':
            if($('#toggle-log').is(':checked')){
                $('#message').show();
                locStor('set','PIMsetting-log',true)
            }else{
                $('#message').hide();
                locStor('set','PIMsetting-log',false)
            }
            break;
        case 'toggle-row':
            if($('#toggle-row').is(':checked')){
                locStor('set','PIMsetting-rows',true);
                hot.updateSettings({
                    rowHeaders: true
                });
            }else{
                locStor('set','PIMsetting-rows',false);
                hot.updateSettings({
                    rowHeaders: false
                });
            }
            break;
        case 'toggle-col':
            if($('#toggle-col').is(':checked')){
                locStor('set','PIMsetting-cols',true);
                hot.updateSettings({
                    colHeaders: ['ITEM ID','BRAND', 'NAME', 'ACTIVE', 'DATE ADDED', 'COLOR', 'SEASON', 'PRICE', 'MSRP', 'SKU', 'CATEGORY'],
                });

            }else{
                locStor('set','PIMsetting-cols',false);
                hot.updateSettings({
                    colHeaders: false
                });

            }
            break;
        case 'autosave-feature':
            if($('#autosave-feature').is(':checked')){
                locStor('set','PIMsetting-autosave',true);
                $('#toggle-autosave').prop('checked',true);
            }else{
                locStor('set','PIMsetting-autosave',false);
                $('#toggle-autosave').prop('checked',false);
            }
            break;
        case 'paginate-line':
                locStor('set','PIMsetting-paginate',$(this).val());
                loadData($(this).val(),true);
            break;
    }
});
$window.on('resize', calculateSize);
Handsontable.Dom.addEvent(searchField, 'keyup', function (event) {
    var queryResult = hot.search.query(this.value);
    hot.render();
});

Handsontable.Dom.addEvent(window, 'hashchange', function (event) {
    loadData(parseInt(locStor('get','PIMsetting-paginate',null)),null);
    $('.paginate-unit').removeClass('current-page');
    var hash = window.location.hash.replace('#','');
    $('.paginate-set').find('[data-unit="'+hash+'"]').addClass('current-page');
});