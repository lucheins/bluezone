function __processArg(obj, key) {
    var arg = null;
    if (obj) {
        arg = obj[key] || null;
        delete obj[key];
    }
    return arg;
}

function Controller() {
    function endTouch() {
        buttonPressed && (buttonPressed = false);
        if ($.movableView.left >= 150 && touchRightStarted) {
            direction = "right";
            $.leftButton.touchEnabled = true;
            $.movableView.animate(animateRight);
            hasSlided = true;
        } else if (-150 >= $.movableView.left && touchLeftStarted) {
            direction = "left";
            $.rightButton.touchEnabled = true;
            $.movableView.animate(animateLeft);
            hasSlided = true;
        } else {
            direction = "reset";
            $.leftButton.touchEnabled = true;
            $.rightButton.touchEnabled = true;
            $.movableView.animate(animateReset);
            hasSlided = false;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
        touchRightStarted = false;
        touchLeftStarted = false;
    }
    function moveTouch(e) {
        var coords = $.movableView.convertPointToView({
            x: e.x,
            y: e.y
        }, $.containerview);
        var newLeft = coords.x - touchStartX;
        touchRightStarted && 250 >= newLeft && newLeft >= 0 || touchLeftStarted && 0 >= newLeft && newLeft >= -250 ? $.movableView.left = newLeft : touchRightStarted && 0 > newLeft || touchLeftStarted && newLeft > 0 ? $.movableView.left = 0 : touchRightStarted && newLeft > 250 ? $.movableView.left = 250 : touchLeftStarted && -250 > newLeft && ($.movableView.left = -250);
        if (newLeft > 5 && !touchLeftStarted && !touchRightStarted) {
            touchRightStarted = true;
            Ti.App.fireEvent("sliderToggled", {
                hasSlided: false,
                direction: "right"
            });
        } else if (-5 > newLeft && !touchRightStarted && !touchLeftStarted) {
            touchLeftStarted = true;
            Ti.App.fireEvent("sliderToggled", {
                hasSlided: false,
                direction: "left"
            });
        }
    }
    function stopRelojes() {
        clearInterval(intervalo_countdown);
        clearInterval(intervalo_cronometro);
        clearInterval(intervalo_actualizar);
        $.chrono.text = "00:00:00";
        $.countdown_label.text = "00:00:00";
        $.distancia.text = "0,00 Km.";
        testigo_pines_inicio_mapa = true;
        testigo_hora_comienzo_carrera = true;
        $.reloj_boton.backgroundImage = "/img/img_run/alarma-off.png";
        $.alarma_label.text = "Off";
        GLOBAL.actividad = 0;
        var AA01 = GLOBAL.array_posiciones.length;
        var AA04 = GLOBAL.array_km.length;
        GLOBAL.array_posiciones.splice(0, AA01);
        GLOBAL.array_km.splice(0, AA04);
    }
    function NavRules() {
        Ti.Geolocation.headingFilter = 10;
        Ti.Geolocation.Android.manualMode = true;
        var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
            name: Ti.Geolocation.PROVIDER_GPS,
            minUpdateDistance: 0,
            minUpdateTime: 0
        });
        Ti.Geolocation.Android.addLocationProvider(gpsProvider);
        var networkProvider = Ti.Geolocation.Android.createLocationProvider({
            name: Ti.Geolocation.PROVIDER_NETWORK,
            minUpdateTime: 3,
            minUpdateDistance: 30
        });
        Ti.Geolocation.Android.addLocationProvider(networkProvider);
        var gpsRule = Ti.Geolocation.Android.createLocationRule({
            provider: Ti.Geolocation.PROVIDER_GPS,
            accuracy: 100,
            maxAge: 5e3,
            minAge: 3e3
        });
        Ti.Geolocation.Android.addLocationRule(gpsRule);
    }
    function getLocation() {
        Titanium.Geolocation.getCurrentPosition(function(e) {
            if (e.error || !e.success) {
                $.gpsOff.show();
                gpsLow.show();
                return;
            }
            if (e.success) {
                location_coords = e.coords;
                gpsLow.hide();
                $.gpsOff.hide();
            }
            var region = {
                latitude: e.coords.latitude,
                longitude: e.coords.longitude,
                animate: true,
                latitudeDelta: .002,
                longitudeDelta: .002
            };
            mapview.setRegion(region);
            lat = e.coords.latitude;
            lng = e.coords.longitude;
            velocidad = e.coords.speed;
            accuracy = e.coords.accuracy;
            GLOBAL.accuracy = accuracy.toFixed(0);
            velocidadResult = 0 > velocidad ? 0 : 60 * velocidad;
            var velocidadFixed = velocidadResult.toFixed(0);
            GLOBAL.velocidad = velocidadFixed;
            $.accuracy_label.text = GLOBAL.accuracy + " m";
            $.velocidad_label.text = GLOBAL.velocidad;
            altitud = e.coords.altitude;
            $.altitud_label.text = altitud.toFixed(0) + " m";
            GLOBAL.altitud = altitud.toFixed(0);
        });
    }
    function fullMap() {
        var height = Titanium.Platform.displayCaps.platformHeight;
        var heightExpanded = height - 105;
        $.mapa.animate({
            top: 5,
            height: heightExpanded,
            duration: 500
        });
        mapview.height = heightExpanded;
        mapview.regionFit = true, $.fullMap.hide();
        $.smallMap.show();
    }
    function smallMap() {
        var height = Titanium.Platform.displayCaps.platformHeight;
        var heightExpanded = height - 230;
        $.mapa.animate({
            top: 140,
            height: heightExpanded,
            duration: 500
        });
        setTimeout(function() {
            mapview.height = heightExpanded;
            mapview.regionFit = true;
        }, 400);
        $.fullMap.show();
        $.smallMap.hide();
    }
    function actualizar(GLOBAL) {
        intervalo_actualizar = setInterval(function() {
            $.accuracy_label.text = GLOBAL.accuracy + " m";
            $.hora_label.text = HERRAMIENTAS.HoraMinutos();
            var posiciones = [ lat, lng, GLOBAL.altitud, GLOBAL.distancia_km_mill ];
            GLOBAL.array_posiciones.push(posiciones);
            var kilometros = HERRAMIENTAS.Calcular_km(GLOBAL);
            $.distancia.text = kilometros;
            HERRAMIENTAS.Minutos_x_Km(GLOBAL);
            cada_km += GLOBAL.distancia_km_mill_intervalos;
            cada_km_dos_decimales = cada_km.toFixed(2);
            if (cada_km_dos_decimales > 1) {
                var num_texto = GLOBAL.distancia_km_mill + "";
                var cad = ".";
                var pos = num_texto.indexOf(cad);
                var dos = "0." + num_texto.substr(pos + cad.length);
                var sumar_resto_decimales = parseFloat(dos);
                cada_km = sumar_resto_decimales;
                cuantos_km += 1;
                Ti.API.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
                Ti.API.log("----------------- SE HA HECHO 1 QUILOMETRO!!!!!!!!!!!!! -----------------");
                Ti.API.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
                posiciones_KM = [ lat, lng, cuantos_km ];
                GLOBAL.array_km.push(posiciones_KM);
            }
        }, 3e3);
    }
    function sendActividad() {
        Ti.App.fireEvent("actividadSet", {
            actividad: GLOBAL.actividad
        });
    }
    function sendPrepaid() {
        Ti.App.fireEvent("prepaidSet", {
            prepago: GLOBAL.prepago
        });
    }
    require("alloy/controllers/BaseController").apply(this, Array.prototype.slice.call(arguments));
    this.__controllerPath = "index";
    if (arguments[0]) {
        __processArg(arguments[0], "__parentSymbol");
        __processArg(arguments[0], "$model");
        __processArg(arguments[0], "__itemTemplate");
    }
    var $ = this;
    var exports = {};
    $.__views.index = Ti.UI.createWindow({
        exitOnClose: "false",
        orientation: "vertical",
        id: "index"
    });
    $.__views.index && $.addTopLevelView($.__views.index);
    $.__views.containerview = Ti.UI.createView({
        id: "containerview"
    });
    $.__views.index.add($.__views.containerview);
    $.__views.menu = Ti.UI.createView({
        backgroundImage: "/img/bg-TrackEsports.png",
        top: 0,
        height: 40,
        id: "menu"
    });
    $.__views.containerview.add($.__views.menu);
    $.__views.leftButton = Ti.UI.createButton({
        backgroundImage: "none",
        image: "/img/ButtonMenu.png",
        left: "0",
        top: "0",
        width: "60",
        height: "44",
        style: "none",
        id: "leftButton"
    });
    $.__views.menu.add($.__views.leftButton);
    $.__views.rightButton = Ti.UI.createButton({
        backgroundImage: "none",
        image: "/img/ButtonMenu.png",
        right: "0",
        top: "0",
        width: "60",
        height: "44",
        style: "none",
        id: "rightButton",
        visible: "false"
    });
    $.__views.menu.add($.__views.rightButton);
    $.__views.logo = Ti.UI.createView({
        backgroundImage: "/img/qp-logo.png",
        top: "25%",
        width: "50%",
        height: "50%",
        id: "logo"
    });
    $.__views.menu.add($.__views.logo);
    $.__views.leftMenu = Ti.UI.createView({
        height: "100%",
        left: 0,
        top: 40,
        backgroundColor: "#595858",
        backgroundGradient: {
            type: "linear",
            colors: [ "#595858", "#232323" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: "100%"
            },
            backFillStart: true
        },
        zIndex: 50,
        width: "250dp",
        color: "white",
        id: "leftMenu"
    });
    $.__views.containerview.add($.__views.leftMenu);
    var __alloyId1 = [];
    $.__views.__alloyId2 = Ti.UI.createTableViewSection({
        rowCount: "4",
        id: "__alloyId2"
    });
    __alloyId1.push($.__views.__alloyId2);
    $.__views.__alloyId3 = Ti.UI.createTableViewRow({
        backgroundColor: "#591c1f",
        color: "#9b9b9b",
        font: {
            fontSize: 14
        },
        title: "Mis Datos",
        height: "34",
        indentionLevel: "0",
        id: "__alloyId3"
    });
    $.__views.__alloyId2.add($.__views.__alloyId3);
    $.__views.__alloyId4 = Ti.UI.createTableViewRow({
        backgroundColor: "#595858",
        color: "#dfdfdf",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        title: "Usuario",
        height: "46",
        indentionLevel: "1",
        id: "__alloyId4"
    });
    $.__views.__alloyId2.add($.__views.__alloyId4);
    $.__views.__alloyId5 = Ti.UI.createTableViewRow({
        backgroundColor: "#595858",
        color: "#dfdfdf",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        title: "Nombre",
        height: "46",
        indentionLevel: "1",
        id: "__alloyId5"
    });
    $.__views.__alloyId2.add($.__views.__alloyId5);
    $.__views.__alloyId6 = Ti.UI.createTableViewRow({
        backgroundColor: "#595858",
        color: "#dfdfdf",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        title: "Auto",
        height: "46",
        indentionLevel: "1",
        id: "__alloyId6"
    });
    $.__views.__alloyId2.add($.__views.__alloyId6);
    $.__views.__alloyId7 = Ti.UI.createTableViewSection({
        rowCount: "3",
        id: "__alloyId7"
    });
    __alloyId1.push($.__views.__alloyId7);
    $.__views.__alloyId8 = Ti.UI.createTableViewRow({
        backgroundColor: "#591c1f",
        color: "#9b9b9b",
        font: {
            fontSize: 14
        },
        title: "Opciones de Parqueo",
        height: "34",
        indentionLevel: "0",
        id: "__alloyId8"
    });
    $.__views.__alloyId7.add($.__views.__alloyId8);
    $.__views.__alloyId9 = Ti.UI.createTableViewRow({
        backgroundColor: "#595858",
        color: "#dfdfdf",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        title: "Prepago - Zona Azul",
        height: "46",
        indentionLevel: "1",
        id: "__alloyId9"
    });
    $.__views.__alloyId7.add($.__views.__alloyId9);
    $.__views.__alloyId10 = Ti.UI.createTableViewRow({
        backgroundColor: "#595858",
        color: "#dfdfdf",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        title: "Postpago - Parquedero",
        height: "46",
        indentionLevel: "1",
        id: "__alloyId10"
    });
    $.__views.__alloyId7.add($.__views.__alloyId10);
    $.__views.tableMenu = Ti.UI.createTableView({
        backgroundColor: "transparent",
        separatorColor: "black",
        top: 0,
        data: __alloyId1,
        id: "tableMenu",
        scrollable: "false",
        footerTitle: "",
        left: "0"
    });
    $.__views.leftMenu.add($.__views.tableMenu);
    $.__views.movableView = Ti.UI.createView({
        top: 40,
        zIndex: 100,
        width: "100%",
        id: "movableView"
    });
    $.__views.containerview.add($.__views.movableView);
    $.__views.moveControl = Ti.UI.createView({
        left: 0,
        width: 20,
        backgroundColor: "transparent",
        top: 0,
        height: "100%",
        zIndex: 15e3,
        id: "moveControl"
    });
    $.__views.movableView.add($.__views.moveControl);
    var __alloyId11 = [];
    $.__views.vistaChrono = Ti.UI.createView({
        id: "vistaChrono",
        backgroundColor: "transparent"
    });
    __alloyId11.push($.__views.vistaChrono);
    $.__views.chrono = Ti.UI.createLabel({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 47
        },
        top: 0,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        color: "#fff",
        id: "chrono"
    });
    $.__views.vistaChrono.add($.__views.chrono);
    $.__views.chronoText = Ti.UI.createLabel({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 12
        },
        top: 50,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        color: "#fff",
        height: 15,
        text: "Tiempo De Parqueo",
        id: "chronoText"
    });
    $.__views.vistaChrono.add($.__views.chronoText);
    $.__views.vistaDistance = Ti.UI.createView({
        id: "vistaDistance",
        backgroundColor: "transparent"
    });
    __alloyId11.push($.__views.vistaDistance);
    $.__views.velocidad_label = Ti.UI.createLabel({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 47
        },
        top: 0,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        color: "#fff",
        id: "velocidad_label"
    });
    $.__views.vistaDistance.add($.__views.velocidad_label);
    $.__views.chronoText = Ti.UI.createLabel({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 12
        },
        top: 50,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        color: "#fff",
        height: 15,
        text: "Velocidad (metros/min.)",
        id: "chronoText"
    });
    $.__views.vistaDistance.add($.__views.chronoText);
    $.__views.topInfo = Ti.UI.createScrollableView({
        backgroundImage: "/img/img_run/bg_vistas_crono_km.png",
        backgroundRepeat: true,
        showPagingControl: false,
        pagingControlHeight: 15,
        maxZoomScale: 2,
        currentPage: 0,
        pagingControlColor: "transparent",
        top: 0,
        height: 80,
        views: __alloyId11,
        id: "topInfo"
    });
    $.__views.movableView.add($.__views.topInfo);
    var __alloyId12 = [];
    $.__views.scrollView = Ti.UI.createView({
        top: 0,
        height: 60,
        width: "100%",
        backgroundImage: "/img/img_run/bg_vista_datos_lineas.png",
        backgroundRepeat: false,
        id: "scrollView"
    });
    __alloyId12.push($.__views.scrollView);
    $.__views.alarma = Ti.UI.createView({
        left: 0,
        width: "33%",
        id: "alarma"
    });
    $.__views.scrollView.add($.__views.alarma);
    $.__views.reloj_boton = Ti.UI.createButton({
        backgroundImage: "/img/img_run/alarma-off.png",
        height: 18,
        width: 18,
        top: 13,
        right: 0,
        id: "reloj_boton",
        enabled: "true"
    });
    $.__views.alarma.add($.__views.reloj_boton);
    $.__views.alarma_label = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        text: "Off",
        id: "alarma_label"
    });
    $.__views.alarma.add($.__views.alarma_label);
    $.__views.__alloyId13 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Recordatorio",
        id: "__alloyId13"
    });
    $.__views.alarma.add($.__views.__alloyId13);
    $.__views.restante = Ti.UI.createView({
        left: "34%",
        width: "33%",
        id: "restante"
    });
    $.__views.scrollView.add($.__views.restante);
    $.__views.countdown_label = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        text: "00:00:00",
        id: "countdown_label"
    });
    $.__views.restante.add($.__views.countdown_label);
    $.__views.__alloyId14 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Pre-Pagado",
        id: "__alloyId14"
    });
    $.__views.restante.add($.__views.__alloyId14);
    $.__views.velocidad = Ti.UI.createView({
        left: "67%",
        width: "33%",
        id: "velocidad"
    });
    $.__views.scrollView.add($.__views.velocidad);
    $.__views.distancia = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        id: "distancia"
    });
    $.__views.velocidad.add($.__views.distancia);
    $.__views.__alloyId15 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Distancia Caminada",
        id: "__alloyId15"
    });
    $.__views.velocidad.add($.__views.__alloyId15);
    $.__views.scrollView2 = Ti.UI.createView({
        top: 0,
        height: 60,
        width: "100%",
        backgroundImage: "/img/img_run/bg_vista_datos_lineas.png",
        backgroundRepeat: false,
        id: "scrollView2"
    });
    __alloyId12.push($.__views.scrollView2);
    $.__views.llegada = Ti.UI.createView({
        left: 0,
        width: "33%",
        id: "llegada"
    });
    $.__views.scrollView2.add($.__views.llegada);
    $.__views.accuracy_label = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        text: "0",
        id: "accuracy_label"
    });
    $.__views.llegada.add($.__views.accuracy_label);
    $.__views.__alloyId16 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Exactitud GPS",
        id: "__alloyId16"
    });
    $.__views.llegada.add($.__views.__alloyId16);
    $.__views.altitud = Ti.UI.createView({
        left: "34%",
        width: "33%",
        id: "altitud"
    });
    $.__views.scrollView2.add($.__views.altitud);
    $.__views.altitud_label = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        text: "N/D",
        id: "altitud_label"
    });
    $.__views.altitud.add($.__views.altitud_label);
    $.__views.__alloyId17 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Altimetro",
        id: "__alloyId17"
    });
    $.__views.altitud.add($.__views.__alloyId17);
    $.__views.hora = Ti.UI.createView({
        left: "67%",
        width: "33%",
        id: "hora"
    });
    $.__views.scrollView2.add($.__views.hora);
    $.__views.hora_label = Ti.UI.createLabel({
        top: "18%",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16
        },
        color: "black",
        textAlign: "center",
        id: "hora_label"
    });
    $.__views.hora.add($.__views.hora_label);
    $.__views.__alloyId18 = Ti.UI.createLabel({
        top: "51%",
        height: "23%",
        font: {
            fontFamily: "HelveticaNeue-Light",
            fontSize: 11
        },
        color: "#464646",
        shadowColor: "#dddddd",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        text: "Hora Actual",
        id: "__alloyId18"
    });
    $.__views.hora.add($.__views.__alloyId18);
    $.__views.data = Ti.UI.createScrollableView({
        top: 80,
        width: "100%",
        height: 60,
        backgroundImage: "/img/img_run/bg_vista_datos.png",
        showPagingControl: false,
        pagingControlHeight: 15,
        maxZoomScale: 2,
        currentPage: 0,
        pagingControlColor: "transparent",
        views: __alloyId12,
        id: "data"
    });
    $.__views.movableView.add($.__views.data);
    $.__views.mapa = Ti.UI.createView({
        top: 140,
        backgroundImage: "/img/img_run/bg_vistas_crono_km.png",
        backgroundRepeat: true,
        zIndex: 0,
        id: "mapa"
    });
    $.__views.movableView.add($.__views.mapa);
    $.__views.satellite = Ti.UI.createButton({
        height: 40,
        width: 40,
        backgroundImage: "/img/img_run/icono_aspecto_mapa.png",
        zIndex: 1,
        top: 10,
        left: 20,
        id: "satellite"
    });
    $.__views.mapa.add($.__views.satellite);
    $.__views.fullMap = Ti.UI.createButton({
        top: 10,
        right: 10,
        zIndex: 1,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        backgroundColor: "#fff",
        height: 30,
        width: 80,
        id: "fullMap",
        title: "Expandir"
    });
    $.__views.mapa.add($.__views.fullMap);
    $.__views.smallMap = Ti.UI.createButton({
        top: 10,
        right: 10,
        zIndex: 1,
        borderRadius: 5,
        shadowColor: "#000",
        shadowOffset: {
            x: 1,
            y: 1
        },
        backgroundColor: "#fff",
        height: 30,
        width: 80,
        id: "smallMap",
        title: "Contraer"
    });
    $.__views.mapa.add($.__views.smallMap);
    $.__views.activityView = Ti.UI.createView({
        color: "#000",
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        borderRadius: 5,
        border: 1,
        borderColor: "gray",
        shadowColor: "grey",
        shadowOffset: {
            x: 1,
            y: 1
        },
        top: "20%",
        left: "20%",
        width: "60%",
        zIndex: 1e3,
        height: "15%",
        backgroundGradient: {
            type: "linear",
            colors: [ "#f2f2f2", "#ffffff" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        opacity: .8,
        id: "activityView",
        visible: "false"
    });
    $.__views.mapa.add($.__views.activityView);
    $.__views.ActivityIndicator = Ti.UI.createActivityIndicator({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 16,
            fontWeight: "bold"
        },
        top: "30%",
        left: "5%",
        height: "40%",
        width: "90%",
        zIndex: 2e3,
        color: "#000",
        id: "ActivityIndicator",
        indicatorColor: "#000",
        message: " Buscando Auto",
        visible: "false"
    });
    $.__views.activityView.add($.__views.ActivityIndicator);
    $.__views.bottomShadow = Ti.UI.createView({
        opacity: "0.5",
        backgroundGradient: {
            type: "linear",
            colors: [ "#787878", "transparent" ],
            startPoint: {
                x: 0,
                y: "100%"
            },
            endPoint: {
                x: 0,
                y: 0
            }
        },
        bottom: 50,
        height: 5,
        width: "100%",
        id: "bottomShadow"
    });
    $.__views.movableView.add($.__views.bottomShadow);
    $.__views.bottom = Ti.UI.createView({
        width: "100%",
        height: 50,
        bottom: 0,
        zIndex: 1e4,
        id: "bottom"
    });
    $.__views.movableView.add($.__views.bottom);
    $.__views.gpsOff = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 3e3,
        width: "65%",
        bottom: 0,
        left: 0,
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#a30000", "#820000" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "gpsOff",
        title: "GPS sin ubicacion"
    });
    $.__views.bottom.add($.__views.gpsOff);
    $.__views.start = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 900,
        width: "65%",
        bottom: 0,
        left: 0,
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#46a6eb", "#186ba8" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "start",
        title: "Marcar Parqueo"
    });
    $.__views.bottom.add($.__views.start);
    $.__views.buscar = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 1e3,
        width: "65%",
        bottom: 0,
        left: 0,
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#186ba8", "#113652" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "buscar",
        title: "Buscar Auto"
    });
    $.__views.bottom.add($.__views.buscar);
    $.__views.reintentar = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 1e3,
        width: "65%",
        bottom: 0,
        left: 0,
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#46a6eb", "#186ba8" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "reintentar",
        title: "Limpiar Ruta"
    });
    $.__views.bottom.add($.__views.reintentar);
    $.__views.stop = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 1e3,
        width: "35%",
        bottom: 0,
        left: "65%",
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#595858", "#232323" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "stop",
        title: "Terminar"
    });
    $.__views.bottom.add($.__views.stop);
    $.__views.prepaid = Ti.UI.createButton({
        font: {
            fontFamily: "HelveticaNeue-CondensedBold",
            fontSize: 17,
            fontWeight: "bold"
        },
        color: "#fff",
        shadowColor: "#02487a",
        shadowOffset: {
            x: 1,
            y: 1
        },
        textAlign: "center",
        zIndex: 1e3,
        width: "35%",
        bottom: 0,
        left: "65%",
        style: Titanium.UI.iPhone.SystemButtonStyle.PLAIN,
        backgroundGradient: {
            type: "linear",
            colors: [ "#186ba8", "#113652" ],
            startPoint: {
                x: 0,
                y: 0
            },
            endPoint: {
                x: 0,
                y: 70
            },
            backFillStart: true
        },
        height: 50,
        id: "prepaid",
        title: "+ Tiempo"
    });
    $.__views.bottom.add($.__views.prepaid);
    exports.destroy = function() {};
    _.extend($, $.__views);
    var HERRAMIENTAS = require("Herramientas");
    var height = Titanium.Platform.displayCaps.platformHeight;
    Titanium.Platform.displayCaps.platformWidth;
    $.index.addEventListener("android:back", function() {});
    var animateRight = Ti.UI.createAnimation({
        left: 250,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var animateReset = Ti.UI.createAnimation({
        left: 0,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var animateLeft = Ti.UI.createAnimation({
        left: -250,
        curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
        duration: 150
    });
    var touchStartX = 0;
    var touchRightStarted = false;
    var touchLeftStarted = false;
    var buttonPressed = false;
    var hasSlided = false;
    var direction = "reset";
    $.movableView.addEventListener("touchstart", function(e) {
        touchStartX = e.x;
    });
    $.leftMenu.addEventListener("touchstart", function(e) {
        touchStartX = e.x;
    });
    $.movableView.addEventListener("touchend", endTouch);
    $.leftMenu.addEventListener("touchend", endTouch);
    $.movableView.addEventListener("touchmove", moveTouch);
    $.leftMenu.addEventListener("touchmove", moveTouch);
    $.leftButton.addEventListener("touchend", function() {
        if (!touchRightStarted && !touchLeftStarted) {
            buttonPressed = true;
            $.toggleLeftSlider();
        }
    });
    $.rightButton.addEventListener("touchend", function() {
        if (!touchRightStarted && !touchLeftStarted) {
            buttonPressed = true;
            $.toggleRightSlider();
        }
    });
    exports.toggleLeftSlider = function() {
        if (hasSlided) {
            direction = "reset";
            $.leftButton.touchEnabled = true;
            $.movableView.animate(animateReset);
            hasSlided = false;
        } else {
            direction = "right";
            $.leftButton.touchEnabled = true;
            $.movableView.animate(animateRight);
            hasSlided = true;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
    };
    exports.toggleRightSlider = function() {
        if (hasSlided) {
            direction = "reset";
            $.rightButton.touchEnabled = true;
            $.movableView.animate(animateReset);
            hasSlided = false;
        } else {
            direction = "left";
            $.rightButton.touchEnabled = true;
            $.movableView.animate(animateLeft);
            hasSlided = true;
        }
        Ti.App.fireEvent("sliderToggled", {
            hasSlided: hasSlided,
            direction: direction
        });
    };
    $.index.open();
    HERRAMIENTAS.HoraActual();
    $.hora_label.text = HERRAMIENTAS.HoraMinutos();
    $.chrono.text = "00:00:00";
    $.distancia.text = "0,00 Km.";
    $.velocidad_label.text = "0";
    var intervalo_cronometro, intervalo_actualizar, intervalo_countdown;
    var mapview;
    var lat, lng, altitud;
    var testigo_hora_comienzo_carrera = true;
    var testigo_pines_inicio_mapa = false;
    var velocidad;
    var pin_final, pin_km;
    var posiciones_KM;
    var GLOBAL = {
        posicion_inicio: [],
        posicion_final: [],
        cronometro: "00:00:00",
        distancia_km_mill: parseFloat(0),
        distancia_km_mill_variable: parseFloat(0),
        distancia_km_mill_intervalos: parseFloat(0),
        altitud: parseFloat(0),
        velocidad: parseFloat(0),
        min_x_km: "00:00",
        actividad: parseFloat(5),
        prepago: parseFloat(0),
        countdown: "00:00:00",
        hora_inicio: "",
        hora_final: "",
        unidades: "Km.",
        array_posiciones: [],
        array_km: [],
        activeRoutes: [],
        ultimopin: [],
        primerpin: [],
        heading: parseFloat(0),
        accuracy: parseFloat(0)
    };
    var Map = require("ti.map");
    var mapview = Map.createView({
        width: "100%",
        top: 0,
        height: height - 230,
        mapType: Map.STANDARD_TYPE,
        animate: true,
        regionFit: true,
        userLocation: true,
        visible: true,
        name: "mapview",
        keepScreenOn: true
    });
    $.mapa.add(mapview);
    $.start.addEventListener("click", function() {
        function getPinInicio() {
            var latValue = pin_inicio.getLatitude();
            var longValue = pin_inicio.getLongitude();
            return latValue + "," + longValue;
        }
        function HoraLocal() {
            var hora_actual_raw = new Date();
            hora_actual_raw.getTime();
            hora_actual_raw.toString();
            return hora_actual_raw;
        }
        function HoraExpiracion() {
            var hora_actual_string = new Date();
            hora_actual_string.getTime();
            hora_actual_string.toString();
            hora_actual_string.setHours(hora_actual_string.getHours() + parseInt(datestampTarjetas));
            hora_actual_string.toString();
            return hora_actual_string;
        }
        $.start.hide();
        $.buscar.show();
        $.prepaid.hide();
        $.stop.show();
        if (testigo_pines_inicio_mapa) {
            mapview.removeAnnotation(pin_inicio);
            mapview.removeAnnotation(pin_final);
            mapview.removeAnnotation(pin_km);
        }
        if (testigo_hora_comienzo_carrera) {
            GLOBAL.hora_inicio = HERRAMIENTAS.HoraActual();
            var pin_inicio = Map.createAnnotation({
                latitude: lat,
                longitude: lng,
                title: "Auto",
                pincolor: Map.ANNOTATION_GREEN,
                animate: true
            });
            var PinInicio = getPinInicio();
            GLOBAL.posicion_inicio.push(PinInicio);
            mapview.addAnnotation(pin_inicio);
            testigo_hora_comienzo_carrera = false;
        }
        actualizar(GLOBAL);
        var print_inicio = HoraLocal();
        intervalo_cronometro = setInterval(function() {
            var cronometro_actualizado = HoraLocal();
            var hora_local = (cronometro_actualizado - print_inicio) / 1e3;
            days = parseInt(hora_local / 86400);
            hora_local %= 86400;
            hours = parseInt(hora_local / 3600);
            hora_local %= 3600;
            minutes = parseInt(hora_local / 60);
            seconds = parseInt(hora_local % 60);
            10 > hours && (hours = "0" + hours);
            10 > minutes && (minutes = "0" + minutes);
            10 > seconds && (seconds = "0" + seconds);
            GLOBAL.cronometro = hours + ":" + minutes + ":" + seconds;
            $.chrono.text = GLOBAL.cronometro;
        }, 1e3);
        var datestampTarjetas = GLOBAL.prepago;
        var datestampTexto = GLOBAL.prepago;
        10 > datestampTarjetas && (datestampTarjetas = "0" + datestampTarjetas);
        var tiempoTarjetas = datestampTarjetas + ":00:00";
        $.countdown_label.text = tiempoTarjetas;
        expiracionTarjeta = HoraExpiracion();
        inicioTarjeta = HERRAMIENTAS.HoraActualString();
        intervalo_countdown = setInterval(function() {
            var seconds_left_raw = (expiracionTarjeta - HERRAMIENTAS.HoraActualString()) / 1e3;
            var seconds_left = seconds_left_raw.toFixed(0);
            if (0 != GLOBAL.prepago) {
                901 >= seconds_left && ($.countdown_label.color = "#FFD700");
                661 >= seconds_left && ($.countdown_label.color = "#FFA500");
                301 >= seconds_left && ($.countdown_label.color = "#FF4500");
            }
            if (0 >= seconds_left) hours = "00", minutes = "00", seconds = "00"; else {
                days = parseInt(seconds_left / 86400);
                seconds_left %= 86400;
                hours = parseInt(seconds_left / 3600);
                seconds_left %= 3600;
                minutes = parseInt(seconds_left / 60);
                seconds = parseInt(seconds_left % 60);
                10 > hours && (hours = "0" + hours);
                10 > minutes && (minutes = "0" + minutes);
                10 > seconds && (seconds = "0" + seconds);
            }
            $.countdown_label.text = hours + ":" + minutes + ":" + seconds;
            0 >= seconds_left && clearInterval(intervalo_countdown);
        }, 1e4);
        var timeout = expiracionTarjeta - inicioTarjeta;
        1 == datestampTarjetas && (horaPlural = " hora");
        datestampTarjetas > 1 && (horaPlural = " horas");
        datestampTarjetas > 0 && (timeoutMsg = "con un tiempo prepagado de " + datestampTexto + horaPlural);
        0 == datestampTarjetas && (timeoutMsg = "");
        var alertInicio = Ti.UI.createAlertDialog({
            title: "Lugar de Parqueo Marcado",
            message: "La ubicacion de tu auto ha sido marcada con exito " + timeoutMsg,
            ok: "OK"
        });
        alertInicio.show();
        timeout >= 0 && 0 != GLOBAL.prepago && (done = setInterval(function() {
            clearInterval(intervalo_countdown);
            var alertPrepago = Ti.UI.createAlertDialog({
                title: "Tiempo Expirado",
                message: "El tiempo de parqueo prepagado ha expirado",
                ok: "OK"
            });
            alertPrepago.show();
            clearInterval(done);
        }, timeout));
    });
    var inicioPin = GLOBAL.posicion_inicio;
    var gd = require("de.codewire.google.directions");
    var activeRoutes = [];
    var removeAllRoutes = function() {
        for (var idx in activeRoutes) {
            var route = activeRoutes[idx];
            mapview.removeRoute(route);
        }
        activeRoutes = [];
        GLOBAL.posicion_final = [];
    };
    var anchoLinea;
    anchoLinea = 5;
    $.buscar.addEventListener("click", function() {
        var url = "http://google.com/maps";
        $.activityView.show();
        $.ActivityIndicator.show();
        var client = Ti.Network.createHTTPClient({
            onload: function() {
                function getPinFinal() {
                    var latValue = pin_final.getLatitude();
                    var longValue = pin_final.getLongitude();
                    return latValue + "," + longValue;
                }
                $.activityView.hide();
                $.ActivityIndicator.hide();
                testigo_pines_inicio_mapa = true;
                var pin_final = Map.createAnnotation({
                    latitude: lat,
                    longitude: lng,
                    title: "Inicio",
                    pincolor: Map.ANNOTATION_RED,
                    animate: true
                });
                mapview.addAnnotation(pin_final);
                var PinFinal = getPinFinal();
                GLOBAL.posicion_final.push(PinFinal);
                var finalPin = GLOBAL.posicion_final;
                gd.getRoute({
                    origin: finalPin,
                    destination: inicioPin,
                    color: "#ff5e4d",
                    mode: gd.travelModes.walking,
                    name: "single",
                    width: anchoLinea,
                    callback: function(response) {
                        if ("OK" == response.status) {
                            mapview.setRegion({
                                latitude: response.route.points[0].latitude,
                                longitude: response.route.points[0].longitude,
                                longitudeDelta: .002,
                                latitudeDelta: .002
                            });
                            mapview.addRoute(response.route);
                            activeRoutes.push(response.route);
                            for (var idx in response.route.points) {
                                var point = response.route.points[idx];
                                if (point.isMaster) {
                                    point.distance;
                                    point.duration;
                                    point.instruction;
                                }
                            }
                        } else alert(response.msg);
                    }
                });
                $.buscar.hide();
                $.reintentar.show();
            },
            onerror: function() {
                $.activityView.hide();
                $.ActivityIndicator.hide();
                var directionsError = Ti.UI.createAlertDialog({
                    title: "Conectividad Limitada",
                    message: "Al momento tu dispositivo no tiene coneccion al internet. Conectate a la red de datos o wifi para buscar tu auto",
                    ok: "OK"
                });
                directionsError.show();
                Ti.API.info("error");
            },
            timeout: 8e3
        });
        client.open("GET", url);
        client.send();
    });
    $.reintentar.addEventListener("click", function() {
        $.reintentar.hide();
        mapview.removeAnnotation("Inicio");
        removeAllRoutes();
        $.buscar.show();
    });
    $.stop.addEventListener("click", function() {
        $.reintentar.hide();
        mapview.removeAnnotation("Inicio");
        removeAllRoutes();
        mapview.removeAnnotation("Auto");
        GLOBAL.posicion_inicio = [];
        GLOBAL.posicion_final = [];
        $.buscar.hide();
        $.start.show();
        $.prepaid.show();
        $.stop.hide();
        stopRelojes();
        $.prepaid.title = "+ Tiempo";
        GLOBAL.prepago = parseFloat(0);
        GLOBAL.actividad = parseFloat(5);
        $.countdown_label.color = "#000";
    });
    var gpsApagado = Ti.UI.createAlertDialog({
        title: "GPS Limitada",
        message: "Activa el GPS para poder utilizar el servicio de mapas",
        ok: "OK"
    });
    var gpsLow = Ti.UI.createAlertDialog({
        title: "Buscando GPS",
        message: "Utiliza la app en tu auto o sal a un espacio abierto",
        ok: "OK"
    });
    var location_coords;
    NavRules();
    var locationAdded = false;
    var handleLocation = function(e) {
        e.error || Ti.API.info(e.coords);
        getLocation();
    };
    var addHandler = function() {
        if (!locationAdded) {
            Ti.Geolocation.addEventListener("location", handleLocation);
            locationAdded = true;
            Ti.API.info("added");
        }
    };
    var removeHandler = function() {
        if (locationAdded) {
            Ti.Geolocation.removeEventListener("location", handleLocation);
            locationAdded = false;
            Ti.API.info("removed");
        }
    };
    addHandler();
    var activity = Ti.Android.currentActivity;
    activity.addEventListener("destroy", removeHandler);
    activity.addEventListener("pause", removeHandler);
    activity.addEventListener("resume", addHandler);
    Ti.Geolocation.locationServicesEnabled || gpsApagado.show();
    $.fullMap.addEventListener("click", function() {
        fullMap();
    });
    $.smallMap.addEventListener("click", function() {
        smallMap();
    });
    $.satellite.addEventListener("click", function() {
        mapview.mapType = mapview.mapType == Map.STANDARD_TYPE ? Map.SATELLITE_TYPE : Map.STANDARD_TYPE;
    });
    var cada_km = 0;
    var cuantos_km = 0;
    var cada_km_dos_decimales = 0;
    $.alarma.addEventListener("click", function() {
        var newWindow = Alloy.createController("alarm");
        newWindow.getView().open({
            modal: true,
            modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE
        });
        sendActividad();
    });
    Ti.App.addEventListener("alarmSet", function(e) {
        $.reloj_boton.backgroundImage = e.background;
        $.alarma_label.text = e.text;
        GLOBAL.actividad = e.actividad;
    });
    $.prepaid.addEventListener("click", function() {
        var newWindow = Alloy.createController("tiempo");
        newWindow.getView().open({
            modal: true,
            modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE
        });
        sendPrepaid();
    });
    Ti.App.addEventListener("timeSet", function(e) {
        if (2 > e.prepago) var hora = " hora";
        if (e.prepago >= 2) var hora = " horas";
        $.prepaid.title = e.prepago + hora;
        GLOBAL.prepago = e.prepago;
    });
    $.smallMap.hide();
    $.stop.hide();
    $.buscar.hide();
    $.reintentar.hide();
    _.extend($, exports);
}

var Alloy = require("alloy"), Backbone = Alloy.Backbone, _ = Alloy._;

module.exports = Controller;