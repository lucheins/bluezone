var URL_dominio = "http://www.domain.com/";
exports.URL = 								function() {var url = URL_dominio; return url;}; // ----> Archivo "HistoriaDetalle.js"
exports.URL_condiciones = 					function() {var url = URL_dominio + "tke_app/condiciones.html"; return url;} ;// ----> Archivo "new_user.js"
exports.URL_crear_cuenta = 					function() {var url = URL_dominio + "tke_app/Crear_Cuenta.php"; return url;} ;// ----> Archivo "new_user.js"
exports.URL_login_cuenta = 					function() {var url = URL_dominio + "tke_app/Login_Cuenta.php"; return url;} ;// ----> Archivo "login_user.js"
exports.URL_sinc_carreras_desde_servidor = 	function() {var url = URL_dominio + "tke_app/Sincronizar_Carreras_Desde_Servidor.php"; return url;} ;// ----> Archivo "login_user.js"
exports.URL_eliminar_carrera = 				function() {var url = URL_dominio + "tke_app/Eliminar_Carrera.php"; return url;} ;// ----> Archivo "HistoriaDetalle.js"
exports.URL_sinc_carrera = 					function() {var url = URL_dominio + "tke_app/Sincronizar_Carrera.php"; return url;} ;// ----> Archivo "HistoriaDetalle.js"

exports.URL_actualizar_datos_usuario = 		function() {var url = URL_dominio + "tke_app/Actualizar_Datos_Usuario.php"; return url;}; // ----> Archivo "Configuracion.js"

exports.VelocidadMaxima = function(GLOBAL) {
	if (parseFloat(GLOBAL.velocidad_max) < parseFloat(GLOBAL.velocidad) ){
		return GLOBAL.velocidad;
	} else {
		return GLOBAL.velocidad_max;
	}
};




exports.CaloriasQuemadas = function(GLOBAL) {
	var calorias_quemadasa_int = Math.floor(GLOBAL.actividad*(GLOBAL.usuario_peso*2.2 )* GLOBAL.total_minutos_y_segundos_int);
	return calorias_quemadasa_int;
};

exports.HoraActual = function() {
	var hora_actual = new Date();
	var hora = hora_actual.getHours();
	var minutos = hora_actual.getMinutes();
	var segundos = hora_actual.getSeconds();
	
	hora<10 ? hora = '0' + hora : hora;
	minutos<10 ? minutos = '0' + minutos : minutos;
	segundos<10 ? segundos = '0' + segundos : segundos;
	
	var hora_inicio_ok = hora + ":" + minutos + ":" + segundos;
	return hora_inicio_ok;
};

exports.HoraMinutos = function() {
	var hora_actual = new Date();
	var hora = hora_actual.getHours();
	var minutos = hora_actual.getMinutes();
	
	hora<10 ? hora = '0' + hora : hora;
	minutos<10 ? minutos = '0' + minutos : minutos;
	
	var hora_inicio_ok = hora + ":" + minutos;
	return hora_inicio_ok;
};

exports.HoraActualString = function() {
	var hora_actual_string = new Date();
	var actual = hora_actual_string.getTime();
	return actual;
};

exports.FechaActual = function() {
	var fecha_actual = new Date();
	var mes = fecha_actual.getMonth()+1;
	if (mes<10){
		mes = "0" + mes;
	}
	var fecha_actual_ok = fecha_actual.getDate() + "/" + mes  + "/" + fecha_actual.getFullYear();
	return fecha_actual_ok;
};


exports.IDunicoCarrera = function() {
	var id_unico_01 = new Date();
	var id_unico_02 = id_unico_01.getTime();
	var id_unico_03 = Math.floor((Math.random()*1000000)+1);
	var id_unico_ok = id_unico_02 + "" + id_unico_03;
	//alert (id_unico_ok);
	return id_unico_ok;
};


exports.Reemplazar_punto_coma = function(texto) {
	var distancia_texto = texto + "";
	var distancia_texto_ok = distancia_texto.replace(".",",");
	return distancia_texto_ok;
};

exports.Precarga = function() {
	var view = Titanium.UI.createView({
		backgroundColor:'#000',
		height: 80,
		width: 80,
		opacity:0.9,
		borderRadius:10
	});
	var actividad = Titanium.UI.createActivityIndicator({
		height:50,
		width:50,
		style:Titanium.UI.iPhone.ActivityIndicatorStyle.BIG
	});
	view.add(actividad);
	actividad.show();
	
	
	
	/*var capa_texto = Ti.UI.createLabel({
		text: texto,
		color: '#fff',
		top: 90,
		font: {fontWeight:'bold'}
	});
	view.add(capa_texto);*/
	
	return view;
};


exports.Calcular_km = function(GLOBAL) {
	var w = GLOBAL.array_posiciones.length;
	//Ti.API.log("++++++++++++++++ GLOBAL.array_posiciones.length ++++++++++++" + w + "********************");
	
	if(w >= 2){
		var lat1 = GLOBAL.array_posiciones[GLOBAL.array_posiciones.length-1][0];
		var lon1 = GLOBAL.array_posiciones[GLOBAL.array_posiciones.length-1][1];
		var lat2 = GLOBAL.array_posiciones[GLOBAL.array_posiciones.length-2][0];
		var lon2 = GLOBAL.array_posiciones[GLOBAL.array_posiciones.length-2][1];
		
		//Ti.API.log("++ lat1 +++" + lat1 + "****++ lon1 +++" + lon1 + "****++ lat2 +++" + lat2 + "****++ lon2 +++" + lon2 + "********************");
		
		rad = function(x) {return x*Math.PI/180;};
		//ALL THESE LINES ARE COMMENTED BECAUSE NO ONE WILL USE MILLES IN QUITO
		//if (GLOBAL.unidades == "Km.") {
			var R     = 6378.5; //Radio de la tierra en km
		//} else {
			//var R     = 3963.42; //Radio de la tierra en millas
		//}
		//added by LUIS CALERO

		var dLat  = rad( lat2 - lat1 );
		var dLong = rad( lon2 - lon1 );
		
		var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = R * c;
		
		GLOBAL.distancia_km_mill_intervalos = parseFloat(d);
		
		GLOBAL.distancia_km_mill_variable += parseFloat(d);
		GLOBAL.distancia_km_mill = Number(GLOBAL.distancia_km_mill_variable).toFixed(2);
		
		var km_texto = GLOBAL.distancia_km_mill;
		//NO NECESITO REEMPLAZAR EL PUNTO POR COMA NI AUMENTAR EL TEXTO KM.. COMENTADAS LAS LINEAS ON ASTERISCO
		var km_texto_ok = km_texto.replace(".",",");
		// $.distancia.text = km_texto_ok;
		
		//Ti.API.log("------------------" + d + "---------------------");
		//Ti.API.log("------------------" + GLOBAL.distancia_km_mill + "---------------------");
		Ti.API.log("------------------" + GLOBAL.unidades + "---------------------");
		Ti.API.log("------------------" + R + "---------------------");
		
		return km_texto_ok + " " + GLOBAL.unidades;
		//* return km_texto;
	} else {
		
		Ti.API.log("------------------------------ SOLO HAY UNA ENTRADA EN LA ARRAY ------------------------");
		var texto = "0,00 " + GLOBAL.unidades;
		return texto;
	}
	
};


exports.Minutos_x_Km = function(GLOBAL) {
	
	var minutos_x_1_kilometro = (GLOBAL.total_minutos_y_segundos_int/GLOBAL.distancia_km_mill).toFixed(2);
	
	if (minutos_x_1_kilometro < 10){
		minutos_x_1_kilometro = "0" + minutos_x_1_kilometro;
	} else {
		minutos_x_1_kilometro =  "" + minutos_x_1_kilometro;
	}
	
	/*Ti.API.log("=========================================================================================");
	Ti.API.log("***** GLOBAL.total_minutos_y_segundos_int *****************************" + GLOBAL.total_minutos_y_segundos_int);
	Ti.API.log("***** GLOBAL.distancia_km_mill *****************************" + GLOBAL.distancia_km_mill);
	Ti.API.log("***** minutos_x_1_kilometro *****************************" + minutos_x_1_kilometro);
	Ti.API.log("=========================================================================================");*/
	
	if (minutos_x_1_kilometro == "Infinity" || minutos_x_1_kilometro == "NaN" ){
		//Ti.API.log("*************************************************** Infinity - NaN **********");
		return "CAL.";
	} else {
		var minutos_extraidos = minutos_x_1_kilometro.substring(0,2);//ETRAER LOS 2 PRIMEROS CARACTERES DE XX:00 (MINUTOS)
		var segundos_extraidos = minutos_x_1_kilometro.substring(3,5);//ETRAER LOS 2 ULTIMOS CARACTERES DE 00:XX (SEGUNDOS)
		
		var segundos_extraidos_int = parseInt(segundos_extraidos);
		var segundos_extraidos_reales = Math.floor((segundos_extraidos_int*60)/100); //Paso la variable de segundos extraidos a INT para hacer el calculo. Regla de 3 para saber los segundos Ej: (77 x 60) / 100 - Si 60 segundos son 100, 77 cuantos segundos?
		
		var segundos_extraidos_text = segundos_extraidos_reales.toString();
		//Ti.API.log("***** segundos_extraidos_text *****************************" + segundos_extraidos_text);
		
		if (segundos_extraidos_text == "Infinity" || segundos_extraidos_text == "NaN" ){
			segundos_extraidos_reales = "0";
			Ti.API.log("***** Infinity & NaN ***************************************************************************" + segundos_extraidos_text);
		}
		
		if (segundos_extraidos_reales < 10){
			segundos_extraidos_reales = "0" + segundos_extraidos_reales;
		} else {
			segundos_extraidos_reales = "" + segundos_extraidos_reales;
		}
		
		GLOBAL.min_x_km = minutos_extraidos + ":" + segundos_extraidos_reales;
		return GLOBAL.min_x_km;
	}
};
