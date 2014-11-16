var db;
var dataset;

function initDatabase() {
    console.debug('called initDatabase()');

    try {
        if (!window.openDatabase) {
            alert('not supported');
        } else {
            var shortName = 'Motorshow2014';
            var version = '1.0';
            var displayName = 'Motorshow 2014';
            var maxSizeInBytes = 65536;
            db = openDatabase(shortName, version, displayName, maxSizeInBytes);
			
            createTableIfNotExists();
        }
    } catch(e) {
        if (e == 2) {
            alert('Invalid database version');
        } else {
            alert('Unknown error ' + e);
        }
        return;
    }
}

function createTableIfNotExists() {
    console.debug('called createTableIfNotExists()');
	
	_tb_registrados();
}

function _tb_registrados(){
	console.debug('called _tb_registrados()');

    var sql = "CREATE TABLE IF NOT EXISTS crea_registrados (id INTEGER PRIMARY KEY AUTOINCREMENT,fecha TEXT, nombre TEXT, apellido TEXT, celular TEXT, email TEXT, modelo TEXT);";

    db.transaction(
        function (transaction) {
            transaction.executeSql(sql, [], _emptyFunction, handleErrors);
            console.debug('executeSql: ' + sql);
        }
    );
}

function _emptyFunction(){
	//Empty
}

function _strFecha(){

	now = new Date();
	year = "" + now.getFullYear();
	month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
	day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
	hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
	minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
	second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }

	return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
}

function _getUrlVars() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
        vars[key] = value;
    });
    return vars;
}

function insertRecord() {
    console.debug('called insertRecord()');

    var nombre = $('#txt_nombre').val();
    var apellido = $('#txt_apellido').val();
	var email = $('#txt_email').val();
	var celular = $('#txt_celular').val();
	var modelo = $('#cbo_modelo').val();
	var fecha = _strFecha();
	
    var sql = 'INSERT INTO crea_registrados (fecha, nombre, apellido, celular, email,modelo) VALUES (?, ?, ?, ?, ?, ?)';
	
    db.transaction(
        function (transaction) {
            transaction.executeSql(sql, [fecha, nombre, apellido, celular, email, modelo], showRecordsAndResetForm, handleErrors);
            console.debug('executeSql: ' + sql);
			
			$.ajax({
				type: "POST",
				url: "http://motorshow.creacore.pe/index.php/motorshow/enviar_correo",
				data: {"alias":"app_phonegap_correo","nombre":nombre, "apellido":apellido,"modelo":modelo,"email":email},
				crossDomain : true,
				success: function(data){
					alert("Correo enviado.");
					
				}, error: function(data) { // 500 Status Header
				
					alert("Error al enviar correo.");
				}
			
			});
			
        }
    );
}


function dropTable() {
    console.debug('called dropTable()');

	if(confirm("\xBFEsta seguro que desea borrar la informaci\xF3n?")) { 
	
		_drop_tb_registrados();
		
		resetForm();

		initDatabase();
	}
}

function _drop_tb_registrados(){
	var sql = 'DROP TABLE crea_registrados';

    db.transaction(
        function (transaction) {
            transaction.executeSql(sql, [], emptyFunction, handleErrors);
        }
    );
}


function resetForm() {
    console.debug('called resetForm()');

    $('#txt_nombre').val('');
    $('#txt_apellido').val('');
	$('#txt_celular').val('');
	$('#txt_email').val('');
	$('#cbo_modelo').val('')
    $('#id').val('');
}

function showRecordsAndResetForm(transaction, results) {
    console.debug('called showRecordsAndResetForm()');

    resetForm();
	
	//alert("Usuario registrado.");

}

function handleErrors(transaction, error) {
    console.debug('called handleErrors()');
    console.error('error ' + error.message);

    alert(error.message);
    return true;
}

function showRecords() {
    console.debug('called showRecords()');

    var sql = "SELECT * FROM crea_registrados order by id desc";

    db.transaction(
        function (transaction) {
            transaction.executeSql(sql, [], renderRecords, handleErrors);
        }
    );
}

function renderRecords(transaction, results) {
    console.debug('called renderRecords()');

    html = '';
    $('#results').html('');

    dataset = results.rows;

	
    if (dataset.length > 0) {
        html = html + '<br/><br/>';
		html = html + '<caption>Usuarios registrados: ' + dataset.length + '</caption>';
		
        html = html + '<table class="table table-bordered">';
        html = html + '  ';
        html = html + '  <thead>';
        html = html + '    <tr style="background-color:#F1F1F1">';
        html = html + '      <th class="span1">Nro.</td>';
		 html = html + '      <th>Fecha</td>';
        html = html + '      <th>Nombre</td>';
        html = html + '      <th>Apellido</td>';
		html = html + '      <th>Celular</td>';
		html = html + '      <th>Email</td>';
		html = html + '      <th>Modelo de inter&eacute;s</td>';
        html = html + '    </tr>';
        html = html + '  </thead>';

        html = html + '  <tbody>';

		
        for (var i = 0, item = null; i < dataset.length; i++) {
            item = dataset.item(i);

            html = html + '    <tr>';
            html = html + '      <td>' + (i + 1) + '</td>';
			html = html + '      <td>' + item['fecha'] + '</td>';
            html = html + '      <td>' + item['nombre'] + '</td>';
            html = html + '      <td>' + item['apellido'] + '</td>';
			html = html + '      <td>' + item['celular'] + '</td>';
			html = html + '      <td>' + item['email'] + '</td>';
			html = html + '      <td>' + item['modelo'] + '</td>';
            html = html + '    </tr>';
        }
	
        html = html + '  </tbody>';
        html = html + '</table>';

        $('#results').append(html);
		
    }
}


function ajaxRecords(transaction, results) {
    console.debug('called ajaxRecords()');

    dataset = results.rows;
	
    if (dataset.length > 0) {

		var arr_data = [];
		
        for (var i = 0, item = null; i < dataset.length; i++) {
            item = dataset.item(i);
			arr_data.push(item);
        }
			
		$.ajax({
			type: "POST",
			url: "http://motorshow.creacore.pe/index.php/motorshow/phonegap_registrados",
			data: {"alias":"app_phonegap",uuid:uuid_device,data: arr_data},
			crossDomain : true,
			success: function(data){
				alert("Data de formulario enviada. " + data);
				
			}, error: function(data) { // 500 Status Header
			
				alert("Error al enviar formulario de usuarios.");
	        }
		
		});
		
    }
}

function updateCacheContent(event) {
    console.debug('called updateCacheContent()');
    window.applicationCache.swapCache();
}

function iniciar_bd(){
    window.applicationCache.addEventListener('updateready', updateCacheContent, false);

    initDatabase();
};

function ctrlLogin(){
	var usuario = $("#tbUsuario").val();
	var password = $("#tbContrasena").val();
	
	if (usuario =="motorshow" && password=="motorshow987"){
		location.href = "listado.html";
	}else{
		alert("Acceso incorrecto.");
	}
	
	return false;
}

function ctrlSincronizar(){

	console.debug('called showRecords()');

	_ajax_tb_registrados();
	
}

function _ajax_tb_registrados(){
    var sql = "SELECT * FROM crea_registrados";

    db.transaction(
        function (transaction) {
            transaction.executeSql(sql, [], ajaxRecords, handleErrors);
        }
    );
}