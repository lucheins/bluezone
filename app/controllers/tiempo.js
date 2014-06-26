$.closeTime.addEventListener('click', function(){
// close window
$.tiempo.close();
// clear reference to allow garbage collection to clean up
$.tiempo = null;
});

var prepaid;

// Funcion para escuchar al evento click de la ventana principal
Ti.App.addEventListener("prepaidSet", function(e) {
	  prepaid = e.prepago; 
});

$.tiempo.addEventListener('open', function(e){
	var rows = $.timeTable.data[0].rows;
    for (var i = 0; i < rows.length; ++i) {
        if(rows[i].val == prepaid){
        	rows[i].hasCheck = true;
        };
    }	
});


$.timeTable.addEventListener('click', selectRow);

function selectRow(e) {
 	prepaid = e.rowData.val;
 	Ti.App.fireEvent("timeSet", {
   		prepago: prepaid
	});
	e.rowData.hasCheck = true;
	lastRowClicked = e.rowData;
 	$.tiempo.close();
}
