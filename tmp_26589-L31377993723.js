'use strict';

//-- Objekt des Logbuchs -----------------------------------------------------------
function Logbook(completeLogbook, filename, colums, rows, hourmeter, timeOfReadOut, logbookHeader, filedate, deviceName) {
    //Name der Logbuchdatei
    this.filename = filename;
    //Aenderungsdatum der Logbuchdatei
    this.filedate = filedate;
    //Anzahl der Spalten
    this.colums = colums;
    //Anzahl der Zeilen
    this.rows = rows;
    //Netzeinschaltstundenspalte
    this.hourmeter = hourmeter;
    //Zeit des Auslesens der Datei
    this.timeOfReadOut = timeOfReadOut;
    //String des gesamten Logbuchs
    this.completeLogbook = completeLogbook;
    //Array der Kopfzeile des Logbuchs
    this.logbookHeader = logbookHeader;
    //Geraetename, wenn es ein i500 ist. Sonst leer.
    this.deviceName = deviceName;
    //Funktion zum ermitteln des Logbuchtyps
    this.getDeviceType = function () {

        var type = 'unknown';
        switch (this.colums) {
        case 5:
            type = '9400';
            break;
        case 7:
            type = 'i500';
            break;
        case 16:
            type = '8400';
            break;
        }
        return type;
    }
}
    
//-- Funktion zum erstellen einer Matrix aus einer csv-Datei -------------------------------------->
function csvToMatrix (dateiInhalt) {
    let logbookTable = new Array;
    
    if (dateiInhalt.isString === false) throw 'function csvToMarix: Error, arg is not a string object!';

    var rows = dateiInhalt.split('\n'); //Array mit allen Zeilen erstellen

    rows.forEach(function (element, index, array) {
        if (element.includes(';')) logbookTable[index] = element.split(';');
    });
    console.log(logbookTable);
    return logbookTable;
}

//-- Funktion zum inversieren einer Matrix --------------------------------------------------------->
function transposeMatrix (matrix) {

    //Argumenten pruefung
    if (matrix.isArray === false) throw  'function transposeMatrix: Error, arg is not an Array!';
    
    var matrixT = matrix[0].map(function(col, i) { 
        return matrix.map(function(row) { 
            return row[i] 
        })
    });
    
    console.log(matrixT);
    return matrixT;
}

//-- Funktion zur Erstellung einer HTML Tabelle aus einer 2D Matrix -------------------------------->
function htmlMatrix (matrix) {
    //Argumenten pruefung
    if (matrix.isArray === false) throw  'function htmlMatrix: Error, arg is not an Array!';

}

var dateiKopf = document.getElementById('Dateikopf');

//-- Ereignis Behandlung - Die Datei wurde uebergeben ----------------------------->
function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    dateiKopf.style.backgroundColor = '#ffffff';

    var logbook = new Logbook();
    var reader = new FileReader();
    var fileList = evt.dataTransfer.files; // FileList object.
    //document.getElementById("LBfilename").textContent = "Datei: " + fileList[0].name;
    logbook.filename = fileList[0].name;
    logbook.filedate = fileList[0].lastModifiedDate;

    console.log("Filename: " + fileList[0].name);


    //-- Hier beginnt die Verarbeitung der Logbuchdaten  -------> 
    reader.onload = function () {
        //Die Datei wurde gelesen und nun sichern wir sie in unserem Object
        var lbarray = csvToMatrix(reader.result);
        transposeMatrix(lbarray);
 
//        logbook.logbookHeader = logbook.rows[0].split(';');
        logbook.colums = logbook.logbookHeader.length;
        //Debug Ausgaben
        console.log(logbook.rows.length);
        console.log(logbook.logbookHeader);

        var IdType = document.getElementById('LBtype');
        IdType.textContent = logbook.getDeviceType();

        //-- Tabelle wird eingefuegt ---------------------------------------------->
        var LBnode = document.getElementById("logbooktable");
        var xdeser12 = document.getElementById('xdeser12');
        if( xdeser12 !== null) {
            dropZone.removeChild(xdeser12);
        }

        LBnode.parentNode.insertBefore(createLogbookTable(logbook), LBnode);
        //LBnode.className = "w3-table";
        document.getElementById('Dateikopf').nextElementSibling.className = "w3-table w3-bordered w3-border";


        //-- Ende der Verarbeitung --------------------------------->
    };
    reader.readAsText(fileList[0]);
}

//-- Hier wird die Tabelle fuer das Logbuch gebaut.
function createLogbookTable(logbook) {
    //Tabellenheader erstellen -------------------------------
    let LBtable = document.createElement("table");
    let LBhead = document.createElement("thead");
    let LBbody = document.createElement("tbody");
    let LBrow = document.createElement("tr");

    for (let x in logbook.logbookHeader) {
        let LBcell = document.createElement("th");
        let LBtext = document.createTextNode(logbook.logbookHeader[x]);
        LBcell.appendChild(LBtext);
        LBrow.appendChild(LBcell);
    }
    LBhead.appendChild(LBrow);
    LBtable.appendChild(LBhead);

    //Tabellenfuellung erstellen ----------------------------
    for (let x=1; x < logbook.rows.length; x++) {
        let LBrow = document.createElement("tr");
        let tabrow = logbook.rows[x];
        let tabcell = tabrow.split(';');
        for (let i in tabcell) {
            let LBcell = document.createElement("td");
            let LBtext = document.createTextNode(tabcell[i]);
            LBcell.appendChild(LBtext);
            LBrow.appendChild(LBcell);
        }
        LBbody.appendChild(LBrow);
    }
    LBtable.appendChild(LBbody);
    LBtable.setAttribute('id', 'xdeser12');
    return LBtable;
}

//-- Drag Behandlung --------------------------------------------------------------->
function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    //evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
    dateiKopf.style.backgroundColor = '#66ccff';
}

//-- Drag leave - Farbumschlag rueckgaengig machen ---------------------------------->
function handleDragLeave(evt) {
    dateiKopf.style.backgroundColor = '#ffffff';
    console.log('DragLeaveHandler - OK');
}

//-- Setup the evt listeners. ------------------------------------------------------>
var dropZone = document.getElementById('drop_zone');
dropZone.addEventListener('dragover', handleDragOver, false);
dropZone.addEventListener('dragleave', handleDragLeave, false);
dropZone.addEventListener('drop', handleFileSelect, false);
