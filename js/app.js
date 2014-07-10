//init
var myApp = new Framework7({
    modalTitle: 'Done List'
});
var $$ = Framework7.$;

function sortJsonArrayByProperty(objArray, prop, direction){
    if (arguments.length<2) throw new Error("sortJsonArrayByProp requires 2 arguments");
    var direct = arguments.length>2 ? arguments[2] : 1; //Default to ascending
    if (objArray && objArray.constructor===Array){
        var propPath = (prop.constructor===Array) ? prop : prop.split(".");
        objArray.sort(function(a,b){
            for (var p in propPath){
                if (a[propPath[p]] && b[propPath[p]]){
                    a = a[propPath[p]];
                    b = b[propPath[p]];
                }
            }
            // convert numeric strings to integers
            a = a.match(/^\d+$/) ? +a : a;
            b = b.match(/^\d+$/) ? +b : b;
            return ( (a < b) ? -1*direct : ((a > b) ? 1*direct : 0) );
        });
    }
}

// Add views
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

var curDate = (new Date()).toISOString().slice(0,10);
$$('input[name="date"]').attr('value', curDate);

var listData = localStorage.td7Data ? JSON.parse(localStorage.td7Data) : [];

$$('.popup').on('open', function () {
    $$('body').addClass('with-popup');
});
$$('.popup').on('opened', function () {
    $$(this).find('input[name="title"]').focus();
});
$$('.popup').on('close', function () {
    $$('body').removeClass('with-popup');
    $$(this).find('input[name="title"]').blur().val('');
});

// Popup colors
$$('.popup .color').on('click', function () {
    $$('.popup .color.selected').removeClass('selected');
    $$(this).addClass('selected');
});


// Add Accomplishment
$$('.popup .add-task').on('click', function () {
    var title = $$('.popup input[name="title"]').val().trim();
    var theDate = $$('.popup input[name="date"]').val().trim();
    if (title.length === 0) {
        return;
    }
    var color = $$('.popup .color.selected').attr('data-color');
    listData.push({
        title: title,
        date: theDate,
        color: color,
        checked: 'checked',
        id: (new Date()).getTime()
    });
    localStorage.td7Data = JSON.stringify(listData);
    buildTodoListHtml();
    myApp.closeModal('.popup');
});

// Build HTML
var todoItemTemplate = $$('#done-list-item-template').html();
function buildTodoListHtml() {
    var html = '';
    sortJsonArrayByProperty(listData, 'date', -1);
    for (var i = 0; i < listData.length; i++) {
        var todoItem = listData[i];
        var tDate = moment(todoItem.date);
        var aDate = moment(tDate);
        html += todoItemTemplate
                    .replace(/{{title}}/g, todoItem.title)
                    .replace(/{{date}}/g, aDate.format("dddd, MMMM Do, YYYY"))
                    .replace(/{{color}}/g, todoItem.color)
                    .replace(/{{checked}}/g, todoItem.checked)
                    .replace(/{{id}}/g, todoItem.id);
    }
    $$('.done-list-items-list ul').html(html);
}
// Build HTML on first App load
buildTodoListHtml();

// Mark checked
$$('.done-list-items-list').on('change', 'input', function () {
    var input = $$(this);
    var checked = input[0].checked;
    var id = input.parents('li').attr('data-id') * 1;
    for (var i = 0; i < listData.length; i++) {
        if (listData[i].id === id) listData[i].checked = checked ? 'checked' : '';
    }
    localStorage.td7Data = JSON.stringify(listData);
});

// Delete item
$$('.done-list-items-list').on('delete', '.swipeout', function () {
    var id = $$(this).attr('data-id') * 1;
    var index;
    for (var i = 0; i < listData.length; i++) {
        if (listData[i].id === id) index = i;
    }
    if (typeof(index) !== 'undefined') {
        listData.splice(index, 1);
        localStorage.td7Data = JSON.stringify(listData);
    }
});

// Update app when manifest updated
// http://www.html5rocks.com/en/tutorials/appcache/beginner/
// Check if a new cache is available on page load.
window.addEventListener('load', function (e) {
    window.applicationCache.addEventListener('updateready', function (e) {
        if (window.applicationCache.status === window.applicationCache.UPDATEREADY) {
            // Browser downloaded a new app cache.
            //myApp.confirm('A new version of Done List is available. Do you want to load it right now?', function () {
                window.location.reload();
            //});
        } else {
            // Manifest didn't changed. Nothing new to server.
        }
    }, false);
}, false);
