function Controller() {
    function selectRow(e) {
        Ti.App.fireEvent("alarmSet", {
            text: e.rowData.text,
            background: e.rowData.img,
            actividad: e.rowData.val
        });
        e.rowData.hasCheck = true;
        alert.show();
        $.alarm.close();
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "alarm";
    arguments[0] ? arguments[0]["__parentSymbol"] : null;
    arguments[0] ? arguments[0]["$model"] : null;
    arguments[0] ? arguments[0]["__itemTemplate"] : null;
    var $ = this;
    var exports = {};
    $.__views.alarm = Ti.UI.createWindow({
        backgroundColor: "white",
        id: "alarm",
        navBarHidden: "true"
    });
    $.__views.alarm && $.addTopLevelView($.__views.alarm);
    $.__views.menu = Ti.UI.createView({
        backgroundImage: "/img/bg-TrackEsports.png",
        top: 0,
        height: 40,
        id: "menu"
    });
    $.__views.alarm.add($.__views.menu);
    $.__views.closeAlarm = Ti.UI.createButton({
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
        id: "closeAlarm",
        title: "Cerrar"
    });
    $.__views.menu.add($.__views.closeAlarm);
    $.__views.logo = Ti.UI.createView({
        backgroundImage: "/img/qp-logo.png",
        top: "25%",
        width: "50%",
        height: "50%",
        id: "logo"
    });
    $.__views.menu.add($.__views.logo);
    $.__views.five = Ti.UI.createTableViewRow({
        id: "five",
        val: "1",
        title: "5 Minutos",
        text: "5 Min.",
        img: "/img/img_run/alarma-red.png"
    });
    var __alloyId0 = [];
    __alloyId0.push($.__views.five);
    $.__views.ten = Ti.UI.createTableViewRow({
        id: "ten",
        val: "2",
        title: "10 Minutos",
        text: "10 Min.",
        img: "/img/img_run/alarma-orange.png"
    });
    __alloyId0.push($.__views.ten);
    $.__views.fifteen = Ti.UI.createTableViewRow({
        id: "fifteen",
        val: "3",
        title: "15 Minutos",
        text: "15 Min.",
        img: "/img/img_run/alarma-yellow.png"
    });
    __alloyId0.push($.__views.fifteen);
    $.__views.twenty = Ti.UI.createTableViewRow({
        id: "twenty",
        val: "4",
        title: "20 Minutos",
        text: "20 Min.",
        img: "/img/img_run/alarma-grey.png"
    });
    __alloyId0.push($.__views.twenty);
    $.__views.off = Ti.UI.createTableViewRow({
        id: "off",
        val: "5",
        title: "Off",
        text: "Off",
        img: "/img/img_run/alarma-off.png"
    });
    __alloyId0.push($.__views.off);
    $.__views.table = Ti.UI.createTableView({
        top: 40,
        data: __alloyId0,
        id: "table"
    });
    $.__views.alarm.add($.__views.table);
    exports.destroy = function() {};
    _.extend($, $.__views);
    $.closeAlarm.addEventListener("click", function() {
        $.alarm.close();
        $.alarm = null;
    });
    var activity;
    Ti.App.addEventListener("actividadSet", function(e) {
        activity = e.actividad;
        1 == activity && ($.five.hasCheck = true);
        2 == activity && ($.ten.hasCheck = true);
        3 == activity && ($.fifteen.hasCheck = true);
        4 == activity && ($.twenty.hasCheck = true);
        5 == activity && ($.off.hasCheck = true);
    });
    var alert = Ti.UI.createAlertDialog({
        title: "Alarma Ok",
        message: "La alarma del recordatorio ha sido actualizada",
        ok: "Ok"
    });
    $.table.addEventListener("click", selectRow);
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;