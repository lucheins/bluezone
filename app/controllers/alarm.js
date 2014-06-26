

$.closeAlarm.addEventListener('click', function(){
// close window
$.alarm.close();
// clear reference to allow garbage collection to clean up
$.alarm = null;
});

var activity;
// Funcion para escuchar al evento click de la ventana principal
Ti.App.addEventListener("actividadSet", function(e) {
	  activity = e.actividad; 
	  	if (activity == 1){$.five.hasCheck = true;}
		if (activity == 2){$.ten.hasCheck = true;}
		if (activity == 3){$.fifteen.hasCheck = true;}
		if (activity == 4){$.twenty.hasCheck = true;}
		if (activity == 5){$.off.hasCheck = true;}	 	
});

var alert = Ti.UI.createAlertDialog({
			    	title: 'Alarma Ok',
			    	message: 'La alarma del recordatorio ha sido actualizada',
			    	ok: 'Ok'	
	    		});
	    		
$.table.addEventListener('click', selectRow);

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