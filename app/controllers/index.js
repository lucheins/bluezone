var HERRAMIENTAS = require('Herramientas');
var height = Titanium.Platform.displayCaps.platformHeight;
var width = Titanium.Platform.displayCaps.platformWidth;
//IMPORTANT NOTES!!
// 1 WINDOW HAS NO ID, FULLSCREEN OR NAVBAR PROPERTIES SET IN ALLOY OR HERE. 
// THIS MAKES SURE WE CAN HANDLE ANDROID ACTIVITY TO SET OR REMOVE LOCATION LITENERS//
// DONT CHANGE IT!!!!!!!!!

$.index.addEventListener('android:back',function(e) {
  // do nothing
});

//SLIDER
var animateRight = Ti.UI.createAnimation({
	left : 250,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 150
});

var animateReset = Ti.UI.createAnimation({
	left : 0,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 150
});

var animateLeft = Ti.UI.createAnimation({
	left : -250,
	curve : Ti.UI.ANIMATION_CURVE_EASE_OUT,
	duration : 150
});

var touchStartX = 0;
var touchRightStarted = false;
var touchLeftStarted = false;
var buttonPressed = false;
var hasSlided = false;
var direction = "reset";

$.movableView.addEventListener('touchstart', function(e) {
	touchStartX = e.x;
});
$.leftMenu.addEventListener('touchstart', function(e) {
	touchStartX = e.x;
});

function endTouch(e){
	if (buttonPressed) {
		buttonPressed = false;
		//REMOVED THIS STUPID THING FROM ORIGINA.. IT BREAKS EVRYTHING FOR SOME REASON! --> return;
	}
	if ($.movableView.left >= 150 && touchRightStarted) {
		direction = "right";
		$.leftButton.touchEnabled = true;
		$.movableView.animate(animateRight);
		hasSlided = true;
	}
	else if ($.movableView.left <= -150 && touchLeftStarted) {
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
		hasSlided : hasSlided,
		direction : direction
	});
	touchRightStarted = false;
	touchLeftStarted = false;
}

$.movableView.addEventListener('touchend', endTouch);
$.leftMenu.addEventListener('touchend', endTouch);

function moveTouch(e){
	var coords = $.movableView.convertPointToView({
		x : e.x,
		y : e.y
	}, $.containerview);
	var newLeft = coords.x - touchStartX;
	if ((touchRightStarted && newLeft <= 250 && newLeft >= 0) || 
		(touchLeftStarted && newLeft <= 0 && newLeft >= -250)) {
		$.movableView.left = newLeft;
	}
	else {
		// Sometimes newLeft goes beyond its bounds so the view gets stuck.
		// This is a hack to fix that.
		if ((touchRightStarted && newLeft < 0) || (touchLeftStarted && newLeft > 0)) {
			$.movableView.left = 0;
		}
		else if (touchRightStarted && newLeft > 250) {
			$.movableView.left = 250;
		}
		else if (touchLeftStarted && newLeft < -250) {
			$.movableView.left = -250;
		}
	}
	if (newLeft > 5 && !touchLeftStarted && !touchRightStarted) {
		touchRightStarted = true;
		Ti.App.fireEvent("sliderToggled", {
			hasSlided : false,
			direction : "right"
		});
	}
	else if (newLeft < -5 && !touchRightStarted && !touchLeftStarted) {
		touchLeftStarted = true;
		Ti.App.fireEvent("sliderToggled", {
			hasSlided : false,
			direction : "left"
		});
	}
}
$.movableView.addEventListener('touchmove', moveTouch);
$.leftMenu.addEventListener('touchmove', moveTouch);

$.leftButton.addEventListener('touchend', function(e) {
	if (!touchRightStarted && !touchLeftStarted) {
		buttonPressed = true;
		$.toggleLeftSlider();
	}
});

$.rightButton.addEventListener('touchend', function(e) {
	if (!touchRightStarted && !touchLeftStarted) {
		buttonPressed = true;
		$.toggleRightSlider();
	}
});

exports.toggleLeftSlider = function() {
	if (!hasSlided) {
		direction = "right";
		$.leftButton.touchEnabled = true;
		$.movableView.animate(animateRight);
		hasSlided = true;
	} else {
		direction = "reset";
		$.leftButton.touchEnabled = true;
		$.movableView.animate(animateReset);
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
	});
};

exports.toggleRightSlider = function() {
	if (!hasSlided) {
		direction = "left";
		$.rightButton.touchEnabled = true;
		$.movableView.animate(animateLeft);
		hasSlided = true;
	} else {
		direction = "reset";
		$.rightButton.touchEnabled = true;
		$.movableView.animate(animateReset);
		hasSlided = false;
	}
	Ti.App.fireEvent("sliderToggled", {
		hasSlided : hasSlided,
		direction : direction
    });
};

////
// END SLIDER!!!!


if (Ti.Platform.osname === 'iphone' || Ti.Platform.osname === 'ipad'){
	$.index.open({
		transition : Titanium.UI.iPhone.AnimationStyle.FLIP_FROM_LEFT
	});
}
if (Ti.Platform.osname === 'android'){
	$.index.open();
}


var hora_inicio = HERRAMIENTAS.HoraActual();
$.hora_label.text = HERRAMIENTAS.HoraMinutos();

$.chrono.text = '00:00:00';
$.distancia.text = '0,00 Km.';
$.velocidad_label.text = '0';


//UN MONTON DE VARIABLES DECLARADAS PORSIA

var horas = 0, minutos = 0, segundos = 0, total_minutos = 0, tiempo = "";

var intervalo_cronometro, intervalo_actualizar, intervalo_countdown;
var altitud_label, velocidad_label;
var actividad_label;
var mapview;
var lat, lng, altitud;
var testigo_hora_comienzo_carrera = true;
var testigo_pines_inicio_mapa = false;
var velocidad;
var pin_inicio, pin_final, pin_km;

var posiciones_KM;

// FIN VARIABLES

//GLOBALES
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
		accuracy: parseFloat(0),	
	};
var Map = require('ti.map');
var mapview = Map.createView({
	width:'100%',
	top:0,
	height: height-230,
	mapType: Map.STANDARD_TYPE,
	animate:true,
	regionFit:true,
	userLocation:true,
	visible: true,
	name: 'mapview',
	keepScreenOn: true,
	
});
$.mapa.add(mapview);

$.start.addEventListener('click', function(e) { 	
    	$.start.hide();
		$.buscar.show();	
		$.prepaid.hide();
		$.stop.show();
    	if (testigo_pines_inicio_mapa){
			//Elimino los pins del mapa si la variable es true
			mapview.removeAnnotation(pin_inicio);
			mapview.removeAnnotation(pin_final);
			mapview.removeAnnotation(pin_km);
		}
		
    	if (testigo_hora_comienzo_carrera){
    		GLOBAL.hora_inicio = HERRAMIENTAS.HoraActual();
    		
    		//Creo el pin de inicio de carrera
			var pin_inicio = Map.createAnnotation({
				latitude:lat,
				longitude:lng,
				title: "Auto",
				pincolor:Map.ANNOTATION_GREEN,
				animate:true
			});
			// GET LAT - LONG FROM pin_inicio
			function getPinInicio(){
				var latValue = pin_inicio.getLatitude();
				var longValue = pin_inicio.getLongitude();
				return latValue + "," + longValue;
			};
			//PUSH POSITION (LAT-LONG) ONTO GLOBAL VARIABLE
       		var PinInicio = getPinInicio();
       		GLOBAL.posicion_inicio.push(PinInicio);
       		
       		
			mapview.addAnnotation(pin_inicio);
			testigo_hora_comienzo_carrera = false;
    	}
    	actualizar(GLOBAL);
    	
    	function HoraLocal() {
			var hora_actual_raw = new Date();
			hora_actual_raw.getTime();
			hora_actual_raw.toString();
			return hora_actual_raw;
		};
		
		var print_inicio = HoraLocal();
    	
    	intervalo_cronometro = setInterval(function(){
    		var cronometro_actualizado = HoraLocal();
    		var hora_local = (cronometro_actualizado-print_inicio) / 1000;
    		
    		days = parseInt(hora_local / 86400);
			hora_local = hora_local % 86400;
			 
			hours = parseInt(hora_local / 3600);
			hora_local = hora_local % 3600;
			  
			minutes = parseInt(hora_local / 60);
			seconds = parseInt(hora_local % 60);
			
			if (hours<10){hours = "0" + hours;}
    		if (minutes<10){minutes = "0" + minutes;}
    		if (seconds<10){seconds = "0" + seconds;}
    		
    		GLOBAL.cronometro = hours + ":" + minutes + ":" + seconds;
    		
    		$.chrono.text = GLOBAL.cronometro;
    		/////
    		
    	}, 1000);
    	
    	/// Mi Propio Countdown LUIS CALERO
    	var datestampTarjetas = GLOBAL.prepago;
    	var datestampTexto = GLOBAL.prepago;
    	
    	function HoraExpiracion() {
			var hora_actual_string = new Date();
			hora_actual_string.getTime();
			hora_actual_string.toString();
			hora_actual_string.setHours(hora_actual_string.getHours() + parseInt(datestampTarjetas)); 
			hora_actual_string.toString();
			
			return hora_actual_string;
		};
		
		if (datestampTarjetas<10){datestampTarjetas = "0"+datestampTarjetas;}
		var tiempoTarjetas = datestampTarjetas + ":00:00";
		$.countdown_label.text = tiempoTarjetas;
		
		expiracionTarjeta = HoraExpiracion();
    	inicioTarjeta = HERRAMIENTAS.HoraActualString();
    	
    	intervalo_countdown = setInterval(function(){	
    		var seconds_left_raw = (expiracionTarjeta-HERRAMIENTAS.HoraActualString()) / 1000;
    		var seconds_left = seconds_left_raw.toFixed(0);
    		
    		/// PONER COLOR DE ALERTA EN EL COUNTDOWN - SOLO SI SE PUSO TARJETA!!
    		
    		if (GLOBAL.prepago != 0){
    		if (seconds_left <= 901) {$.countdown_label.color = '#FFD700';}
			if (seconds_left <= 661) {$.countdown_label.color = '#FFA500';}
			if (seconds_left <= 301) {$.countdown_label.color = '#FF4500';}
    		}
    		if (seconds_left <= 0) {hours="00", minutes="00", seconds="00";}
    		
    		else {
    		days = parseInt(seconds_left / 86400);
			seconds_left = seconds_left % 86400;
			 
			hours = parseInt(seconds_left / 3600);
			seconds_left = seconds_left % 3600;
			  
			minutes = parseInt(seconds_left / 60);
			seconds = parseInt(seconds_left % 60);
			
			if (hours<10){hours = "0" + hours;}
    		if (minutes<10){minutes = "0" + minutes;}
    		if (seconds<10){seconds = "0" + seconds;}
    		}
    		
    		$.countdown_label.text = hours + ":" + minutes + ":" + seconds;
    		//Ti.API.log("*********GLOBAL.total_minutos_y_segundos_int***********" + GLOBAL.total_minutos_y_segundos_int + "**************");
    		
    		//LIMPIAR INTERVALO PARA EVITAR CONSUMO DE BATERIA AL LLEGAR A 0
    		if (seconds_left <= 0)   {clearInterval(intervalo_countdown);}
    		// DEJAR DE COLOR ROJO SI ESTABA EN MODO PREPAGO
    		
    		
    	}, 10000);	
    	
    	
    	var timeout = (expiracionTarjeta-inicioTarjeta);
    	
    	//MENSAJE DE MARCACION Y TARJETAS
    	if (datestampTarjetas == 1) {horaPlural=" hora";} if (datestampTarjetas > 1) {horaPlural=" horas";}
    	if(datestampTarjetas > 0){timeoutMsg = "con un tiempo prepagado de " + datestampTexto/*tiempoTarjetas*/ + horaPlural;}
    	if(datestampTarjetas == 0){timeoutMsg = "";}
    	
    	var alertInicio = Ti.UI.createAlertDialog({
    		title: 'Lugar de Parqueo Marcado',
    		message: 'La ubicacion de tu auto ha sido marcada con exito ' + timeoutMsg,	
    		ok: 'OK'
    	});
    	alertInicio.show();
    	
    	if (timeout >= 0 && GLOBAL.prepago != 0){
    	done = setInterval(function(){
	   		clearInterval(intervalo_countdown);
	   		var alertPrepago = Ti.UI.createAlertDialog({
	    		title: 'Tiempo Expirado',
	    		message: 'El tiempo de parqueo prepagado ha expirado',	
	    		ok: 'OK'
    		});
    		alertPrepago.show();
	   		clearInterval(done);
		}, timeout ); 
		}  
});

var aceptado = 0;	
var inicioPin = GLOBAL.posicion_inicio;

var gd = require('de.codewire.google.directions');
var activeRoutes = [];	
			// retrieve location
var removeAllRoutes = function() {
	for(var idx in activeRoutes) {
		var route = activeRoutes[idx];
		mapview.removeRoute(route);
	}
	activeRoutes = [];
	GLOBAL.posicion_final = [];//EMPTY LAT-LONG OF FINAL MARKER TO AVOID DUPLICATE ON EVERY CLICK 
	//REMOVE FINAL PIN IF EXISTS
};

var anchoLinea;
if(Ti.Platform.osname  ==  'android') {
   	anchoLinea = 5;
   }
else {
	anchoLinea = 15;
} 

$.buscar.addEventListener('click', function(e) { 
		var url = "http://google.com/maps";
		
		$.activityView.show();
		$.ActivityIndicator.show();
		var client = Ti.Network.createHTTPClient({
		    //ON LOAD STARTS HERE
		    onload : function(e) {
		    $.activityView.hide();
		    $.ActivityIndicator.hide();
		   
		        
		testigo_pines_inicio_mapa = true;
		var pin_final = Map.createAnnotation({
			latitude:lat,
			longitude:lng,
			title: "Inicio",
			pincolor:Map.ANNOTATION_RED,
			animate:true
		});
		mapview.addAnnotation(pin_final);
		//GET LAT- LONG FROM pin_final
		function getPinFinal(){
				var latValue = pin_final.getLatitude();
				var longValue = pin_final.getLongitude();
				return latValue + "," + longValue;
			};
			//PUSH POSITION (LAT-LONG) ONTO GLOBAL VARIABLE
       		var PinFinal = getPinFinal();
       		GLOBAL.posicion_final.push(PinFinal);
       		var finalPin = GLOBAL.posicion_final;
		
		gd.getRoute({
			origin : finalPin, // required
			destination : inicioPin, // required
			color : '#ff5e4d', // defaults to '#FF0000'
			mode : gd.travelModes.walking, // defaults to driving
			name : 'single',
			width: anchoLinea,
			callback : function(response) {
				
				if(response.status == 'OK') {
					mapview.setRegion({
						latitude : response.route.points[0].latitude,
						longitude : response.route.points[0].longitude,
						longitudeDelta : 0.002,
						latitudeDelta : 0.002
					});
					
					mapview.addRoute(response.route);
					activeRoutes.push(response.route);
	
					// loop each point to get distance, duration & instruction
					for(var idx in response.route.points) {
						var point = response.route.points[idx]; 
						if(point.isMaster) {
							var distance = point.distance;
							var duration = point.duration;
							var instruction = point.instruction;
						}
					}
				} else {
					/**
					 * Error handling.
					 * The Error object contains "status" & msg properties.
					 */
					alert(response.msg);
				}//END ELSE RESPONSE STATUS
				
			}//END CALLBACK FUNCTION
		});
		
		// SI YA SE HA LEIDO EL MENSAJE DE 50 METROS NO PREGUNTAR OTRA VEZ		
		$.buscar.hide();
		$.reintentar.show();
		
		    },//ON LOAD ENDS HERE
		    
		    onerror: function(e) {
		    	$.activityView.hide();
		    	$.ActivityIndicator.hide();
		    	var directionsError = Ti.UI.createAlertDialog({
			    	title: 'Conectividad Limitada',
			    	message: 'Al momento tu dispositivo no tiene coneccion al internet. Conectate a la red de datos o wifi para buscar tu auto',	
	    			ok: 'OK'
	    		});
    			directionsError.show();
		        Ti.API.info('error');
		    },
		    timeout: 8000
		});
		client.open("GET", url);
		client.send();		
});	

$.reintentar.addEventListener('click', function(e) {
			$.reintentar.hide();
			mapview.removeAnnotation('Inicio');//IMPORTANT! Needs to be removed before I empty the GLOBAL.ultimopin array below
			removeAllRoutes();
			$.buscar.show();
});

function stopRelojes(){
			clearInterval(intervalo_countdown);
			clearInterval(intervalo_cronometro);
			clearInterval(intervalo_actualizar);
			$.chrono.text = "00:00:00";
			$.countdown_label.text = "00:00:00";
			$.distancia.text = '0,00 Km.';
			testigo_pines_inicio_mapa = true;
			testigo_hora_comienzo_carrera = true;
			$.reloj_boton.backgroundImage = "/img/img_run/alarma-off.png";
			$.alarma_label.text = 'Off';
			GLOBAL.actividad = 0.000;
			// Vaciamos las arrays *************************************************
			var AA01 = GLOBAL.array_posiciones.length;
			var AA04 = GLOBAL.array_km.length;
			
			GLOBAL.array_posiciones.splice(0,AA01);
			GLOBAL.array_km.splice(0,AA04);		
}

$.stop.addEventListener('click', function(e) {
			$.reintentar.hide();
			mapview.removeAnnotation('Inicio');//IMPORTANT! Needs to be removed before I empty the GLOBAL.ultimopin array below
			
			removeAllRoutes();
			mapview.removeAnnotation('Auto');
			
			GLOBAL.posicion_inicio = [];//IMPORTANTE LIMPIAR POSICION INICIO PARA QUE NO QUEDE SETEADA COMO origin EN gd.getRoute
			GLOBAL.posicion_final = [];//IMPORTANTE LIMPIAR POSICION FINAL PARA QUE NO QUEDE SETEADA COMO destination EN gd.getRoute
			$.buscar.hide();
			$.start.show();
			$.prepaid.show();
			$.stop.hide();
			stopRelojes();
			$.prepaid.title = "+ Tiempo";
			GLOBAL.prepago = parseFloat(0);
			GLOBAL.actividad = parseFloat(5);	
			$.countdown_label.color = '#000';		
});
	

function NavRules(){
Ti.Geolocation.headingFilter = 10;

//ANDROID NAV
if(Ti.Platform.osname  ==  'android') {

   	Ti.Geolocation.Android.manualMode = true;
   	// modify only the gps
    var gpsProvider = Ti.Geolocation.Android.createLocationProvider({
        name: Ti.Geolocation.PROVIDER_GPS,
        minUpdateDistance: 0.0,
    	minUpdateTime: 0
    });
    Ti.Geolocation.Android.addLocationProvider(gpsProvider);
 
    //modify network
   	var networkProvider = Ti.Geolocation.Android.createLocationProvider({
	    name: Ti.Geolocation.PROVIDER_NETWORK,
	    minUpdateTime: 3, 
	    minUpdateDistance: 30
	});
	
	Ti.Geolocation.Android.addLocationProvider(networkProvider);
	
	//Declare location rules
	var gpsRule = Ti.Geolocation.Android.createLocationRule({
	    // NO PROVIDER SPECIFIED IN ORDER TO MAKE IT A GENERAL RULE FOR ALL PROVIDERS
	    provider: Ti.Geolocation.PROVIDER_GPS,
	    // Updates should be accurate to 100m
	    accuracy: 100,
	    // Updates should be no older than 30 seconds
	    maxAge: 5000,
	    // But  no more frequent than once per 10 seconds
	    minAge: 3000,
	});
	Ti.Geolocation.Android.addLocationRule(gpsRule);
	
	
	}
	
//IOS NAV
else {
    Ti.Geolocation.distanceFilter    =    10;
    Ti.Geolocation.preferredProvider = Ti.Geolocation.PROVIDER_GPS;
    Ti.Geolocation.accuracy    =    Ti.Geolocation.ACCURACY_BEST;
    Ti.Geolocation.purpose    =    Ti.Locale.getString('gps_purpose');
	}
}//END NavRules

var gpsApagado = Ti.UI.createAlertDialog({
						title: 'GPS Limitada',
						message: 'Activa el GPS para poder utilizar el servicio de mapas',	
					    ok: 'OK'
				});
var gpsLow = Ti.UI.createAlertDialog({
						title: 'Buscando GPS',
						message: 'Utiliza la app en tu auto o sal a un espacio abierto',	
					    ok: 'OK'
				});
var location_coords;

NavRules();

function getLocation(){	   
		Titanium.Geolocation.getCurrentPosition(function(e){
			if (e.error || !e.success) {
        		$.gpsOff.show();
        		gpsLow.show();
        		return; 
    		}
    		if (e.success){
    		location_coords = e.coords;
    		gpsLow.hide();
    		$.gpsOff.hide();
    		}
			var region={
				latitude: e.coords.latitude,
				longitude: e.coords.longitude,
				animate:true,
				latitudeDelta:0.002,
				longitudeDelta:0.002
			};
			mapview.setLocation(region);
			
			lat = e.coords.latitude;
			lng = e.coords.longitude;
			velocidad = e.coords.speed;
			accuracy = e.coords.accuracy;
			
			GLOBAL.accuracy = accuracy.toFixed(0);
			
			if (velocidad < 0) {
				velocidadResult = 0;
			}
			else {
				velocidadResult = (velocidad * 60);
			}
			var velocidadFixed  = velocidadResult.toFixed(0);
			GLOBAL.velocidad = velocidadFixed;
			
			
			$.accuracy_label.text = GLOBAL.accuracy + ' m';
			$.velocidad_label.text = GLOBAL.velocidad;
			altitud = e.coords.altitude;
			$.altitud_label.text = altitud.toFixed(0) + " m";
			GLOBAL.altitud = altitud.toFixed(0);	
			
		});	
}//END FUNCTION GEOLOCATION

//IF ANDROID
if (Ti.Platform.osname === 'android'){

var locationAdded = false;
var handleLocation = function(e) {
    if (!e.error) {
        Ti.API.info(e.coords);
    }
    getLocation();
};
var addHandler = function() {
    if (!locationAdded) {
        Ti.Geolocation.addEventListener('location', handleLocation);
        locationAdded = true;
        Ti.API.info('added');
    }
};
var removeHandler = function() {
    if (locationAdded) {
        Ti.Geolocation.removeEventListener('location', handleLocation);
        locationAdded = false;
        Ti.API.info('removed');
    }
};
    addHandler();

    var activity = Ti.Android.currentActivity;
    activity.addEventListener('destroy', removeHandler);
    activity.addEventListener('pause', removeHandler);
    activity.addEventListener('resume', addHandler);	
}

//IF IOS
else{
	Ti.Geolocation.addEventListener('location', function(e){
		getLocation();   							
	});
}

if (!Ti.Geolocation.locationServicesEnabled) {
	gpsApagado.show();
	}

	
function fullMap (){
		var height = Titanium.Platform.displayCaps.platformHeight;
		//var altura_dispositivo = height;
		//if (altura_dispositivo === 568){var IMG_fondo = '/img/bg-basico-TrackEsports@568.png';} else {var IMG_fondo = '/img/bg-basico-TrackEsports.png';}
		var heightExpanded = height-105;
		$.mapa.animate({top: 5, height: heightExpanded, duration: 500});
		mapview.height = heightExpanded;
		mapview.regionFit = true,			
		$.fullMap.hide();
		$.smallMap.show();	
};
function smallMap (){	
		var height = Titanium.Platform.displayCaps.platformHeight;
		//var altura_dispositivo = height;
		//if (altura_dispositivo === 568){var IMG_fondo = '/img/bg-basico-TrackEsports@568.png';} else {var IMG_fondo = '/img/bg-basico-TrackEsports.png';}
		var heightExpanded = height-230;

		$.mapa.animate({top: 140, height: heightExpanded, duration: 500});
		//STUPID TIMEOUT -- BEACAUSE ANDROID WOULDNT ANIMATE mapview. This is needed to make sure the maps height changes 
		//only after the parent view finishes its animation
		setTimeout(function(){mapview.height = heightExpanded; mapview.regionFit = true;}, 400 );			
		$.fullMap.show();
		$.smallMap.hide();	
};
		
	$.fullMap.addEventListener('click', function(){
		fullMap();
	});

	$.smallMap.addEventListener('click', function(){
		smallMap();
	});
	
	
	$.satellite.addEventListener('click', function(e){
		if (mapview.mapType == Map.STANDARD_TYPE){
			mapview.mapType = Map.SATELLITE_TYPE;
		} else {
			mapview.mapType = Map.STANDARD_TYPE;
		}
    });

var cada_km = 0;
var cuantos_km = 0;
var cada_km_dos_decimales = 0;
var cada_100m = 0;
var cuantos_100m = 0;
var cada_100m_dos_decimales = 0;

function actualizar (GLOBAL){
	intervalo_actualizar = setInterval(function(){
		
		$.accuracy_label.text = GLOBAL.accuracy+ ' m';;
		$.hora_label.text = HERRAMIENTAS.HoraMinutos();
		
		var posiciones = [lat, lng, GLOBAL.altitud, GLOBAL.distancia_km_mill];
		GLOBAL.array_posiciones.push(posiciones);
		
		var kilometros = HERRAMIENTAS.Calcular_km(GLOBAL);
		$.distancia.text = kilometros;
		
		// 2 lines commented by LUIS CALERO
		var Min_X_km = HERRAMIENTAS.Minutos_x_Km(GLOBAL);
		//min_x_km_label.text = Min_X_km;
		
		cada_km += GLOBAL.distancia_km_mill_intervalos;
		cada_km_dos_decimales = cada_km.toFixed(2);
		
		
		//Ti.API.log("++++++++++++++++ GLOBAL.distancia_km_mill  ++++++++++++" + GLOBAL.distancia_km_mill + "********************");
		
		if (cada_km_dos_decimales > 1.0){
			
			var num_texto = GLOBAL.distancia_km_mill + "";
			var cad = '.';
			var pos = num_texto.indexOf(cad);
			var dos = '0.' + num_texto.substr(pos+cad.length);
			//Ti.API.log("&&&&&&&&&&&&&&&& " + dos + " ----------------");
			
			var sumar_resto_decimales = parseFloat(dos);
			
			cada_km = sumar_resto_decimales;
			cuantos_km += 1;
			Ti.API.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
			Ti.API.log("----------------- SE HA HECHO 1 QUILOMETRO!!!!!!!!!!!!! -----------------");
			Ti.API.log("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX");
			
			//GLOBAL.array_km.push({latitude:lat,longitude:lng,km:cuantos_km});
			
			posiciones_KM = [lat,lng,cuantos_km];
			GLOBAL.array_km.push(posiciones_KM);
			
			//Ti.API.log("<<<<<<<<<<<<<<<<<<<<<<<" + GLOBAL.array_km[cuantos_km-1].latitude + " ----------------");
			//Ti.API.log("<<<<<<<<<<<<<<<<<<<<<<<" + posiciones_KM + " ----------------");
			
			//pin_km = Map.createAnnotation({
				//latitude:lat,
				//longitude:lng,
				//image: '/img/img_mapa/icon-' + cuantos_km + '.png',
				//animate:true
			//});
			//mapview.addAnnotation(pin_km);
		}
		/*Ti.API.log("************************************************************************************************************************");
		Ti.API.log("----------------- distancia_km_mill_intervalos ---------------- " + GLOBAL.distancia_km_mill_intervalos + " ----------------");
		Ti.API.log("----------------- distancia_km_mill --------------------------- " + GLOBAL.distancia_km_mill + " ----------------");
		Ti.API.log("----------------- cuantos_km ----------------------------- " + cuantos_km + " ----------------");
		Ti.API.log("----------------- cada_km ----------------- " + cada_km + " ----------------");
		Ti.API.log("----------------- cada_km_dos_decimales ----------------- " + cada_km_dos_decimales + " ----------------");
		Ti.API.log("************************************************************************************************************************");*/

	}, 3000);
	
};

// POPUP CON OPCIONES DE ALARMAS
//Funcion para enviar la variable GLOBAL.activity -- puede ser leida en cualquier lugar de la app
	function sendActividad (){
	Ti.App.fireEvent("actividadSet", {
			actividad: GLOBAL.actividad
	    });
	};
	
	$.alarma.addEventListener('click', function(){
		var newWindow = Alloy.createController('alarm');
		newWindow.getView().open({modal:true,modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE});
		sendActividad();
	});
// Funcion para escuchar al evento click de la ventana que se abre con alarmas	
	Ti.App.addEventListener("alarmSet", function(e) {
		$.reloj_boton.backgroundImage = e.background;
		$.alarma_label.text = e.text;
		GLOBAL.actividad = e.actividad;  	
	});

//POPUP TARJETAS
	function sendPrepaid (){
	Ti.App.fireEvent("prepaidSet", {
			prepago: GLOBAL.prepago
	    });
	};
	$.prepaid.addEventListener('click', function(){
		var newWindow = Alloy.createController('tiempo');
		newWindow.getView().open({modal:true,modalTransitionStyle:Ti.UI.iPhone.MODAL_TRANSITION_STYLE_CROSS_DISSOLVE});
		sendPrepaid();
	});	
	Ti.App.addEventListener("timeSet", function(e) {
		if (e.prepago < 2){var hora = ' hora';}
		if (e.prepago >= 2){var hora = ' horas';}
		$.prepaid.title = e.prepago+hora;
		GLOBAL.prepago = e.prepago;  	
	});

$.smallMap.hide();
$.stop.hide();
$.buscar.hide();
$.reintentar.hide();



