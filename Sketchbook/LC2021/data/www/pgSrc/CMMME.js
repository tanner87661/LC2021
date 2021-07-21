var mainScrollBox;
var switchTable;
var mqttTitle;
var mqttBox;

var swiCfgData = [{},{},{}];
var btnCfgData = [{},{},{}];
var evtHdlrCfgData = [{},{},{}];
var ledData = [{},{},{}];
var colOptions = [];

var subFileIndex = 0;
var updateServoPos = false;

var currDispPage = 0;

var maxButtons = 0;
var numChannels = 16;

var updateServoPos = true;

var btnStatus = ["off", "digital", "analog"];
var devOptions = ["Servo", "Relay", "LED"];
var ledOptionArray = ["switch", "signaldyn", "signal", "button", "analog", "block", "transponder", "power", "constant", "signalstat"];
var sourceOptionArray = ["switch","dccsignal"];
//var sourceOptionArray = ["switch","dynsignal","dccsignal", "button","analogvalue", "blockdetector", "transponder"];
var newButtonTemplate = {"PortNr": 0, "ButtonType": "digital", "EventMask": 3, "ButtonAddr": 0};
var newEventTemplate = {"Used": 1, "AspVal": 65535, "PosPt": 270, "MoveCfg": 0};
var newEventHdlrTemplate = {"ButtonNr":[0],"CondData":[],"CtrlCmd": []};
var newEventCmdTemplate = {"BtnCondAddr": [], "CmdList": [{"CtrlTarget": "none", "CtrlAddr": 0, "CtrlType":"toggle", "CtrlValue":"on", "ExecDelay":20}]};
var newColTemplate = {"Name": "New Color","RGBVal": [255, 255, 255]};
var newLEDTemplate = {"LEDNums":[],"CtrlSource": "","CtrlAddr": [],"DisplayType":"discrete","LEDCmd": []};
var newLEDCmdTemplate = {"Val": 0,"ColOn": "", "ColOff": "", "Mode": "static", "Rate":0, "Transition":"soft"};
var cmdOptions = ["switch", "switchack", "signal", "block", "none"];
//var cmdOptions = ["switch", "signal", "block", "none"];
var swiCmdOptions = ["thrown","closed","toggle"];
var blockCmdOptions = ["occupied","free"];
//var blockCmdOptions = ["occupied","free"];

var ledCtrlType = ["switch", "signaldyn", "signal", "button", "analog", "block", "transponder", "power", "constant", "signalstat"];
var ledModeType = ["static", "localblinkpos", "localblinkneg", "globalblinkpos", "globalblinkneg", "localrampup", "localrampdown", "globalrampup", "globalrampdown"];
var ledTransitionType = ["soft", "direct", "merge"];
var trackPwrType = ["off", "on", "idle"];
var btnType = ["onbtndown", "onbtnup", "onbtnclick", "onbtnhold", "onbtndlclick"];
var dispType = ["discrete","linear"];
var newCmdTemplate = {"Val": 0,	"ColOn": "", "Mode": "static","Rate":0,	"Transition":"soft"};

var dispOptions = ["static", "localblinkpos", "localblinkneg", "globalblinkpos", "globalblinkneg","localrampup", "localrampdown","globalrampup", "globalrampdown"]
var transOptions = ["soft", "direct","merge"];
var ledModeDispType = ["Static", "Pos Local Blink", "Neg Local Blink", "Pos Global Blink",  "Neg Global Blink", "Local Rampup", "Local Rampdown", "Global Rampup", "Global Rampdown"];
var ledDispType = ["discrete", "linear"];
var ledTransitionDispType = ["Soft", "Direct", "Merge"];
var blockValDispType = ["free","occupied"];
var switchValDispType = ["Thrown, Coil On", "Thrown, Coil Off", "Closed, Coil On", "Closed, Coil Off"];
var buttonValDispType = ["Btn Down", "Btn Up", "Btn Click", "Btn Hold", "Btn Dbl Click"];
var powerValDispType = ["Off", "On", "Idle"];
var transponderValDispType = ["Enter", "Leave"];

var templateDlg = null;
var level0Div;
var level1Div;
var level2Div;
var level3Div;
var level4Div;

function downloadSettings(sender)
{
	downloadConfig(0x0200); //send just this
}

function saveConfigFileSettings()
{
	//step 1: save greenhat.cfg
//	if (JSON.stringify(configData[loadCfg]) != JSON.stringify(configData[workCfg]))
		saveJSONConfig(scriptList.Pages[currentPage].ID, scriptList.Pages[currentPage].FileName, configData[workCfg], null);
	//then save the other files
	for (var i = 0; i < configData[workCfg].Modules.length; i++)
	{
		if (JSON.stringify(swiCfgData[loadCfg]) != JSON.stringify(swiCfgData[workCfg]))
			saveJSONConfig(configData[workCfg].Modules[i].CfgFiles[0].ID, configData[workCfg].Modules[i].CfgFiles[0].FileName, swiCfgData[workCfg], prepareFileSeqSwi);
		if (JSON.stringify(btnCfgData[loadCfg]) != JSON.stringify(btnCfgData[workCfg]))
			saveJSONConfig(configData[workCfg].Modules[i].CfgFiles[0].ID, configData[workCfg].Modules[i].CfgFiles[1].FileName, btnCfgData[workCfg], null);
		if (JSON.stringify(evtHdlrCfgData[loadCfg]) != JSON.stringify(evtHdlrCfgData[workCfg]))
			saveJSONConfig(configData[workCfg].Modules[i].CfgFiles[0].ID, configData[workCfg].Modules[i].CfgFiles[2].FileName, evtHdlrCfgData[workCfg], prepareFileSeqBtnEvt);
//		if (JSON.stringify(ledData[loadCfg]) != JSON.stringify(ledData[workCfg]))
//			saveJSONConfig(configData[workCfg].Modules[i].CfgFiles[0].ID, configData[workCfg].Modules[i].CfgFiles[3].FileName, ledData[workCfg], null);
//		console.log(swiCfgData[workCfg]);
	}
}

function addFileSeq(ofObj) //object specific function to include partial files
{
	if (ofObj.Type == "pgBtnHdlrCfg")
		addFileSeqBtnHdlr(ofObj, evtHdlrCfgData);

	if (ofObj.Type == "pgSwitchCfg")
		addFileSeqSwi(ofObj, swiCfgData);
}

function prepareFileSeq() //object specific function to create partial files
{
	var objCopy = JSON.parse(JSON.stringify(configData[workCfg]));
	transferData[0].FileList.push(objCopy);
	
/*	
	function addEntry()
	{
		var newEntry = {"ButtonHandler":[]}
		transferData[0].FileList.push(newEntry);
		return newEntry;
	}
	
	var thisEntry = addEntry();
	thisEntry.Version = jsonFileVersion;
	var thisFileLength = 0;
	
	for (var j=0; j<configData[workCfg].ButtonHandler.length;j++)
	{
		var thisElementStr = JSON.stringify(configData[workCfg].ButtonHandler[j]);
		thisFileLength += thisElementStr.length;
		thisEntry.ButtonHandler.push(JSON.parse(thisElementStr));
		if ((thisFileLength > targetSize) && (j < (configData[workCfg].ButtonHandler.length - 1)))
		{
			thisEntry = addEntry();
			thisFileLength = 0;
		}
	}
*/
}

function addDataFile(ofObj)
{
	switch (ofObj.Type)
	{
		case "pgSwitchCfg":
			if (swiCfgData[loadCfg].Drivers == undefined)
				swiCfgData[loadCfg] = JSON.parse(JSON.stringify(ofObj.Data));
			else
				addFileSeqSwi(ofObj, swiCfgData);

			swiCfgData[workCfg] = upgradeJSONVersionSwitch(JSON.parse(JSON.stringify(swiCfgData[loadCfg])));
			console.log(swiCfgData[workCfg]);
			break;
		case "pgHWBtnCfg":
			btnCfgData[loadCfg] = JSON.parse(JSON.stringify(ofObj.Data));
			btnCfgData[workCfg] = upgradeJSONVersionBtn(JSON.parse(JSON.stringify(btnCfgData[loadCfg])));
			while (btnCfgData[workCfg].Buttons.length > 16)
				btnCfgData[workCfg].Buttons.pop();
			while (btnCfgData[workCfg].Buttons.length < 16)
				btnCfgData[workCfg].Buttons.push(JSON.parse(JSON.stringify(newButtonTemplate)));
//			console.log(btnCfgData[workCfg]);
			break;
		case "pgBtnHdlrCfg":
			if (evtHdlrCfgData[loadCfg].ButtonHandler == undefined)
				evtHdlrCfgData[loadCfg] = JSON.parse(JSON.stringify(ofObj.Data));
			else
				addFileSeqBtnHdlr(ofObj, evtHdlrCfgData);
//			console.log(evtHdlrCfgData[loadCfg].ButtonHandler.length);
			evtHdlrCfgData[workCfg] = upgradeJSONVersionBtnHdlr(JSON.parse(JSON.stringify(evtHdlrCfgData[loadCfg])));
			while (evtHdlrCfgData[workCfg].ButtonHandler.length > 64)
				evtHdlrCfgData[workCfg].ButtonHandler.pop();
			while (evtHdlrCfgData[workCfg].ButtonHandler.length < 64)
				evtHdlrCfgData[workCfg].ButtonHandler.push(JSON.parse(JSON.stringify(newEventHdlrTemplate)));
			for (var i = 0; i < evtHdlrCfgData[workCfg].ButtonHandler.length; i++)
			{
//				evtHdlrCfgData[workCfg].ButtonHandler[i].ButtonNr = btnCfgData[workCfg].Buttons[i].ButtonAddr;
				evtHdlrCfgData[workCfg].ButtonHandler[i] = adjustHdlrEventList(evtHdlrCfgData[workCfg].ButtonHandler[i], 2);
			}
//			console.log(evtHdlrCfgData[workCfg]);
			break;
/*
		case "pgLEDCfg":
			if (ledData[loadCfg].LEDDefs == undefined)
				ledData[loadCfg] = JSON.parse(JSON.stringify(ofObj.Data));
			else
				addFileSeqLED(ofObj, ledData);
			ledData[workCfg] = upgradeJSONVersionLED(JSON.parse(JSON.stringify(ledData[loadCfg])));
			while (ledData[workCfg].LEDDefs.length > 33)
				ledData[workCfg].LEDDefs.pop();
			while (ledData[workCfg].LEDDefs.length < 33)
				ledData[workCfg].LEDDefs.push(JSON.parse(JSON.stringify(newLEDTemplate)));
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
//			console.log(ledData[workCfg]);
			break;
*/
	}
//	if (ledData[workCfg].LEDCols != undefined) //LEDCols
//		loadColorTable(colorTable, ledData[workCfg].LEDCols);
	updateServoPos = false;
	document.getElementById("servomaxval").value = swiCfgData[workCfg].ServoMaxPos;
	document.getElementById("servominval").value = swiCfgData[workCfg].ServoMinPos;
	loadTableData(switchTable, swiCfgData[workCfg].Drivers, btnCfgData[workCfg].Buttons, evtHdlrCfgData[workCfg].ButtonHandler, ledData[workCfg].LEDDefs);
	updateServoPos = true;
}
/*
function HSVtoRGB(hue, sat, val) 
{
	var h = hue / 255; //scaling from [0,255] to [0,1] interval
	var s = sat / 255;
	var v = val / 255;

    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHsv(r, g, b) 
{
	r /= 255, g /= 255, b /= 255;

	var max = Math.max(r, g, b), min = Math.min(r, g, b);
	var h, s, v = max;

	var d = max - min;
	s = max == 0 ? 0 : d / max;

	if (max == min) 
	{
		h = 0; // achromatic
	} 
	else 
	{
		switch (max) 
		{
			case r: h = (g - b) / d + (g < b ? 6 : 0); break;
			case g: h = (b - r) / d + 2; break;
			case b: h = (r - g) / d + 4; break;
		}
		h /= 6;
	}
	return [Math.round(h*255), Math.round(s*255), Math.round(v*255)];
}

function setColorData(sender)
{
	var thisRow = parseInt(sender.getAttribute("row"));
	var thisCol = parseInt(sender.getAttribute("col"));
	var thisIndex = parseInt(sender.getAttribute("index"));
//	console.log(thisRow, thisCol, thisIndex);
	switch (thisCol)
	{
		case -1: //empty table, create first entry
			ledData[workCfg].LEDCols.push(JSON.parse(JSON.stringify(newColTemplate)));
			loadColorTable(colorTable, ledData[workCfg].LEDCols);
			break;
		case 1: //Color Name
			ledData[workCfg].LEDCols[thisRow].Name = sender.value;
			break;
		case 2: //Color RGB Value
			var thisColorStr = sender.value.replace("#", "0x");
			var thisColor = parseInt(thisColorStr);
			ledData[workCfg].LEDCols[thisRow].RGBVal[0] = (thisColor & 0xFF0000) >> 16;
			ledData[workCfg].LEDCols[thisRow].RGBVal[1] = (thisColor & 0x00FF00) >> 8;
			ledData[workCfg].LEDCols[thisRow].RGBVal[2] = (thisColor & 0x0000FF);
			ledData[workCfg].LEDCols[thisRow].HSVVal = rgbToHsv(ledData[workCfg].LEDCols[thisRow].RGBVal[0],ledData[workCfg].LEDCols[thisRow].RGBVal[1],ledData[workCfg].LEDCols[thisRow].RGBVal[2]);
//			console.log(configData[2].LEDCols[thisRow]);
			break;
		case 3: //Manipulator buttons
			var idStr = sender.id;
			var thisElement;
			if (thisIndex == 1)
				ledData[workCfg].LEDCols.splice(thisRow+1, 0, JSON.parse(JSON.stringify(newColTemplate)));
			if (thisIndex == 2)
			{
				var noReference = true;
				var colName = ledData[workCfg].LEDCols[thisRow].Name;
//				console.log("Searching for: " + colName);
				for (var i = 0; i < ledData[workCfg].LEDDefs.length; i++)
				{
					for (var j = 0; j < ledData[workCfg].LEDDefs[i].LEDCmd.length; j++)
					{
						if (Array.isArray(ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn))
						{
							if (ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn.indexOf(colName) >= 0)
							{
								noReference = false;
								break;
							}
						}
						else
							if (ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn == colName)
							{
								noReference = false;
								break;
							}
						if (ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOff != undefined)
							if (Array.isArray(ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn))
							{
								if (ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn.indexOf(colName) >= 0)
								{
									noReference = false;
									break;
								}
							}
							else
								if (ledData[workCfg].LEDDefs[i].LEDCmd[j].ColOn == colName)
								{
									noReference = false;
									break;
								}
					}
				}
				if (noReference)
					ledData[workCfg].LEDCols.splice(thisRow, 1);
				else
					alert(colName + " is currently used in the table below. Remove any reference before deleting this color!");
			}
			if ((thisIndex == 3) && (thisRow > 0))
			{
				thisElement = ledData[workCfg].LEDCols.splice(thisRow, 1);
				ledData[workCfg].LEDCols.splice(thisRow-1,0, thisElement[0]);
			}
			if ((thisIndex == 4) && (thisRow < ledData[workCfg].LEDCols.length))
			{
				thisElement = ledData[workCfg].LEDCols.splice(thisRow, 1);
				ledData[workCfg].LEDCols.splice(thisRow+1,0, thisElement[0]);
			}
//			console.log(configData[2].LEDCols);
			loadColorTable(colorTable, ledData[workCfg].LEDCols);
			break;
	}
}

function loadLEDTable(thisTable, thisData)
{
		function selByName(prmVal)
		{
			return (prmVal == thisData[i].CtrlSource);
		}

//	console.log(thisData);
	var th = document.getElementById(thisTable.id + "_head");
	var tb = document.getElementById(thisTable.id + "_body");
	var numCols = th.childNodes[0].children.length;
	createDataTableLines(thisTable, [tfPos, tfLEDSelector, tfCommandEditor], 1, "setLEDData(this)");
	var i=0;
//	for (var i=0; i<thisData.length;i++)
	{
		document.getElementById("manipulatorbox_" + i.toString() + "_" + "1").style.visibility = "hidden";
		var e = document.getElementById("lednrbox_" + i.toString() + "_" + "1");
		e.readOnly = true;
		e.value = thisData[i].LEDNums;

		var e = document.getElementById("multicolor_" + i.toString() + "_" + "1");
		if (Array.isArray(thisData[i].LEDNums) && (thisData[i].LEDNums.length > 1))
			e.parentElement.style.visibility = "none";
		else
			e.parentElement.style.visibility = "hidden";
		e.checked = thisData[i].MultiColor;
//		console.log("Check Multi Color");
		
		var e = document.getElementById("disptypebox_" + i.toString() + "_" + "1");
		e.selectedIndex = dispType.indexOf(thisData[i].DisplayType);
		
		if ([2,4].indexOf(ledCtrlType.indexOf(thisData[i].CtrlSource)) >= 0)
//		if ((thisData[i].CtrlSource == "analog") || (thisData[i].CtrlSource == "signal"))
			e.parentElement.style.visibility = "none";
		else
			e.parentElement.style.visibility = "hidden";

		var e = document.getElementById("transpselbox_" + i.toString() + "_" + "1");
		if ([6].indexOf(ledCtrlType.indexOf(thisData[i].CtrlSource)) >= 0)
		{
			if (thisData[i].CondAddr == undefined)
				e.value = "";
			else
				e.value = thisData[i].CondAddr;
			e.parentElement.style.visibility = "none";
		}
		else
			e.parentElement.style.visibility = "hidden";

		var e = document.getElementById("cmdlistbox_" + i.toString() + "_" + "1");
		e.selectedIndex = ledCtrlType.indexOf(thisData[i].CtrlSource);

		var e = document.getElementById("addressbox_" + i.toString() + "_" + "1");
		e.value = thisData[i].CtrlAddr;
		if ([7,8].indexOf(document.getElementById("cmdlistbox_" + i.toString() + "_" + "1").selectedIndex) >= 0)
		{
			e.style.visibility = "hidden";
			document.getElementById("addrtext_" + i.toString() + "_" + "1").style.visibility = "hidden";
		}
		
		buildCmdLines(i, thisData[i]);

	}
//	console.log();
}

function setLEDData(sender)
{
	function adjustCmdLines(currentRow)
	{
		var numCmds;
		var numAddr = 1;
		if (Array.isArray(ledData[workCfg].LEDDefs[currentRow].CtrlAddr))
			numAddr = ledData[workCfg].LEDDefs[currentRow].CtrlAddr.length;
		switch (ledCtrlType.indexOf(ledData[workCfg].LEDDefs[currentRow].CtrlSource))
		{
//			case 9 : ; //used to be static signal, now switch
			case 0 : numCmds = Math.pow(2, numAddr); break; //switch
			case 1 : numCmds = 2 * numAddr; break; //signaldyn
			case 2 : numCmds = 1; break; //signal
			case 3 : numCmds = 5; break; //button
			case 4 : numCmds = 1; break; //analog
			case 5 : numCmds = Math.pow(2, numAddr); break; //block
			case 6 : numCmds = 2; break; //transponder
			case 7 : numCmds = 3; break; //power
			case 8 : numCmds = 1; break; //constant
		}
		while (ledData[workCfg].LEDDefs[currentRow].LEDCmd.length < numCmds)
			ledData[workCfg].LEDDefs[currentRow].LEDCmd.push(JSON.parse(JSON.stringify(newCmdTemplate)));
		while (ledData[workCfg].LEDDefs[currentRow].LEDCmd.length > numCmds)
			ledData[workCfg].LEDDefs[currentRow].LEDCmd.splice(ledData[workCfg].LEDDefs[currentRow].LEDCmd.length-1, 1);
	}
	
	function adjustColorEntries(currentRow)
	{
		function verifyArray(thisArray, newLen, initVal)
		{
			var resArray = [];
			var oldLen = 0;
			var setVal = initVal;
			if (Array.isArray(thisArray))
			{
				oldLen = Math.min(thisArray.length, newLen);
				setVal = thisArray[oldLen - 1];
				for (var i = 0; i < oldLen; i++)
					resArray.push(thisArray[i]);
			}
			else
				if (thisArray != undefined)
					setVal = thisArray;
			while (resArray.length < newLen)
				resArray.push(setVal);
			return resArray;
		}
		
		if (ledData[workCfg].LEDDefs[currentRow].MultiColor)
		{
			var numCols = ledData[workCfg].LEDDefs[currentRow].LEDNums.length;
			for (var i = 0; i < ledData[workCfg].LEDDefs[currentRow].LEDCmd.length; i++)
			{	//for each command
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOn = verifyArray(ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOn, numCols, "");
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOff = verifyArray(ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOff, numCols, "");
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Mode = verifyArray(ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Mode, numCols, "static");
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Rate = verifyArray(ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Rate, numCols, 0);
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Transition = verifyArray(ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Transition, numCols, "soft");
			}
		}
		else
		{
			for (var i = 0; i < ledData[workCfg].LEDDefs[currentRow].LEDCmd.length; i++)
			{	//for each command
				var oldColOn = ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOn;
//				console.log(typeof oldColOn);
				if (typeof oldColOn == "object")
					oldColOn = ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOn[0];
				var oldColOff;
				try
				{
					oldColOff = ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOff;
					if (typeof oldColOff == "object")
						oldColOff = ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOff[0];
				}
				catch(err) 
				{
					oldColOff = "";
				}
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOn = oldColOn;
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].ColOff = oldColOff;
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Mode.splice(1, ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Mode.length-1);
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Rate.splice(1, ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Rate.length-1);
				ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Transition.splice(1, ledData[workCfg].LEDDefs[currentRow].LEDCmd[i].Transition.length-1);
			}
		}
	}
	
	var thisRow = parseInt(sender.getAttribute("row"));
	var thisCol = parseInt(sender.getAttribute("col"));
	var thisIndex = parseInt(sender.getAttribute("index"));
	console.log(thisRow, thisCol, thisIndex);
	switch (thisCol)
	{
		case -1: //empty table, create first entry
			ledData[workCfg].LEDDefs.push(JSON.parse(JSON.stringify(newLEDTemplate)));
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
			break;
		case 1: //CommandSelector
			var idStr = sender.id;
			var thisElement;
			switch (thisIndex)
			{
				case 1:
					if (event.ctrlKey) //duplicate entry
						ledData[workCfg].LEDDefs.splice(thisRow+1, 0, JSON.parse(JSON.stringify(configData[2].LEDDefs[thisRow])));
					else //create new entry
						ledData[workCfg].LEDDefs.splice(thisRow+1, 0, JSON.parse(JSON.stringify(newLEDTemplate)));
					break;
				case 2:
					ledData[workCfg].LEDDefs.splice(thisRow, 1);
					break;
				case 3:
					if (thisRow > 0)
					{
						thisElement = configData[2].LEDDefs.splice(thisRow, 1);
						ledData[workCfg].LEDDefs.splice(thisRow-1,0, thisElement[0]);
					}
					break;
				case 4:
					if (thisRow < ledData[workCfg].LEDDefs.length)
					{
						thisElement = ledData[workCfg].LEDDefs.splice(thisRow, 1);
						ledData[workCfg].LEDDefs.splice(thisRow+1,0, thisElement[0]);
					}
					break;
				case 5:
					{
						var newArray = verifyNumArray(sender.value, ",");
						if (newArray.length > 0)
						{
							if (newArray.length > 1)
							{
								ledData[workCfg].LEDDefs[thisRow].LEDNums = []; //make sure this is an array
								for (var i = 0; i < newArray.length; i++)
									ledData[workCfg].LEDDefs[thisRow].LEDNums.push(newArray[i]);
								adjustColorEntries(thisRow);
							}
							else //==1
							{
								ledData[workCfg].LEDDefs[thisRow].LEDNums = [newArray[0]];
								ledData[workCfg].LEDDefs[thisRow].MultiColor = false;
							}
						}
						else
							alert(sender.value + " is not a valid number or array. Please verify");
					}
					break;
				case 6:
					{
						ledData[workCfg].LEDDefs[thisRow].MultiColor = sender.checked; 
						adjustColorEntries(thisRow);
					}
					break;
				case 7:
					{
						var oldSource = ledData[workCfg].LEDDefs[thisRow].CtrlSource;
						ledData[workCfg].LEDDefs[thisRow].CtrlSource = ledCtrlType[sender.selectedIndex];
						if (ledData[workCfg].LEDDefs[thisRow].CtrlSource != oldSource)
							adjustCmdLines(thisRow);
					}
					break;
				case 8:
					{
						var newArray = verifyNumArray(sender.value, ",");
						if (newArray.length > 0)
						{
							var oldLen = Array.isArray(ledData[workCfg].LEDDefs[thisRow].CtrlAddr) ? ledData[workCfg].LEDDefs[thisRow].CtrlAddr.length : 1;
							if (newArray.length > 1)
								ledData[workCfg].LEDDefs[thisRow].CtrlAddr = newArray; //make sure this is an array
							else
								ledData[workCfg].LEDDefs[thisRow].CtrlAddr = newArray[0];
							//shorten array length.switch and block detector max 3, others max 1
							if ([0,1,5].indexOf(ledCtrlType.indexOf(ledData[workCfg].LEDDefs[thisRow].CtrlSource)) >= 0)
								while (newArray.length > 3)
									newArray.pop();
							else
								while (newArray.length > 1)
									newArray.pop();
							sender.value = newArray;
//							console.log(newArray);
							if (newArray.length != oldLen)
								adjustCmdLines(thisRow);
//							console.log(sender.value);
						}
						else
							alert(sender.value + " is not a valid number or array. Please verify");
					}
					break;
				case 9:
					ledData[workCfg].LEDDefs[thisRow].DisplayType = dispType[sender.selectedIndex];
					break;
				case 10:
					{
						var newArray = verifyNumArray(sender.value, ",");
						if (newArray.length > 0)
							ledData[workCfg].LEDDefs[thisRow].CondAddr = newArray;
						else
							ledData[workCfg].LEDDefs[thisRow].CondAddr = [];
					}
					break;
				case 21:
					setLEDTestDisplay(ledData[workCfg].LEDDefs[thisRow].LEDNums);
					break;
			} //thisIndex
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
	} //thisCol
}

function setLEDCmdData(sender)
{
	var thisRow = parseInt(sender.getAttribute("row"));
	var thisCol = parseInt(sender.getAttribute("col"));
	var thisIndex = parseInt(sender.getAttribute("index"));
	var thisCmdLine = parseInt(sender.getAttribute("cmdline"));
	if (isNaN(thisCmdLine))
		thisCmdLine = parseInt(sender.parentElement.getAttribute("cmdline"));
	var thisElement;
	var thisID;
	console.log("setLEDCmdData", thisRow, thisCol, thisIndex, thisCmdLine, sender.id, ledData[workCfg].LEDDefs[thisRow]);
	switch (thisIndex)
	{
		case 1: //new Cmd Entry
			ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine+1, 0, JSON.parse(JSON.stringify(newCmdTemplate)));
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
			break;
		case 2: //delete Cmd Entry
			ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine, 1);
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
			break;
		case 3: //Up
			if (thisCmdLine > 0)
			{
				thisElement = ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine, 1);
				ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine-1,0, thisElement[0]);
			}
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
			break;
		case 4: //Down
			if (thisCmdLine < ledData[workCfg].LEDDefs[thisRow].LEDCmd.length)
			{
				thisElement = ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine, 1);
				ledData[workCfg].LEDDefs[thisRow].LEDCmd.splice(thisCmdLine+1,0, thisElement[0]);
			}
			loadLEDTable(ledDefTable, ledData[workCfg].LEDDefs);
			break;
		case 6: //value
			ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Val = verifyNumber(sender.value, ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Val);
			break;
		case 8: //oncolor
			if (ledData[workCfg].LEDDefs[thisRow].MultiColor)
			{
				thisID = "ledselector" + thisRow.toString() + "_" + thisCmdLine.toString();
				var e = document.getElementById(thisID);
				var currSel = e.selectedIndex;
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOn[currSel] = ledData[workCfg].LEDCols[sender.selectedIndex].Name;
			}
			else
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOn = ledData[workCfg].LEDCols[sender.selectedIndex].Name;
			break;
		case 9: //offcolor
			if (ledData[workCfg].LEDDefs[thisRow].MultiColor)
			{
				thisID = "ledselector" + thisRow.toString() + "_" + thisCmdLine.toString();
				var e = document.getElementById(thisID);
				var currSel = e.selectedIndex;
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOff[currSel] = ledData[workCfg].LEDCols[sender.selectedIndex].Name;
			}
			else
			{
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOff = ledData[workCfg].LEDCols[sender.selectedIndex].Name;
			}
			break;
		case 10: //Mode
			if (ledData[workCfg].LEDDefs[thisRow].MultiColor)
			{
				thisID = "ledselector" + thisRow.toString() + "_" + thisCmdLine.toString();
				var e = document.getElementById(thisID);
				var currSel = e.selectedIndex;
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Mode[currSel] = ledModeType[sender.selectedIndex];
			}
			else
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Mode[0] = ledModeType[sender.selectedIndex];
			break;
		case 11: //Rate
			if (ledData[workCfg].LEDDefs[thisRow].MultiColor)
			{
				thisID = "ledselector" + thisRow.toString() + "_" + thisCmdLine.toString();
				var e = document.getElementById(thisID);
				var currSel = e.selectedIndex;
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Rate[currSel] = verifyNumber(sender.value, ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Rate[currSel]);
			}
			else
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Rate[0] = verifyNumber(sender.value, ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Rate[0]);
			break;
		case 12: //Transition
			if (ledData[workCfg].LEDDefs[thisRow].MultiColor)
			{
				thisID = "ledselector" + thisRow.toString() + "_" + thisCmdLine.toString();
				var e = document.getElementById(thisID);
				var currSel = e.selectedIndex;
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Transition[currSel] = ledTransitionType[sender.selectedIndex];
			}
			else
				ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Transition[0] = ledTransitionType[sender.selectedIndex];
			break;
		case 15: //select individual LED
			var colorArray = [];
			for (var i = 0; i < ledData[workCfg].LEDCols.length; i++)
				colorArray.push(ledData[workCfg].LEDCols[i].Name);
			var thisIndex = sender.selectedIndex;
			thisID = "oncolsel_" + thisRow.toString() + "_" + thisCmdLine.toString();
			var onColSel = document.getElementById(thisID);
			thisID = "offcolsel_" + thisRow.toString() + "_" + thisCmdLine.toString();
			var offColSel = document.getElementById(thisID);
			onColSel.selectedIndex = colorArray.indexOf(ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOn[thisIndex]);
			offColSel.selectedIndex = colorArray.indexOf(ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].ColOff[thisIndex]);
			
			thisID = "modesel_" + thisRow.toString() + "_" + thisCmdLine.toString();
			var modeSel = document.getElementById(thisID);
			modeSel.selectedIndex = ledModeType.indexOf(ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Mode[thisIndex]);
			
			thisID = "ratesel_" + thisRow.toString() + "_" + thisCmdLine.toString();
			var rateSel = document.getElementById(thisID);
			rateSel.value = ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Rate[thisIndex];

			thisID = "transitionsel_" + thisRow.toString() + "_" + thisCmdLine.toString();
			var transitionSel = document.getElementById(thisID);
			transitionSel.selectedIndex = ledTransitionType.indexOf(ledData[workCfg].LEDDefs[thisRow].LEDCmd[thisCol].Transition[thisIndex]);
			
			break;
	}
}

function createColorSelectField(parentObj, lineIndex, cmdIndex, cmdLineData, evtHandler)
{
	var upperDiv = document.createElement("div");
	upperDiv.setAttribute("class", "editorpanel");
	var thisID;
	if ((cmdLineData.CtrlSource == "signal") || (cmdLineData.CtrlSource == "analog"))
	{
		thisID = "cmdmanipulator_" + lineIndex.toString() + "_" + cmdIndex.toString();
		var thisBox = tfManipulatorBox(lineIndex, 1, thisID, evtHandler);
		tfSetCoordinate(thisBox, lineIndex, cmdIndex, 1, thisID);
		thisBox.setAttribute("cmdline", cmdIndex);
		upperDiv.append(thisBox);
	}
			
	var thisText = tfText(lineIndex, cmdIndex, "", evtHandler);
	thisText.innerHTML = "Value:&nbsp;";
	upperDiv.append(thisText);
	
	thisID = "ctrlvalue_" + lineIndex.toString() + "_" + cmdIndex.toString();
	var thisElement;
	if ((cmdLineData.CtrlSource == "signal") || (cmdLineData.CtrlSource == "analog"))
	{
		thisElement = tfNumeric(lineIndex, 5, thisID, evtHandler);
		tfSetCoordinate(thisElement, lineIndex, cmdIndex, 5, thisID);
		thisElement.setAttribute("cmdline", cmdIndex);
		thisElement.value = cmdLineData.LEDCmd[cmdIndex].Val;
		tfSetCoordinate(thisElement, lineIndex, cmdIndex, 6, thisID);
		thisElement.setAttribute("index", 6);
	}
	else
//add code for	if (cmdLineData.CtrlSource == "transponder")
	{
		thisElement = tfText(lineIndex, 6, thisID, evtHandler);
		tfSetCoordinate(thisElement, lineIndex, cmdIndex, 6, thisID);
		switch (ledCtrlType.indexOf(cmdLineData.CtrlSource))
		{
			case 0: //switch
			case 9: //signalstat
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex;
				var bitMask = 0x01;
				var dispStr = "";
				var numAddr = 1;
				var isArray = Array.isArray(cmdLineData.CtrlAddr);
				if (isArray)
					numAddr = cmdLineData.CtrlAddr.length;
				for (var i = 0; i < numAddr; i++)
				{
					if (i > 0) dispStr += ", ";
					if (isArray)
						dispStr += cmdLineData.CtrlAddr[i].toString() + ((cmdIndex & bitMask) == 0 ? "t" : "c");
					else
						dispStr += cmdLineData.CtrlAddr.toString() + ((cmdIndex & bitMask) == 0 ? "t" : "c");
					bitMask = bitMask << 1;
				}
				thisElement.innerHTML = dispStr;
				break;
			case 1: //signaldyn
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex;
				var isArray = Array.isArray(cmdLineData.CtrlAddr);
				if (isArray)
					thisElement.innerHTML = cmdLineData.CtrlAddr[cmdIndex>>1].toString() + ((cmdIndex & 0x01) == 0 ? "t" : "c");
				else
					thisElement.innerHTML = cmdLineData.CtrlAddr.toString() + ((cmdIndex & 0x01) == 0 ? "t" : "c");
				break;
			case 3: //button
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex; //btnType.indexOf(cmdIndex);
				thisElement.innerHTML = buttonValDispType[cmdIndex];
				break;
			case 5: //block detector
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex;
				var bitMask = 0x01;
				var dispStr = "";
				var numAddr = 1;
				var isArray = Array.isArray(cmdLineData.CtrlAddr);
				if (isArray)
					numAddr = cmdLineData.CtrlAddr.length;
				for (var i = 0; i < numAddr; i++)
				{
					if (i > 0) dispStr += ", ";
					if (isArray)
						dispStr += cmdLineData.CtrlAddr[i].toString() + ((cmdIndex & bitMask) == 0 ? " fr" : " oc");
					else
						dispStr += cmdLineData.CtrlAddr.toString() + ((cmdIndex & bitMask) == 0 ? " fr" : " oc");
					bitMask = bitMask << 1;
				}
				thisElement.innerHTML = dispStr;
				break;
			case 6: //transponder
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex; //trackPwrType.indexOf(cmdIndex);
				thisElement.innerHTML = transponderValDispType[cmdIndex];
				break;
			case 7: //power
				cmdLineData.LEDCmd[cmdIndex].Val = cmdIndex; //trackPwrType.indexOf(cmdIndex);
				thisElement.innerHTML = powerValDispType[cmdIndex];
				break;
			case 8: //constant
				cmdLineData.LEDCmd[cmdIndex].Val = 1;
				thisElement.innerHTML = "On";
				break;
		}
	}
	upperDiv.append(thisElement);

	if (cmdLineData.MultiColor) 
	{
		thisID = "ledseltext" + lineIndex.toString() + "_" + cmdIndex.toString();
		thisText = tfText(lineIndex, cmdIndex, thisID, evtHandler);
		thisText.innerHTML = "Select LED:";
		upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));
		upperDiv.append(thisText);
		upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));
		thisID = "ledselector" + lineIndex.toString() + "_" + cmdIndex.toString();
		thisElement = tfLEDAddrSel(thisElement, lineIndex, thisID, evtHandler, cmdLineData.LEDNums);
		thisElement.setAttribute("cmdline", cmdIndex);
		tfSetCoordinate(thisElement, lineIndex, cmdIndex, 15, thisID);
		upperDiv.append(thisElement);
	}

	var colorArray = [];
	for (var i = 0; i < ledData[workCfg].LEDCols.length; i++)
		colorArray.push(ledData[workCfg].LEDCols[i].Name);

	thisID = "oncoltxt_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisText = tfText(lineIndex, cmdIndex, thisID, evtHandler);
	thisText.innerHTML = "On Color:";
	thisText.setAttribute("cmdline", cmdIndex);
	upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));
	upperDiv.append(thisText);
	upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));
	
	thisID = "oncolsel_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisElement = tfColorSelector(lineIndex, cmdIndex, thisID, evtHandler, colorArray);
	thisElement.setAttribute("cmdline", cmdIndex);
	if (cmdLineData.MultiColor)
		thisElement.selectedIndex = colorArray.indexOf(cmdLineData.LEDCmd[cmdIndex].ColOn[0]);
	else
		thisElement.selectedIndex = colorArray.indexOf(cmdLineData.LEDCmd[cmdIndex].ColOn);
	tfSetCoordinate(thisElement, lineIndex, cmdIndex, 8, thisID);
	upperDiv.append(thisElement);

	thisID = "offcoltxt_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisText = tfText(lineIndex, cmdIndex, thisID, evtHandler);
	thisText.innerHTML = "Off Color:";
	thisText.setAttribute("cmdline", cmdIndex);
	upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));
	upperDiv.append(thisText);
	upperDiv.append(tfTab(lineIndex, cmdIndex, '&nbsp;',""));

//	colorArray.splice(0,0, "none");
	
	thisID = "offcolsel_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisElement = tfColorSelector(lineIndex, cmdIndex, thisID, evtHandler, colorArray);
	thisElement.setAttribute("cmdline", cmdIndex);

	if (cmdLineData.MultiColor)
		thisElement.selectedIndex = colorArray.indexOf(cmdLineData.LEDCmd[cmdIndex].ColOff[0]);
	else
		if (cmdLineData.LEDCmd[cmdIndex].ColOff == undefined)
			thisElement.selectedIndex = -1;
		else
			thisElement.selectedIndex = colorArray.indexOf(cmdLineData.LEDCmd[cmdIndex].ColOff);
	tfSetCoordinate(thisElement, lineIndex, cmdIndex, 9, thisID);
	upperDiv.append(thisElement);

	parentObj.append(upperDiv);
	
	var lowerDiv = document.createElement("div");
	lowerDiv.setAttribute("class", "editorpanel");
	if ((cmdLineData.CtrlSource == "signal") || (cmdLineData.CtrlSource == "analog"))
	{
		var thisSpacer = document.createElement("div");
		thisSpacer.setAttribute("class", "manipulatorbox");
		lowerDiv.append(thisSpacer);
	}
	thisText = tfText(lineIndex, cmdIndex, "", evtHandler);
	thisText.innerHTML = "Mode:&nbsp;";
	lowerDiv.append(thisText);

	thisID = "modesel_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisElement = tfModeSelector(lineIndex, cmdIndex, thisID, evtHandler);
	thisElement.setAttribute("cmdline", cmdIndex);
	if (!Array.isArray(cmdLineData.LEDCmd[cmdIndex].Mode))
	{
		var oldMode = cmdLineData.LEDCmd[cmdIndex].Mode;
		cmdLineData.LEDCmd[cmdIndex].Mode = [];
		cmdLineData.LEDCmd[cmdIndex].Mode.push(oldMode);
	}
	thisElement.selectedIndex = ledModeType.indexOf(cmdLineData.LEDCmd[cmdIndex].Mode[0]);
	tfSetCoordinate(thisElement, lineIndex, cmdIndex, 10, thisID);
	lowerDiv.append(thisElement);

	thisText = tfText(lineIndex, cmdIndex, "", evtHandler);
	thisText.innerHTML = "&nbsp;Rate:&nbsp;";
	lowerDiv.append(thisText);

	thisID = "ratesel_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisElement = tfNumeric(lineIndex, 5, thisID, evtHandler);
	thisElement.setAttribute("cmdline", cmdIndex);
	if (!Array.isArray(cmdLineData.LEDCmd[cmdIndex].Rate))
	{
		var oldRate = cmdLineData.LEDCmd[cmdIndex].Rate;
		cmdLineData.LEDCmd[cmdIndex].Rate = [];
		cmdLineData.LEDCmd[cmdIndex].Rate.push(oldRate);
	}
	thisElement.value = cmdLineData.LEDCmd[cmdIndex].Rate[0];
	tfSetCoordinate(thisElement, lineIndex, cmdIndex, 11, thisID);
	lowerDiv.append(thisElement);

	thisText = tfText(lineIndex, cmdIndex, "", evtHandler);
	thisText.innerHTML = "&nbsp;Transition:&nbsp;";
	lowerDiv.append(thisText);

	thisID = "transitionsel_" + lineIndex.toString() + "_" + cmdIndex.toString();
	thisElement = tfTransitionSelector(lineIndex, cmdIndex, thisID, evtHandler);
	thisElement.setAttribute("cmdline", cmdIndex);
	if (!Array.isArray(cmdLineData.LEDCmd[cmdIndex].Transition))
	{
		var oldTransition = cmdLineData.LEDCmd[cmdIndex].Transition;
		cmdLineData.LEDCmd[cmdIndex].Transition = [];
		cmdLineData.LEDCmd[cmdIndex].Transition.push(oldTransition);
	}
	thisElement.selectedIndex = ledTransitionType.indexOf(cmdLineData.LEDCmd[cmdIndex].Transition[0]);
	tfSetCoordinate(thisElement, lineIndex, cmdIndex, 12, thisID);
	lowerDiv.append(thisElement);

	parentObj.append(lowerDiv);
}

function buildCmdLines(lineIndex, lineData)
{
	var thisLineBase = document.getElementById("ledconfig_inp_" + lineIndex.toString() + "_2");
	while (thisLineBase.hasChildNodes())
		thisLineBase.removeChild(thisLineBase.childNodes[0]); //delete rows
	if (lineData.LEDCmd.length > 0)
		for (var i=0; i<lineData.LEDCmd.length; i++)
		{
			var masterDiv = document.createElement("div");
			masterDiv.setAttribute("class", "mastertile");
			if ((i % 2) == 0) //even
				masterDiv.style.backgroundColor = "#F5F5F5";
			else
				masterDiv.style.backgroundColor = "#D3D3D3";
			var thisID = "master_" + lineIndex.toString() + "_" + i.toString();
			tfSetCoordinate(masterDiv, i, 0, 0, thisID);
			thisLineBase.append(masterDiv);

			thisID = "pos_" + lineIndex.toString() + "_" + i.toString();
			masterDiv.append(tfPos(i, -1, thisID, ""));
			thisID = "cmdbasedata_" + lineIndex.toString() + "_" + i.toString();
			var mainDiv = document.createElement("div");
			mainDiv.setAttribute("class", "editortile");
			tfSetCoordinate(mainDiv, i, 0, 0, thisID);
			masterDiv.append(mainDiv);
			
			createColorSelectField(mainDiv, lineIndex, i, lineData, "setLEDCmdData(this)");
		}
	else
	{
		var mainDiv = document.createElement("div");
		mainDiv.setAttribute("class", "editortile");
		tfSetCoordinate(mainDiv, i, 0, 0, thisID);
		thisLineBase.append(mainDiv);
		var thisId = "cmdbasedata_initadd" + lineIndex.toString();
		var newRB = tfTableStarterBox(lineIndex, -1, thisId, "setLEDCmdData(this)");
		mainDiv.append(newRB);
	}

}

function setLEDBasics(sender)
{
	if (sender.id == "colorseq")
		switch (sender.selectedIndex)
		{
			case 0: ledData[workCfg].ChainParams.ColorSeq = "RGB"; break;
			case 1: ledData[workCfg].ChainParams.ColorSeq = "GRB"; break;
		}
	if (sender.id == "blinkperiod")
		ledData[workCfg].ChainParams.BlinkPeriod = verifyNumber(sender.value, ledData[workCfg].ChainParams.BlinkPeriod);
	if (sender.id == "brightnessaddr")
		ledData[workCfg].ChainParams.Brightness.Addr = verifyNumber(sender.value, ledData[workCfg].ChainParams.Brightness.Addr);
	if (sender.id == "brightnesslevel")
		ledData[workCfg].ChainParams.Brightness.InitLevel = verifyNumber(sender.value/100, ledData[workCfg].ChainParams.Brightness.InitLevel);
	if (sender.id == "cmd0source") ;
	if (sender.id == "cmd0address") ;
	if (sender.id == "cmd0option") ;
	if (sender.id == "cmd0color");


	if (sender.id == "ledblock")
	{
		if (configData[workCfg].Modules[0].LEDPattern != sender.selectedIndex)
		{
			configData[workCfg].Modules[0].LEDPattern = sender.selectedIndex;
			var newLEDDefs = [];
			newLEDDefs.push(JSON.parse(JSON.stringify(ledData[workCfg].LEDDefs[0])));
			if (sender.selectedIndex == 0) //banks to continuous
				for (var i = 0; i < 16; i++)
				{
					newLEDDefs.push(JSON.parse(JSON.stringify(ledData[workCfg].LEDDefs[i+1])));
					newLEDDefs.push(JSON.parse(JSON.stringify(ledData[workCfg].LEDDefs[i+17])));
				}
			else //continuous to banks
			{
				for (var i = 0; i < 16; i++)
					newLEDDefs.push(JSON.parse(JSON.stringify(ledData[workCfg].LEDDefs[(2*i)+1])));
				for (var i = 0; i < 16; i++)
					newLEDDefs.push(JSON.parse(JSON.stringify(ledData[workCfg].LEDDefs[(2*i)+2])));
			}
			for (var i = 0; i < 33; i++)
				newLEDDefs[i].LEDNums = [i];
			ledData[workCfg].LEDDefs = JSON.parse(JSON.stringify(newLEDDefs));
			loadTableData(switchTable, swiCfgData[workCfg].Drivers, btnCfgData[workCfg].Buttons, evtHdlrCfgData[workCfg].ButtonHandler, ledData[workCfg].LEDDefs);
		}
	}
}

function adjustLEDAspectList(ledIndex, numAspects, aspVals)
{
	while (ledData[workCfg].LEDDefs[ledIndex].LEDCmd.length > numAspects)
		ledData[workCfg].LEDDefs[ledIndex].LEDCmd.pop();
	while (ledData[workCfg].LEDDefs[ledIndex].LEDCmd.length < numAspects)
		ledData[workCfg].LEDDefs[ledIndex].LEDCmd.push(JSON.parse(JSON.stringify(newLEDCmdTemplate)));
	for (var i = 0; i < numAspects; i++)
		if (aspVals)
			ledData[workCfg].LEDDefs[ledIndex].LEDCmd[i].Val = aspVals[i].AspVal;
		else
			ledData[workCfg].LEDDefs[ledIndex].LEDCmd[i].Val = i;
}
*/
function runTemplate(sender)
{
	function incrementAddr(thisAddr, incrBy)
	{
		var resArray = [];
		if (Array.isArray(thisAddr))
		{
			for (var i = 0; i < thisAddr.length; i++)
				resArray.push(parseInt(thisAddr[i]) + incrBy);
		}
		else
			if (thisAddr != undefined)
				resArray = thisAddr + incrBy;
		return resArray;
	}
	
	var templId = templateDlg.getAttribute('templchid') - 1;
	var templSwi = JSON.parse(JSON.stringify(swiCfgData[workCfg].Drivers[templId]));
	var templBtn1 = JSON.parse(JSON.stringify(btnCfgData[workCfg].Buttons[2 * templId]));
	var templBtn2 = JSON.parse(JSON.stringify(btnCfgData[workCfg].Buttons[(2 * templId) + 1]));
	var templEvt1 = JSON.parse(JSON.stringify(evtHdlrCfgData[workCfg].ButtonHandler[2 * templId]));
	var templEvt2 = JSON.parse(JSON.stringify(evtHdlrCfgData[workCfg].ButtonHandler[(2 * templId) + 1]));
	var startIndex = Math.min(16, Math.max(1, document.getElementById("startchannel").value));
	var endIndex = Math.max(1, Math.min(16, document.getElementById("endchannel").value));
	var incrSwi =  parseInt(document.getElementById("mainaddrincr").value);
	var incrBtn =  parseInt(document.getElementById("btnaddrincr").value);
//	if ((incrSwi <= 0) || (incrBtn <= 0))
//	{
//		alert("Increment values for switches and buttons must be greater than zero! Please try again");
//		return;
//	}

	updateServoPos = false;
	
	for (var i = startIndex; i <= endIndex; i++)
	{
		swiCfgData[workCfg].Drivers[i-1] = JSON.parse(JSON.stringify(templSwi));
		swiCfgData[workCfg].Drivers[i-1].Addr = incrementAddr(swiCfgData[workCfg].Drivers[i-1].Addr, (i-startIndex) * incrSwi);

		evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)] = JSON.parse(JSON.stringify(templEvt1));
		evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].ButtonNr = templEvt1.ButtonNr == 0 ? 0 : incrementAddr(templEvt1.ButtonNr, (i-startIndex) * incrBtn);
		if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].ButtonNr > 16) evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].ButtonNr = 0;
		if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].ButtonNr < 0) evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].ButtonNr = 0;

		for (var j = 0; j < evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].CtrlCmd.length; j++)
			if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].CtrlCmd[j].CmdList[0] != undefined)
				evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)].CtrlCmd[j].CmdList[0].CtrlAddr = swiCfgData[workCfg].Drivers[i-1].Addr; //+= (i-startIndex) * incrSwi;
		setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, i-1, 0);
		evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1] = JSON.parse(JSON.stringify(templEvt2));
		evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].ButtonNr = templEvt2.ButtonNr == 0 ? 0 : incrementAddr(templEvt2.ButtonNr, (i-startIndex) * incrBtn);
		if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].ButtonNr > 16) evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].ButtonNr = 0;
		if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].ButtonNr < 0) evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].ButtonNr = 0;


		for (var j = 0; j < evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].CtrlCmd.length; j++)
			if (evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].CtrlCmd[j].CmdList[0] != undefined)
				evtHdlrCfgData[workCfg].ButtonHandler[2 * (i-1)+1].CtrlCmd[j].CmdList[0].CtrlAddr = swiCfgData[workCfg].Drivers[i-1].Addr; //+= (i-startIndex) * incrSwi;
		setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, i-1, 1);
	}
	loadTableData(switchTable, swiCfgData[workCfg].Drivers, btnCfgData[workCfg].Buttons, evtHdlrCfgData[workCfg].ButtonHandler, ledData[workCfg].LEDDefs);
	templateDlg.style.display = "none";
	updateServoPos = true;
}

function cancelTemplate(sender)
{
	templateDlg.style.display = "none";
}

function startTemplateDialog(parentObj, templateChannel)
{
	var mainDlg = document.createElement("div");
	mainDlg.setAttribute('class', "modal");
	mainDlg.setAttribute('templchid', templateChannel);
	
		var dlgDiv = document.createElement("div");
		dlgDiv.setAttribute('class', "modal-content");
		mainDlg.append(dlgDiv);
	
			var dlgSubDiv = document.createElement("div");
			dlgSubDiv.setAttribute('class', "modal-header");
			dlgDiv.append(dlgSubDiv);
				var dlgSpan = document.createElement("span");
				dlgSpan.setAttribute('class', "close");
				dlgSpan.innerHTML = "&times;";
				dlgSubDiv.append(dlgSpan);
				var dlgHeader = document.createElement("h2");
				dlgHeader.innerHTML = "Configure Address Assignment, then click Run Template"; 
				dlgSubDiv.append(dlgHeader);
	
			dlgSubDiv = document.createElement("div");
			dlgSubDiv.setAttribute('class', "modal-body");
			dlgDiv.append(dlgSubDiv);
				dlgTextDispArea = document.createElement("div"); //global var
				dlgTextDispArea.setAttribute('readonly', "true");
				dlgTextDispArea.setAttribute('style', "height: 250px; width:100%"); 

				level0Div = document.createElement("div"); //global var
				level0Div.setAttribute('style', "height: 50px; width:100%"); 
				level0Div.setAttribute('id', "temptitle"); 
				level0Div.innerHTML = "Set channel characterstics based on settings of channel #" + templateChannel.toString();
				dlgTextDispArea.append(level0Div);

				level1Div = document.createElement("div"); //global var
				level1Div.setAttribute('style', "height: 50px; width:100%"); 
				dlgTextDispArea.append(level1Div);
				var tempField = createTextInput(level1Div, "tile-1_2", "Run from Channel:", templateChannel.toString(), "startchannel", "");
				tempField = createTextInput(level1Div, "tile-1_2", "to Channel:", Math.min(16, templateChannel+5).toString(), "endchannel", "");

				level2Div = document.createElement("div"); //global var
				level2Div.setAttribute('style', "height: 50px; width:100%"); 
				dlgTextDispArea.append(level2Div);
				createTextInput(level2Div, "tile-1_2", "Increment Servo Control Address by:", "1", "mainaddrincr", "");

				level3Div = document.createElement("div"); //global var
				level3Div.setAttribute('style', "height: 50px; width:100%"); 
				dlgTextDispArea.append(level3Div);
				createTextInput(level3Div, "tile-1_2", "Increment Button Address by:", "2", "btnaddrincr", "");
//				createTextInput(level3Div, "tile-1_2", "Increment Button Event Address by:", "2", "evtaddrincr", "");

/*
				level4Div = document.createElement("div"); //global var
				level4Div.setAttribute('style', "height: 50px; width:100%"); 
				dlgTextDispArea.append(level4Div);
				createButton(level4Div, "", "Run Template", "btnRun", "runTemplate(this)");
				createButton(level4Div, "", "Cancel", "btnCancel", "cancelSettings(this)");
*/

			dlgSubDiv.append(dlgTextDispArea);
			var footerDiv = document.createElement("div");
			footerDiv.setAttribute('class', "modal-footer");
			dlgDiv.append(footerDiv);
			var dlgHeader = document.createElement("div");
				dlgHeader.setAttribute('style', "height: 70px; width:100%"); 
				dlgHeader.innerHTML = "&nbsp;";
				createButton(dlgHeader, "", "Run Template", "btnRun", "runTemplate(this)");
				createButton(dlgHeader, "", "Cancel", "btnCancel", "cancelTemplate(this)");
			footerDiv.append(dlgHeader);

//				dlgHeader.innerHTML = "Thank you for using the IoTT Stick!";
	
	parentObj.append(mainDlg);
	var span = document.getElementsByClassName("close"); //get array of close elements, should only be 1
	span[0].onclick = function() {templateDlg.style.display = "none";}
	return mainDlg;
}

function setServoVal(sender)
{
	if (sender.id == "servominval")
		swiCfgData[workCfg].ServoMinPos = verifyNumber(sender.value, swiCfgData[workCfg].ServoMinPos);
	if (sender.id == "servomaxval")
		swiCfgData[workCfg].ServoMaxPos = verifyNumber(sender.value, swiCfgData[workCfg].ServoMaxPos);
}

function setSwitchData(sender)
{
	var thisRow = parseInt(sender.getAttribute("row"));
	var thisCol = parseInt(sender.getAttribute("col"));
	var thisIndex = parseInt(sender.getAttribute("index"));
//	console.log(thisRow, thisCol, thisIndex);
	switch (thisCol)
	{
		case 1:
			switch (thisIndex)
			{
				case 11: //Event Type
					swiCfgData[workCfg].Drivers[thisRow].CmdSource = sourceOptionArray[sender.selectedIndex];
					adjustSourceSelector(swiCfgData[workCfg].Drivers, thisRow, thisCol);
					setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, thisRow, 0);
					setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, thisRow, 1);
					break;
				case 12: //Address
					var newRes = verifyNumArray(sender.value, ",");
					var srcMode = sourceOptionArray.indexOf(swiCfgData[workCfg].Drivers[thisRow].CmdSource);
					if ([0].indexOf(srcMode) >= 0) //limit the length to 3 for switch
						while (newRes.length > 3)
							newRes.pop();
					else
						while (newRes.length > 1) //limit to one for everything else
							newRes.pop();
					swiCfgData[workCfg].Drivers[thisRow].Addr = newRes; //verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].Addr[0]);
					sender.value = newRes;
					adjustSourceSelector(swiCfgData[workCfg].Drivers, thisRow, thisCol);
					setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, thisRow, 0);
					setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, thisRow, 1);
					break;
				case 13: //select event
					swiCfgData[workCfg].Drivers[thisRow].CurrDisp = sender.selectedIndex;
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					setAddr2Disp(sourceOptionArray.indexOf(swiCfgData[workCfg].Drivers[thisRow].CmdSource), sender.selectedIndex, thisRow, thisCol);
					break;
				case 14: //2nd addr
					var srcMode = sourceOptionArray.indexOf(swiCfgData[workCfg].Drivers[thisRow].CmdSource);
					if ([1].indexOf(srcMode) >= 0) //signal
					{
						var newRes = verifyNumArray(sender.value, ",");
						if ([2,4].indexOf(srcMode) >= 0) //limit the length to 1 for analog and signal aspects
							while (newRes.length > 1)
								newRes.pop();
						if ([1].indexOf(srcMode) >= 0) //for signals, this is the AspVal
							swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal = newRes;
						else
							swiCfgData[workCfg].Drivers[thisRow].CondData = newRes;
						sender.value = newRes;
					}
					if (srcMode == 1) //signal
					{
						var sourceList= document.getElementById("evtcmdlistbox_" + thisRow.toString() + "_" + thisCol.toString());
						if (swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal != undefined)
							if (swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal != 0xFFFF)
								sourceList.options[sourceList.selectedIndex].text = "Aspect " + swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal.toString();
							else
								sourceList.options[sourceList.selectedIndex].text = "Aspect #" + swiCfgData[workCfg].Drivers[thisRow].CurrDisp.toString();
						else
							sourceList.options[sourceList.selectedIndex].text = "Aspect #" + swiCfgData[workCfg].Drivers[thisRow].CurrDisp.toString();
					}
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					adjustSourceSelector(swiCfgData[workCfg].Drivers, thisRow, thisCol);
					break;
				case 15: //New event
					swiCfgData[workCfg].Drivers[thisRow].Positions.splice(swiCfgData[workCfg].Drivers[thisRow].CurrDisp, 0, JSON.parse(JSON.stringify(newEventTemplate)));
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					adjustSourceSelector(swiCfgData[workCfg].Drivers, thisRow, thisCol);
					break;
				case 16: //delete event
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0) //can't delete the last event
					{
						swiCfgData[workCfg].Drivers[thisRow].Positions.splice(swiCfgData[workCfg].Drivers[thisRow].CurrDisp, 1);
						if (swiCfgData[workCfg].Drivers[thisRow].CurrDisp > swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1)
						{
							swiCfgData[workCfg].Drivers[thisRow].CurrDisp = (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1);
							var evtListBox = document.getElementById("evtcmdlistbox_" + thisRow.toString() + "_" + thisCol.toString());
							evtListBox.selectedIndex -= 1;
						}
						dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
//						console.log(swiCfgData[workCfg].Drivers[thisRow]);
						adjustSourceSelector(swiCfgData[workCfg].Drivers, thisRow, thisCol);
					}
					break;
				case 25: //run template
					if (templateDlg ==  null)
						templateDlg = startTemplateDialog(document.getElementById("TabHolder"), thisRow+1);
					else
						level0Div.innerHTML = "Set channel characterstics based on settings of channel #" + (thisRow+1).toString();
					document.getElementById("temptitle").innerHTML = "Set channel characterstics based on settings of channel #" + (thisRow+1).toString();
					document.getElementById("startchannel").value = (thisRow+1).toString();
					document.getElementById("endchannel").value = Math.min(16, thisRow+6).toString();
					templateDlg.setAttribute('templchid', thisRow+1);
					templateDlg.style.display = "block";
					break;
			}
			break;
		case 2:
			switch (thisIndex)
			{
				case 1: //Up Speed
					swiCfgData[workCfg].Drivers[thisRow].UpSpeed = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].UpSpeed);
					break;
				case 2: //Down Speed
					swiCfgData[workCfg].Drivers[thisRow].DownSpeed = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].DownSpeed);
					break;
				case 3: //Accel Rate
					swiCfgData[workCfg].Drivers[thisRow].AccelRate = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].AccelRate);
					break;
				case 4: //Decel rate
					swiCfgData[workCfg].Drivers[thisRow].DecelRate = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].DecelRate);
					break;
				case 5: //Frequency
					swiCfgData[workCfg].Drivers[thisRow].Frequency = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].Frequency);
					break;
				case 6: //Lambda
					swiCfgData[workCfg].Drivers[thisRow].Lambda = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].Lambda);
					break;
				case 7: //use Hesitation
				case 7: //use Hesitation
					swiCfgData[workCfg].Drivers[thisRow].UseHesi = sender.checked;
					break;
				case 8: //Hes Point
					swiCfgData[workCfg].Drivers[thisRow].HesPoint = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].HesPoint);
					break;
				case 9: //Hes Speed
					swiCfgData[workCfg].Drivers[thisRow].HesSpeed = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].HesSpeed);
					break;
				case 10: //use this Aspect
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].Used = sender.checked;
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					break;
				case 11: //Invert direction
					break;
				case 12: //Position slider
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].PosPt = sender.value;
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					break;
				case 13: //Position input
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].PosPt = verifyNumber(sender.value, swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].PosPt);
					dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
					break;
				case 14: //Soft Start
					if (sender.checked)
						swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg |= 0x04;
					else
						swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg &= (~0x04);
					break;
				case 15: //Hard Stop
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg &= (~0x03);
					break;
				case 16: //Soft Stop
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg &= (~0x03);
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg |= 0x01;
					break;
				case 17: //Oscillate
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg &= (~0x03);
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg |= 0x02;
					break;
				case 18: //Bounce Back
					swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].MoveCfg |= 0x03;
					break;
				case 20: //Power Off Move End
					swiCfgData[workCfg].Drivers[thisRow].PowerOff = sender.checked;
					break;
			}
			break;
		case 3: 
//			console.log("Set Input data", thisRow, thisCol, thisIndex);
			var dataRow = (2 * thisRow) + ((thisIndex & 0x100) >> 8);
			var maskIndex = (thisIndex & 0x00FF);
			switch (maskIndex)
			{
				case 10:
					evtHdlrCfgData[workCfg].ButtonHandler[dataRow].ButtonNr = sender.selectedIndex;
//					evtHdlrCfgData[workCfg].ButtonHandler[dataRow].ButtonNr = btnCfgData[workCfg].Buttons[sender.selectedIndex - 1].ButtonAddr);
					break;
				case 11:
//					btnCfgData[workCfg].Buttons[dataRow].currDisp = sender.selectedIndex;
					evtHdlrCfgData[workCfg].ButtonHandler[dataRow].currDisp = sender.selectedIndex;
					setButtonDisplay(evtHdlrCfgData[workCfg].ButtonHandler, thisRow, ((thisIndex & 0x100) >> 8));
					break;
				case 12:
					var evtSource = swiCfgData[workCfg].Drivers[thisRow];
					var btnHdlrData = evtHdlrCfgData[workCfg].ButtonHandler[dataRow]; //.find(evtByAddr);
					if (btnHdlrData)
					{
						var ctrlCmd = btnHdlrData.CtrlCmd[btnHdlrData.currDisp].CmdList[0];
						ctrlCmd.ExecDelay = 0;
						if (sender.selectedIndex > 0)
							if (evtSource.CmdSource == "dccsignal")
								ctrlCmd.CtrlTarget = "signal";
							else
								ctrlCmd.CtrlTarget = "switch";
						else
						{
							ctrlCmd.CtrlTarget = "none";
							ctrlCmd.CtrlType = "none";
							evtHdlrCfgData[workCfg].ButtonHandler[dataRow].CtrlCmd[btnHdlrData.currDisp].CmdList[0] = ctrlCmd;
							return;
						}
						switch (ctrlCmd.CtrlTarget)
						{
							case "switch":
								if (Array.isArray(evtSource.Addr))
									if (evtSource.Addr.length > 1)
									{
										ctrlCmd.CtrlAddr = evtSource.Addr[(sender.selectedIndex - 1)>>1];
										switch ((sender.selectedIndex -1) % 2)
										{
											case 0 : ctrlCmd.CtrlType = "thrown"; break;
											case 1 : ctrlCmd.CtrlType = "closed"; break;
										}
									}
									else
									{
										ctrlCmd.CtrlAddr = evtSource.Addr[0];
										switch (sender.selectedIndex)
										{
											case 1 : ctrlCmd.CtrlType = "thrown"; break;
											case 2 : ctrlCmd.CtrlType = "closed"; break;
											case 3 : ctrlCmd.CtrlType = "toggle"; break;
										}
									}
								else
								{
									ctrlCmd.CtrlAddr = evtSource.Addr;
									switch (sender.selectedIndex)
									{
										case 1 : ctrlCmd.CtrlType = "thrown"; break;
										case 2 : ctrlCmd.CtrlType = "closed"; break;
										case 3 : ctrlCmd.CtrlType = "toggle"; break;
									}
								}
								break;
							case "signal":
								ctrlCmd.CtrlTarget = "signal";
								ctrlCmd.CtrlAddr = evtSource.Addr;
								ctrlCmd.CtrlType = "aspect";
								ctrlCmd.CtrlValue = evtSource.Positions[sender.selectedIndex-1].AspVal;
								break;
						}
						evtHdlrCfgData[workCfg].ButtonHandler[dataRow].CtrlCmd[btnHdlrData.currDisp].CmdList[0] = ctrlCmd;
					}
					
//					console.log(ctrlCmd);
					break;
			}
			break;
	}

}

function setOutputMode(sender, id)
{
	var thisRow = parseInt(sender.id.split('_')[1]);
	var thisOption = parseInt(sender.id.split('_')[3]);
	swiCfgData[workCfg].Drivers[thisRow].DevType = devOptions[thisOption];
	switch (thisOption)
	{
		case 0: //Servo
			swiCfgData[workCfg].Drivers[thisRow].DevOption = 2; //180 Deg
			break;
		case 1: 
			swiCfgData[workCfg].Drivers[thisRow].DevOption = 0; //none
			break;
		case 2: 
			swiCfgData[workCfg].Drivers[thisRow].DevOption = 0; //5V
			break;
	}
	setDefaultData(thisRow, devOptions.indexOf(swiCfgData[workCfg].Drivers[thisRow].DevType), swiCfgData[workCfg].Drivers[thisRow].DevOption);
	dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
}

function setLEDMode(sender, id)
{
	var thisRow = parseInt(sender.id.split('_')[1]);
	var thisOption = parseInt(sender.id.split('_')[3]);
	swiCfgData[workCfg].Drivers[thisRow].DevOption = thisOption;
	setDefaultData(thisRow, devOptions.indexOf(swiCfgData[workCfg].Drivers[thisRow].DevType), swiCfgData[workCfg].Drivers[thisRow].DevOption);
	dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
}

function setServoAngle(sender, id)
{
	var thisRow = parseInt(sender.id.split('_')[1]);
	var thisOption = parseInt(sender.id.split('_')[3]);
	swiCfgData[workCfg].Drivers[thisRow].DevOption = thisOption;
	setDefaultData(thisRow, devOptions.indexOf(swiCfgData[workCfg].Drivers[thisRow].DevType), swiCfgData[workCfg].Drivers[thisRow].DevOption);
	dispSwitchData(swiCfgData[workCfg].Drivers, thisRow);
}

function setDefaultData(thisRow, devType, modeOption)
{
	switch (devType)
	{
		case 0: //servo
			swiCfgData[workCfg].Drivers[thisRow].UpSpeed = 320;
			swiCfgData[workCfg].Drivers[thisRow].DownSpeed = 320;
			swiCfgData[workCfg].Drivers[thisRow].PowerOff = true;
			switch (modeOption)
			{
				case 0:
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
					{
						var incrVal = (swiCfgData[workCfg].ServoMaxPos - swiCfgData[workCfg].ServoMinPos) >> 1;
						if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 2)
							incrVal = Math.trunc(incrVal / (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1));
						for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
						{
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = swiCfgData[workCfg].ServoMinPos + (incrVal * i);
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 5;
						}
					}
					break;
				case 1:
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
					{
						var incrVal = (swiCfgData[workCfg].ServoMaxPos - swiCfgData[workCfg].ServoMinPos) >> 1;
						var startVal = (swiCfgData[workCfg].ServoMinPos + swiCfgData[workCfg].ServoMaxPos) >> 1;
						if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 2)
							incrVal = Math.trunc(incrVal / (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1));
						for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
						{
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = startVal + (incrVal * i);
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 5;
						}
					}
					break;
				case 2:
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
					{
						var incrVal = (swiCfgData[workCfg].ServoMaxPos - swiCfgData[workCfg].ServoMinPos);
						if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 2)
							incrVal = Math.trunc(incrVal / (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1));
						for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
						{
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = swiCfgData[workCfg].ServoMinPos + (incrVal * i);
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 5;
						}
					}
					break;
				case 3:
					break;
			}
			break;
		case 1: //relay
			swiCfgData[workCfg].Drivers[thisRow].UpSpeed = 0;
			swiCfgData[workCfg].Drivers[thisRow].DownSpeed = 0;
			swiCfgData[workCfg].Drivers[thisRow].PowerOff = false;
			if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
			{
				for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
				{
					swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = i == 0? 0 : 4095;
					swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 0;
				}
			}
			break;
		case 2: //led
			swiCfgData[workCfg].Drivers[thisRow].PowerOff = false;
			switch (modeOption)
			{
				case 0:
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
					{
						var incrVal = 4095;
						swiCfgData[workCfg].Drivers[thisRow].UpSpeed = 0;
						swiCfgData[workCfg].Drivers[thisRow].DownSpeed = 0;
						if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 2)
							incrVal = Math.trunc(incrVal / (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1));
						for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
						{
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = incrVal * i;
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 0;
						}
					}
					break;
				case 1:
					if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 0)
					{
						var incrVal = 4095;
						swiCfgData[workCfg].Drivers[thisRow].UpSpeed = 0;
						swiCfgData[workCfg].Drivers[thisRow].DownSpeed = 0;
						if (swiCfgData[workCfg].Drivers[thisRow].Positions.length > 2)
							incrVal = Math.trunc(incrVal / (swiCfgData[workCfg].Drivers[thisRow].Positions.length - 1));
						for (var i = 0; i < swiCfgData[workCfg].Drivers[thisRow].Positions.length; i++)
						{
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].PosPt = 4095 - (incrVal * i);
							swiCfgData[workCfg].Drivers[thisRow].Positions[i].MoveCfg = 0;
						}
					}
					break;
				case 2:
					break;
			}
			break;
	}
}


function dispSwitchData(swiData, thisRow)
{
	var evtSrcBox = document.getElementById("evttypebox_" + thisRow.toString() + "_" + "1");
	evtSrcBox.selectedIndex = sourceOptionArray.indexOf(swiData[thisRow].CmdSource);
	var addrBox = document.getElementById("evtaddressbox_" + thisRow.toString() + "_1");
	addrBox.value = swiData[thisRow].Addr;
//	console.log(swiData[thisRow].CurrDisp);
	adjustSourceSelector(swiData, thisRow, 1);
	document.getElementById("movespeedup_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].UpSpeed;
	document.getElementById("movespeeddown_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].DownSpeed;
	document.getElementById("accel_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].AccelRate;
	document.getElementById("decel_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].DecelRate;
	document.getElementById("pwroff_" + thisRow.toString() + "_" + "2").checked = swiData[thisRow].PowerOff;
	document.getElementById("lambda_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].Lambda;
	document.getElementById("oscfrequ_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].Frequency;
	document.getElementById("hesitate_" + thisRow.toString() + "_" + "2").checked = (swiData[thisRow].UseHesi > 0);
	document.getElementById("hesipoint_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].HesPoint;
	document.getElementById("hesispeed_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].HesSpeed;

	document.getElementById("enableevent_" + thisRow.toString() + "_" + "2").checked = swiData[thisRow].Positions[swiData[thisRow].CurrDisp].Used;
	document.getElementById("aspectpos_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].Positions[swiData[thisRow].CurrDisp].PosPt;
	document.getElementById("posslider_" + thisRow.toString() + "_" + "2").value = swiData[thisRow].Positions[swiData[thisRow].CurrDisp].PosPt;
	writeCBInputField("softaccel_" + thisRow.toString()+ "_2", swiData[thisRow].Positions[swiData[thisRow].CurrDisp].MoveCfg & 0x04);
	writeRBInputField("stopmode_" + thisRow.toString() + "_2", swiData[thisRow].Positions[swiData[thisRow].CurrDisp].MoveCfg & 0x03);

	var devType = devOptions.indexOf(swiCfgData[workCfg].Drivers[thisRow].DevType);
	var devMode = swiCfgData[workCfg].Drivers[thisRow].DevOption;
	writeRBInputField("seldevtype_" + thisRow.toString() + "_" + "2", devType);

	var relayPanel = document.getElementById("relaypanel_" + thisRow.toString() + "_2");
	var ledPanel = document.getElementById("ledpanel_" + thisRow.toString() + "_2");
	var servoMainPanel = document.getElementById("servopanel_" + thisRow.toString() + "_2");
	var servoSpeedPanel = document.getElementById("servospeeddiv_" + thisRow.toString() + "_2");
	var servoAccelPanel = document.getElementById("servoacceldiv_" + thisRow.toString() + "_2");
	var servoOscPanel = document.getElementById("servooscdiv_" + thisRow.toString() + "_2");
	var servoHesiPanel = document.getElementById("servohesidiv_" + thisRow.toString() + "_2");
	var servoMovePanel = document.getElementById("servomovediv_" + thisRow.toString() + "_2");
	var servoStartStopPanel = document.getElementById("servostartstopdiv_" + thisRow.toString() + "_2");
	var posslider = document.getElementById("posslider_" + thisRow.toString() + "_2");

	switch (devType)
	{
		case 0: //Servo
			setVisibility(false, relayPanel);
			setVisibility(false, ledPanel);
			setVisibility(true, servoMainPanel);

			setVisibility(false, servoSpeedPanel);
			setVisibility(false, servoAccelPanel);
			setVisibility(false, servoOscPanel);
			setVisibility(false, servoHesiPanel);
			setVisibility(false, servoMovePanel);
			setVisibility(false, servoStartStopPanel);
			writeRBInputField("servomovetype_" + thisRow.toString() + "_" + "2", devMode);

			posslider.setAttribute("min", swiCfgData[workCfg].ServoMinPos);
			posslider.setAttribute("max", swiCfgData[workCfg].ServoMaxPos);
			
			
			switch (devMode)
			{
				case 0:
					break;
				case 1:
					break;
				case 2:
					break;
				case 3:
					setVisibility(true, servoSpeedPanel);
					setVisibility(true, servoAccelPanel);
					setVisibility(true, servoOscPanel);
					setVisibility(true, servoHesiPanel);
					setVisibility(true, servoMovePanel);
					setVisibility(true, servoStartStopPanel);
					break;
			}
			break;
		case 1:
			setVisibility(true, relayPanel);
			setVisibility(false, ledPanel);
			setVisibility(false, servoMainPanel);
			setVisibility(false, servoSpeedPanel);
			setVisibility(false, servoAccelPanel);
			setVisibility(false, servoOscPanel);
			setVisibility(false, servoHesiPanel);
			setVisibility(false, servoMovePanel);
			setVisibility(false, servoStartStopPanel);
			posslider.setAttribute("min", 0);
			posslider.setAttribute("max", 4095);
			switch (devMode)
			{
				case 0:
					break;
			}
			break;
		case 2: //LED
			setVisibility(false, relayPanel);
			setVisibility(true, ledPanel);
			setVisibility(false, servoMainPanel);
			setVisibility(false, servoSpeedPanel);
			setVisibility(false, servoAccelPanel);
			setVisibility(false, servoOscPanel);
			setVisibility(false, servoHesiPanel);
			setVisibility(false, servoMovePanel);
			setVisibility(false, servoStartStopPanel);
			writeRBInputField("ledtype_" + thisRow.toString() + "_" + "2", devMode);
			posslider.setAttribute("min", 0);
			posslider.setAttribute("max", 4095);
			switch (devMode)
			{
				case 0:
					setVisibility(false, servoMovePanel);
					break;
				case 1:
					setVisibility(false, servoMovePanel);
					break;
				case 2:
					setVisibility(true, servoMovePanel);
					setVisibility(true, servoSpeedPanel);
					break;
			}
			break;
	}


	if (updateServoPos)
		if (swiData[thisRow].Positions[swiData[thisRow].CurrDisp].Used)
			if (updateServoPos)
				setServoPos(thisRow, swiData[thisRow].Positions[swiData[thisRow].CurrDisp].PosPt);
	var enBounce = ((swiData[thisRow].CurrDisp == 0) || (swiData[thisRow].CurrDisp == (swiData[thisRow].Positions.length - 1)));
	setVisibility(enBounce, document.getElementById("stopmode_" + thisRow.toString() + "_" + "2_3"));
	setVisibility(enBounce, document.getElementById("stopmode_" + thisRow.toString() + "_" + "2_tx_3"));
}

function setButtonDisplay(btnEvtArray, thisRow, thisIndex)
{
	if (btnEvtArray)
	{
		var btnHdlrData = btnEvtArray[(2*thisRow) + thisIndex]; 
		var addrField = document.getElementById("btnaddressbox" + thisIndex.toString() + "_" + thisRow.toString() + "_3");
//		console.log(thisIndex, thisRow);
//		console.log("btnaddressbox" + thisIndex.toString() + "_" + thisRow.toString() + "_3");
//		console.log(addrField);
		var targetCmdSel = document.getElementById("cmdlistbox" + thisIndex.toString() + "_" + thisRow.toString() + "_3");
		if (btnHdlrData.currDisp == undefined)
		{
			btnHdlrData.currDisp = 0;
			targetCmdSel.selectedIndex = 0;
//			console.log("Set BtnEvt");
		}
		var evtSelBox = document.getElementById("evtselbox" + thisIndex.toString() + "_" + thisRow.toString() + "_3");
		var evtTypeBox =  document.getElementById("evttypebox_" + thisIndex.toString() + "_" + thisRow.toString() + "_2");
		var evtAddrBox =  document.getElementById("evtaddressbox_" + thisIndex.toString() + "_" + thisRow.toString() + "_2");
		var evtSource = swiCfgData[workCfg].Drivers[thisRow];
		
		addrField.selectedIndex = btnHdlrData.ButtonNr;
		
		if (btnHdlrData.CtrlCmd[btnHdlrData.currDisp] == undefined)
			return;
			
		var ctrlCmd = btnHdlrData.CtrlCmd[btnHdlrData.currDisp].CmdList[0];
		switch (ctrlCmd.CtrlTarget)
		{
			case "switch": 
			{
				var dispStr = ctrlCmd.CtrlAddr.toString() + " ";
				switch (ctrlCmd.CtrlType)
				{
					case "thrown": dispStr += "Th"; break;
					case "closed": dispStr += "Cl"; break;
					case "toggle": dispStr += "toggle"; break;
				}
//				console.log(dispStr);
				for (i = 0; i < evtSelBox.options.length; i++) 
				{
//					console.log(evtSelBox.options[i].text);
					if(evtSelBox.options[i].text == dispStr)
					{
						evtSelBox.selectedIndex = i;
						break;
					}
				}
				break;
			}
			case "signal": 
			{
				var dispStr = "Aspect " + ctrlCmd.CtrlValue.toString();
//				console.log(dispStr);
				for (i = 0; i < evtSelBox.options.length; i++) 
				{
//					console.log(evtSelBox.options[i].text);
					if(evtSelBox.options[i].text == dispStr)
					{
						evtSelBox.selectedIndex = i;
						break;
					}
				}
				break;
			}
			default: evtSelBox.selectedIndex = 0; break;
		}
	}
}


function loadTableData(thisTable, thisSwiData, thisBtnData, thisBtnEvtData, thisLEDData)
{
	if (thisSwiData == undefined)
		return;
	if (thisBtnData == undefined)
		return;
	if (thisBtnEvtData == undefined)
		return;



	var th = document.getElementById(thisTable.id + "_head");
	var tb = document.getElementById(thisTable.id + "_body");
	var numCols = th.childNodes[0].children.length;

	createDataTableLines(thisTable, [tfPos, tfCommandSwiSelector, tfServoEditor, tfButtonEditor], thisSwiData.length, "setSwitchData(this)");
	for (var thisRow=0; thisRow < thisSwiData.length; thisRow++)
	{
		if ((thisSwiData != undefined) && (thisSwiData.length > thisRow))
		{
			if (isNaN(thisSwiData[thisRow].CurrDisp))
				thisSwiData[thisRow].CurrDisp = 0;
			dispSwitchData(thisSwiData, thisRow);
		}
		if (thisBtnEvtData != undefined)
		{
			for (var i=0; i < 2; i++)
				setButtonDisplay(thisBtnEvtData, thisRow, i);
		}
	}
}

function setAddr2Disp(sourceMode, eventMode, thisRow, thisCol)
{
	var addrBox = document.getElementById("parambox_" + thisRow.toString() + "_1");
	var addrField = document.getElementById("address2box_" + thisRow.toString() + "_1");
	var addrText = 	document.getElementById("paramtext_" + thisRow.toString() + "_1");
	var btnAdd = document.getElementById("btn_add_" + thisRow.toString() + "_1");
	var btnCancel = document.getElementById("btn_cancel_" + thisRow.toString() + "_1");
	var srcMode = sourceOptionArray.indexOf(swiCfgData[workCfg].Drivers[thisRow].CmdSource);
	var dispField = false;
	setVisibility(false, btnAdd);
	setVisibility(false, btnCancel);
	switch (sourceMode) //event type
	{
		case 0: //dyn signal
			break;
		case 1: //DCC signal
			dispField = true;  
			setVisibility(true, btnAdd);
			setVisibility(true, btnCancel);
			addrText.innerHTML = "Value:&nbsp;" 
			break; //Signal
	}
	setVisibility(dispField, addrBox);
	if (dispField)
	{
			if (isNaN(swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal))
				addrField.value = "";
			else
				if (swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal == 0xFFFF)
					addrField.value = "";
				else
					addrField.value = swiCfgData[workCfg].Drivers[thisRow].Positions[swiCfgData[workCfg].Drivers[thisRow].CurrDisp].AspVal;
	}
}

function adjustHdlrEventList(ofHandler, newLength)
{
	while (ofHandler.CtrlCmd.length > newLength) 
		ofHandler.CtrlCmd.splice(ofHandler.CtrlCmd.length-1, 1); //remove last element
	while (ofHandler.CtrlCmd.length < newLength) 
		ofHandler.CtrlCmd.push(JSON.parse(JSON.stringify(newEventCmdTemplate)));
//	console.log("Adj Array " + ofHandler.CtrlCmd.length.toString());
	for (var i = 0; i < ofHandler.CtrlCmd.length; i++)
	{
		if (ofHandler.CtrlCmd[i].CmdList.length == 0)
		{
//			console.log("Fix Array");
			ofHandler.CtrlCmd[i].CmdList.push(JSON.parse(JSON.stringify([{"CtrlTarget": "none", "CtrlAddr": 0, "CtrlType":"toggle", "CtrlValue":"on", "ExecDelay":250}])));
		}
	}
	return ofHandler;
}

function adjustEventList(ofSwitch, newLength)
{
	while (ofSwitch.Positions.length > newLength) 
		ofSwitch.Positions.splice(ofSwitch.Positions.length-1, 1); //remove last element
	while (ofSwitch.Positions.length < newLength) 
		ofSwitch.Positions.push(JSON.parse(JSON.stringify(newEventTemplate)));
}

function adjustSourceSelector(thisSwiData, thisRow, thisCol)
{
//	console.log("AdjSrcSel");
	var evtSrcBox = document.getElementById("evttypebox_" + thisRow.toString() + "_" + thisCol.toString());
	var evtListBox = document.getElementById("evtcmdlistbox_" + thisRow.toString() + "_" + thisCol.toString());
//	var btnEvtListBox0 = document.getElementById("cmdlistbox0_" + thisRow.toString() + "_" + thisCol.toString());
//	var btnEvtListBox1 = document.getElementById("cmdlistbox1_" + thisRow.toString() + "_" + thisCol.toString());
//	var oldBtnEvtIndex0 = btnEvtListBox0.selectedIndex;
//	var oldBtnEvtIndex1 = btnEvtListBox0.selectedIndex;
	var oldLength = evtListBox.options.length;
	var btnEvtListBox0 = document.getElementById("evtselbox0_" + thisRow.toString() + "_3");
	var btnEvtListBox1 = document.getElementById("evtselbox1_" + thisRow.toString() + "_3");
	var oldEvtListIndex0 = btnEvtListBox0.selectedIndex;
	var oldEvtListIndex1 = btnEvtListBox1.selectedIndex;
	evtSrcBox.selectedIndex = sourceOptionArray.indexOf(thisSwiData[thisRow].CmdSource);
	var numAddr = swiCfgData[workCfg].Drivers[thisRow].Addr.length;
	var optArray = [];
	var eventMode = evtListBox.selectedIndex; //get old settings
	//set option strings
	switch (evtSrcBox.selectedIndex)
	{
		case 0: //signaldyn
			for (var i = 0; i < numAddr; i ++)
			{
				optArray.push(swiCfgData[workCfg].Drivers[thisRow].Addr[i].toString() + " Th");
				optArray.push(swiCfgData[workCfg].Drivers[thisRow].Addr[i].toString() + " Cl");
			}
			createOptions(evtListBox, optArray); 
			optArray.splice(0,0, "none");
			if (numAddr == 1)
				optArray.push(swiCfgData[workCfg].Drivers[thisRow].Addr[0].toString() + " toggle");
			createOptions(btnEvtListBox0, optArray); 
			createOptions(btnEvtListBox1, optArray); 
			break;
		case 1: //DCC Signal
			var aspCnt = thisSwiData[thisRow].Positions.length;
			if (aspCnt > 0)
				for (var i = 0; i < aspCnt; i++)
				{	
					if (thisSwiData[thisRow].Positions[thisSwiData[thisRow].CurrDisp] != undefined)
						if (thisSwiData[thisRow].Positions[i].AspVal != 0xFFFF)
							optArray.push("Aspect " + thisSwiData[thisRow].Positions[i].AspVal.toString());
						else
							optArray.push("Aspect #" + i.toString());
					else
						optArray.push("Aspect #" + i.toString());
				}
			else
				optArray.push("Aspect");
			createOptions(evtListBox, optArray); 
			optArray.splice(0,0, "none");
			createOptions(btnEvtListBox0, optArray); 
			createOptions(btnEvtListBox1, optArray); 
			break; 
	}
	if (eventMode >= evtListBox.options.length)
		eventMode = 0;
	//adjust length of event list array to new event list
	adjustEventList(thisSwiData[thisRow], evtListBox.options.length);
	if (oldLength != evtListBox.options.length)
		setDefaultData(thisRow, devOptions.indexOf(swiCfgData[workCfg].Drivers[thisRow].DevType), swiCfgData[workCfg].Drivers[thisRow].DevOption);
	//adjust visibility of address box 2
	evtListBox.selectedIndex = eventMode;
	if (oldEvtListIndex0 < optArray.length)
		btnEvtListBox0.selectedIndex = oldEvtListIndex0;
	else
		btnEvtListBox0.selectedIndex = 0;
	if (oldEvtListIndex1 < optArray.length)
		btnEvtListBox1.selectedIndex = oldEvtListIndex1;
	else
		btnEvtListBox1.selectedIndex = 0;


	thisSwiData[thisRow].CurrDisp = eventMode;
	setAddr2Disp(evtSrcBox.selectedIndex, eventMode, thisRow, thisCol);
}

function requestDataFiles()
{
	var moduleData = configData[workCfg].Modules[currDispPage];
//	console.log(subFileIndex);
	ws.send("{\"Cmd\":\"CfgData\", \"Type\":\"" + moduleData.CfgFiles[subFileIndex].ID + "\", \"FileName\":\"" + moduleData.CfgFiles[subFileIndex].FileName+ "\"}");
	subFileIndex++;
	if (subFileIndex < moduleData.CfgFiles.length)
		setTimeout(requestDataFiles, 1500);
}

function constructPageContent(contentTab)
{
	var tempObj;
	mainScrollBox = createEmptyDiv(contentTab, "div", "pagetopicboxscroll-y", "btnconfigdiv");
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h1", "CMMME Prima Setup");
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "useExpertMode");
//			createCheckbox(tempObj, "tile-1_4", "Expert Mode", "cbUseExpertMode", "setExpertMode(this)");

		//Page settings
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h2", "Module Settings");

/*
		//LED Colors
		colorTableDiv = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
		createPageTitle(colorTableDiv, "div", "tile-1", "", "h3", "LED Color Definitions");
		colorTable = createDataTable(colorTableDiv, "tile-1_2", ["Pos","Color Name", "Select Color", "Add/Delete/Move Color"], "colorconfig", "");

		//LED Assignment pair vs group
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h3", "Board Settings");
		generalBox1 = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createDropdownselector(generalBox1, "tile-1_4", "Color Sequence:", ["RGB", "GRB"], "colorseq", "setLEDBasics(this)");
			createDropdownselector(generalBox1, "tile-1_4", "LED Assignment:", ["Continuous", "Blocks"], "ledblock", "setLEDBasics(this)");
		generalBox2 = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createTextInput(generalBox2, "tile-1_4", "System Blink Period:", "n/a", "blinkperiod", "setLEDBasics(this)");
		generalBox3 = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createTextInput(generalBox3, "tile-1_4", "Brightness Ctrl. Addr.:", "n/a", "brightnessaddr", "setLEDBasics(this)");
			createTextInput(generalBox3, "tile-1_4", "Initial Level [0-100%]:", "n/a", "brightnesslevel", "setLEDBasics(this)");

		generalBox4 = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
		createPageTitle(generalBox4, "div", "tile-1", "", "h3", "LED 0 Settings");
		ledDefTable = createDataTable(generalBox4, "tile-1", ["Pos","IF THIS: (LED/Input Selector)", "THEN THAT: (LED Command Sequence Editor)"], "ledconfig", "");

*/


		var generalSettingsDiv = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
		var generalBox4 = createEmptyDiv(generalSettingsDiv, "div", "tile-1", "");
			createTextInput(generalBox4, "tile-1_4", "Servo Min Pos:", "n/a", "servominval", "setServoVal(this)");
			createTextInput(generalBox4, "tile-1_4", "Servo Max Pos:", "n/a", "servomaxval", "setServoVal(this)");
/*
		generalBox5 = createEmptyDiv(generalSettingsDiv, "div", "tile-1", "");
			createDropdownselector(generalBox5, "tile-1_4", "Option:", ["thrown", "closed"], "evtcmdlistbox_", "setLEDBasics(this)");
			createDropdownselector(generalBox5, "tile-1_4", "Color:", ["Color"], "cmd0color", "setLEDBasics(this)");
*/
		//Main Table
		createPageTitle(mainScrollBox, "div", "tile-1", "", "h2", "Channel Settings");
		switchTable = createDataTable(mainScrollBox, "tile-1", ["Pos","IF THIS: (Input Event Selector)", "THEN THAT: Servo Movement", "Input Setup"], "swiconfig", "");

		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createButton(tempObj, "", "Save & Restart", "btnSave", "saveSettings(this)");
			createButton(tempObj, "", "Cancel", "btnCancel", "cancelSettings(this)");
		tempObj = createEmptyDiv(mainScrollBox, "div", "tile-1", "");
			createButton(tempObj, "", "Save to File", "btnDownload", "downloadSettings(this)");
}

function loadNodeDataFields(jsonData)
{
}

function loadDataFields(jsonData)
{
	configData[workCfg] = upgradeJSONVersionGH(jsonData);
	subFileIndex = 0;
	swiCfgData = [{},{},{}];
	btnCfgData = [{},{},{}];
	evtHdlrCfgData = [{},{},{}];
	ledData = [{},{},{}];
	requestDataFiles();
}

function processLocoNetInput(jsonData)
{
}
