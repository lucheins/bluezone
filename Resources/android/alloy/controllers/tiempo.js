function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function selectRow(e) {
        prepaid = e.rowData.val;
        Ti.App.fireEvent("timeSet", {
            prepago: prepaid
        });
        e.rowData.hasCheck = true;
        lastRowClicked = e.rowData;
        $.tiempo.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "tiempo";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.tiempo = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "tiempo",
        navBarHidden: "true"
    });
    $.__views.tiempo && $.addTopLevelView($.__views.tiempo);
    $.__views.menu = Ti.UI.createView({
        backgroundImage: "/img/bg-TrackEsports.png",
        top: 0,
        height: 40,
        id: "menu"
    });
    $.__views.tiempo.add($.__views.menu);
    $.__views.closeTime = Ti.UI.createButton({
        top: 10,
        left: 10,
        zIndex: 1,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        backgroundColor: "#fff",
        height: 20,
        width: 50,
        id: "closeTime",
        title: "Cerrar"
    });
    $.__views.menu.add($.__views.closeTime);
    $.__views.logo = Ti.UI.createView({
        backgroundImage: "/img/qp-logo.png",
        top: "25%",
        width: "50%",
        height: "50%",
        id: "logo"
    });
    $.__views.menu.add($.__views.logo);
    var __alloyId19 = [];
    $.__views.a = Ti.UI.createTableViewRow({
        id: "a",
        val: "1",
        title: "1 hora"
    });
    __alloyId19.push($.__views.a);
    $.__views.b = Ti.UI.createTableViewRow({
        id: "b",
        val: "2",
        title: "2 horas"
    });
    __alloyId19.push($.__views.b);
    $.__views.c = Ti.UI.createTableViewRow({
        id: "c",
        val: "3",
        title: "3 horas"
    });
    __alloyId19.push($.__views.c);
    $.__views.d = Ti.UI.createTableViewRow({
        id: "d",
        val: "4",
        title: "4 horas"
    });
    __alloyId19.push($.__views.d);
    $.__views.e = Ti.UI.createTableViewRow({
        id: "e",
        val: "5",
        title: "5 horas"
    });
    __alloyId19.push($.__views.e);
    $.__views.f = Ti.UI.createTableViewRow({
        id: "f",
        val: "6",
        title: "6 horas"
    });
    __alloyId19.push($.__views.f);
    $.__views.g = Ti.UI.createTableViewRow({
        id: "g",
        val: "7",
        title: "7 horas"
    });
    __alloyId19.push($.__views.g);
    $.__views.h = Ti.UI.createTableViewRow({
        id: "h",
        val: "8",
        title: "8 horas"
    });
    __alloyId19.push($.__views.h);
    $.__views.i = Ti.UI.createTableViewRow({
        id: "i",
        val: "9",
        title: "9 horas"
    });
    __alloyId19.push($.__views.i);
    $.__views.j = Ti.UI.createTableViewRow({
        id: "j",
        val: "10",
        title: "10 horas"
    });
    __alloyId19.push($.__views.j);
    $.__views.k = Ti.UI.createTableViewRow({
        id: "k",
        val: "11",
        title: "11 horas"
    });
    __alloyId19.push($.__views.k);
    $.__views.l = Ti.UI.createTableViewRow({
        id: "l",
        val: "12",
        title: "12 horas"
    });
    __alloyId19.push($.__views.l);
    $.__views.timeTable = Ti.UI.createTableView({
        top: 40,
        data: __alloyId19,
        id: "timeTable"
    });
    $.__views.tiempo.add($.__views.timeTable);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.closeTime.addEventListener("click", function() {
        $.tiempo.close();
        $.tiempo = null;
    });
    var prepaid;
    Ti.App.addEventListener("prepaidSet", function(e) {
        prepaid = e.prepago;
    });
    $.tiempo.addEventListener("open", function() {
        var rows = $.timeTable.data[0].rows;
        for (var i = 0; rows.length > i; ++i) rows[i].val == prepaid && (rows[i].hasCheck = true);
    });
    $.timeTable.addEventListener("click", selectRow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;