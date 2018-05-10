
var Utils = Utils ? Utils : {};
var Ext = Ext ? Ext : {};
Extract.Data[Extract.EntityTypes.Datapoints] = {};
Extract.Data[Extract.EntityTypes.Groups] = {};
Extract.Data[Extract.EntityTypes.InterventionSets] = {};
Extract.Data[Extract.EntityTypes.Interventions] = {};
Extract.Data[Extract.EntityTypes.Outcomes] = {};
Extract.Data[Extract.EntityTypes.OutcomeSets] = {};
Extract.Data[Extract.EntityTypes.OutcomeGroupValues] = {};

Ext.isEmpty = (obj) => {
    if (obj == undefined || obj == null || obj == "") {
        return true;
    } else {
        return false;
    }
}



Utils.tmpMask = {

    mask: null,
    show: function (control, msg) {
        var mask = new Ext.LoadMask(eval(control), {
            setMsgAndShow: function (msg) {
                this.msg = msg;
                //this.msg = msg + "&nbsp;&nbsp;&nbsp;&nbsp;<input type='button' onclick=\"Utils.tmpMask.hide();Ext.Msg.notify('Warning','This will not end your request. Your request will keep processing in the background.');\" style='width:50px;background-color:#fff;border:1px solid #333;' value='Hide'></input>";
                this.show();
                this.setZIndex(10000000);
            }
        });

        mask.setMsgAndShow(msg);
        this.mask = mask;

    },

    hide: function () {

        Utils.tmpMask.mask.destroy();

    }

}


Utils.createEventMaskObj = function (control, msg) {
    var eventMask = { customTarget: control, msg: msg, target: "customtarget", showMask: true };
    return eventMask;
}

Utils.setEventMaskObj = function (eventMask) {
    return eventMask != undefined ? eventMask : { showMask: false };
}

Utils.executeCallback = function (callback) {
    if (typeof (callback) == "function") {
        callback();
    }
}

Utils.getAlphaCharacter = function (position) {
    var Alpha = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

    return Alpha[position - 1];
}

Utils.numberString = function (index) {

    var special = ['Zero', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh', 'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth'];
    var deca = ['Twent', 'Thirt', 'Fourt', 'Fift', 'Sixt', 'Sevent', 'Eight', 'Ninet'];


    if (index < 20) return special[index];
    if (index % 10 === 0) return deca[Math.floor(index / 10) - 2] + 'ieth';
    return deca[Math.floor(index / 10) - 2] + 'y-' + special[index % 10];
}


Utils.copyObjects = function (source, target) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
}


Utils.ConcateNosPer = function (nos, per) {
    var vl = '';
    //vl = nos != '' ? (nos + '#') : '';
    //vl += per != '' ? (vl != '' ? per + '%' : per + '%') : '';

    vl = !Ext.isEmpty(nos) ? nos : '';
    vl += ((!Ext.isEmpty(per)) ? "(" + per + ")" : '');

    return vl.trim();
}


Utils.prevUniqueId = "";
Utils.getUniqueId = function () {
    while (true) {
        var dt = new Date();
        var id = "ext-data-" + dt.getUTCDate() + dt.getUTCMonth() + dt.getUTCHours() + dt.getUTCMinutes() + dt.getUTCSeconds() + dt.getMilliseconds();
        if (id != Utils.prevUniqueId) {
            Utils.prevUniqueId = id;
            //console.log(id);
            return id;
        }
    }
}


Utils.getRowwiseDPCount = function (dpList) {
    var cnt = 0;
    var rowWiseDPCnt = 0;
    for (var i = 0; i < dpList.length; i++) {
        if (cnt != dpList[i].Row && cnt < dpList[i].Row) {
            cnt = dpList[i].Row;
            rowWiseDPCnt++;
        }
    }
    return rowWiseDPCnt; //cnt;
}

Utils.getRowwiseDPCountArray = function (dpList) {
    var cnt = [];
    //var rowWiseDPCnt = 0;
    for (var i = 0; i < dpList.length; i++) {
        if (cnt.indexOf(dpList[i].Row) == -1) {
            cnt.push(dpList[i].Row);
            //rowWiseDPCnt++;
        }
    }
    return cnt; //cnt;
}

Utils.rowwiseDPList = function (dpList) {
    var rowwiseDPList = [];

    if (!Ext.isEmpty(dpList)) {
        var cnt = Utils.getRowwiseDPCountArray(dpList);

        var rowNo = dpList[0].Row;

        for (var i = 0; i < cnt.length; i++) {
            var dps = $.grep(dpList, function (e) { return e.Row == cnt[i] });
            rowwiseDPList.push(dps);
        }
    }
    return rowwiseDPList;
}

//Utils.getColumnwiseDPCount = function (dpList) {
//    var cnt = 0;
//    for (var i = 0; i < dpList.length; i++) {
//        if (cnt != dpList[i].Row && cnt < dpList[i].Row) {
//            cnt = dpList[i].Row;
//        }
//    }
//    return cnt;
//}

Utils.addNoOfSpace = function (noOfSpace) {
    var str = '';
    for (var i = 0; i < noOfSpace; i++) {
        str += '&nbsp;';
    }
    return str;
}

Utils.typeof = function getClass(obj) {
    if (typeof obj === "undefined")
        return "undefined";
    if (obj === null)
        return "null";
    return Object.prototype.toString.call(obj)
        .match(/^\[object\s(.*)\]$/)[1];
}


Utils.isReadOnly = function () {
    return typeof objTextParsing == typeof undefined ? true : objTextParsing.isReadOnly;
}


Utils.envVariable = "";

Utils.parseQueryString = function pdfViewParseQueryString(location) {

    var query = location.search.substring(1);

    var parts = query.split('&');
    var params = {};
    for (var i = 0, ii = parts.length; i < parts.length; ++i) {
        var param = parts[i].split('=');
        var key = param[0];
        var value = param.length > 1 ? param[1] : null;
        params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return params;
}

Utils.parseHashQueryString = function pdfViewParseQueryString(hasData) {
    var parts = hasData.split('&');
    var params = {};
    for (var i = 0, ii = parts.length; i < parts.length; ++i) {
        var param = parts[i].split('=');
        var key = param[0];
        var value = param.length > 1 ? param[1] : null;
        params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
    return params;
}

Utils.getOffsetTop = function (Elem) {
    var offsetTop = 0;
    do {
        if (!isNaN(Elem.offsetTop)) {
            offsetTop += Elem.offsetTop;
        }
    } while (Elem = Elem.offsetParent);
    return offsetTop;
}


Utils.getOffsetLeft = function (Elem) {
    var offsetLeft = 0;
    do {
        if (!isNaN(Elem.offsetLeft)) {
            offsetLeft += Elem.offsetLeft;
        }
    } while (Elem = Elem.offsetParent);
    return offsetLeft;
},

    Utils.DownloadDocument = function (downloadurl) {
        Ext.get('frameDownload').dom.src = downloadurl;
    }

Utils.getBaseURL = function () {
    var baseUrl = "";
    if (document.URL.indexOf("localhost") != -1) {
        baseUrl = document.location.protocol + "//localhost:27837";
    }
    else if (document.URL.indexOf("192.168.1.9") != -1) {
        baseUrl = document.location.protocol + "//192.168.1.9:27837";
    }
    else if (document.URL.indexOf("extracttraining") != -1) {
        baseUrl = document.location.protocol + "//extractservicestraining.doctorevidence.com";
    }
    else if (document.URL.indexOf("extractstaging") != -1) {
        baseUrl = document.location.protocol + "//extractservicesstaging.doctorevidence.com";
    }
    else if (document.URL.indexOf("extracttest") != -1) {
        baseUrl = document.location.protocol + "//extractservicestest.doctorevidence.com";
    }
    else if (document.URL.indexOf("extract") != -1) {
        baseUrl = document.location.protocol + "//extractservices.doctorevidence.com";
    }
    return baseUrl;
}

Utils.btnLoginClick = function (username, password) {
    var bURL = Utils.getBaseURL();
    DM.validateUser(username, password, document.URL, {
        success: function (responseData) {
            var resData = responseData;
            if (!Ext.isEmpty(resData)) {
                $.ajax({
                    url: bURL + "/auth/credentials",
                    type: "POST",
                    dataType: "json",
                    data: { "username": username, "password": password },
                    responseType: "json",
                    //async: false,
                    //contentType: "application/json",
                    timeout: 3600000,
                    xhrFields: { withCredentials: true },
                    success: function (response) {
                        if (!Ext.isEmpty(resData.Roles)) {
                            if (resData.Roles.indexOf("ExtractAdmin") != -1 || resData.Roles.indexOf("ML") != -1 || resData.Roles.indexOf("TeamLead") != -1 || resData.Roles.indexOf("TrainingAdmin") != -1)
                                window.location = "../Home/ChildContent";
                            //else if (resData.Roles.indexOf("DataExtractor") != -1 || resData.Roles.indexOf("ExtractQC") != -1 || resData.Roles.indexOf("ExtractTrainee") != -1 || resData.Roles.indexOf("Intern") != -1)
                            else if (resData.Roles.length > 0) { //code added by Sohel on 6th Nov 2017 #4701
                                window.location = "../PdfExtractor/ParsedPage/EndUserDashboard.aspx";
                            }
                        }
                        console.log(response);
                    },
                    error: function (response) {
                        console.log(response);
                    }
                });
            }
        }
    });
}

Utils.isDebugMode = function () {

    if (document.URL.indexOf("localhost") != -1 || document.URL.indexOf("extractstaging") != -1) {
        return true;
    }
    return false;
}


Utils.getEnvironmentVariable = function () {

    //var envVariable = "/undoTest/reference/newformat/";
    var envVariable = "/staging/";

    if (document.URL.indexOf("localhost") != -1) {
        envVariable = "/localhost/";
    }
    else if (document.URL.indexOf("extractstaging") != -1) {
        envVariable = "/staging/";
    }
    else if (document.URL.indexOf("extracttraining") != -1) {
        envVariable = "/training/";
    }
    else if (document.URL.indexOf("extracttest") != -1) {
        envVariable = "/extracttest/";
    }
    else if (document.URL.indexOf("extract") != -1) {
        envVariable = "/production/";
    }

    return envVariable;
}

Utils.getDBPath = function (refId, taskId) {

    if (Ext.isEmpty(taskId))
        taskId = Extract.taskId;
    if (Ext.isEmpty(refId))
        refId = Extract.studyId;

    if (refId == "BlankTemplateTextData")
        return "/" + refId;
    //return "/undoTest/reference/newformat/" + refId ;

    //return "/undoTest/reference/newformat/" + refId + "/" + taskId;
    return Utils.getEnvironmentVariable() + refId + "/" + taskId;
}

Utils.setDBPath = function (refId, type, id) {
    return Utils.getDBPath(refId) + "/" + type + "/" + id;
}

Utils.getUndoDBPath = function (refId, id) {
    return Utils.getDBPath(refId) + "/undodata/" + id;
}

Utils.getSourcePath = function (refId, type, typeId, sourceName) {

    if (type == Extract.EntityTypes.StudyLevel) {
        return Utils.getDBPath(refId) + "/" + type + "/" + sourceName;
    }
    return Utils.getDBPath(refId) + "/" + type + "/" + typeId + "/Sources/" + sourceName;
}

Utils.getArrayObjectPath = function (refId, type, typeId, objectName, length) {

    if (Ext.isEmpty(length))
        return Utils.getDBPath(refId) + "/" + type + "/" + typeId + "/" + objectName;
    else
        return Utils.getDBPath(refId) + "/" + type + "/" + typeId + "/" + objectName + "/" + length;
}

Utils.getMigrationPath = function (refId, taskId) {
    return "/undoTest/reference/" + refId + "/" + taskId;
}

Utils.getTimestamp = function () {
    return Date.now();
}

Utils.getHighlightPath = function (refId, type, dpId, objId) {

    return Utils.getDBPath(refId) + "/" + type + "/" + dpId + "/" + objId;
}

Utils.getHighlightDeletePath = function (refId, type, dpId) {

    return Utils.getDBPath(refId) + "/" + type + "/" + dpId;
}

Utils.getDeleteEntityPath = function (refId, type) {

    return Utils.getDBPath(refId) + "/" + type;
}

Utils.getUserEmail = function () {
    return CurrentUserEmail ? CurrentUserEmail : top.CurrentUserEmail;
}

Utils.getFRLocationPath = function (refId, type, typeId, locationFieldName, sourceName) {
    return Utils.getDBPath(refId) + "/" + type + "/" + typeId + "/" + locationFieldName + "/" + sourceName;
}

Utils.isReadOnly = function () {
    return typeof objTextParsing == typeof undefined ? true : objTextParsing.isReadOnly;
}


Utils.saveToFirebaseBackup = function (referenceId, taskId, isFinalized) {

    //var envVariable = "/undoTest/reference/newformat/";
    var envVariable = "localhost";

    if (document.URL.indexOf("localhost") != -1) {
        envVariable = "localhost";
    }
    else if (document.URL.indexOf("extractstaging") != -1) {
        envVariable = "staging";
    }
    else if (document.URL.indexOf("extracttraining") != -1) {
        envVariable = "training";
    }
    else if (document.URL.indexOf("extracttest") != -1) {
        envVariable = "extracttest";
    }
    else if (document.URL.indexOf("extract") != -1) {
        envVariable = "production";
    }

    fetch("https://us-central1-docextract-38175.cloudfunctions.net/saveBackupFile",
        {
            method: "POST", body: JSON.stringify({ domain: envVariable, referenceId: referenceId, taskId: taskId, isFinalized: isFinalized })
        }
    ).then((response) => { console.log(response) }).catch((error) => { console.log(error); })
}

Utils.getUndoDBPathForCopy = function (refId, taskId, callbackgetData) {
    return Utils.getDBPath(refId, taskId) + "/undodata";
}

Utils.getFirebaseBackup = function (referenceId, taskId, callbackgetData, objData) {

    //var envVariable = "/undoTest/reference/newformat/";
    var envVariable = "localhost";

    if (document.URL.indexOf("localhost") != -1) {
        envVariable = "localhost";
    }
    else if (document.URL.indexOf("extractstaging") != -1) {
        envVariable = "staging";
    }
    else if (document.URL.indexOf("extracttraining") != -1) {
        envVariable = "training";
    }
    else if (document.URL.indexOf("extracttest") != -1) {
        envVariable = "extracttest";
    }
    else if (document.URL.indexOf("extract") != -1) {
        envVariable = "production";
    }
    if (envVariable == "training") {
        fetch(`https://us-central1-docextract-38175.cloudfunctions.net/listBackupFilesByRefId?domain=${envVariable}&referenceId=${referenceId}`).then((response) => { return response.json() }).then((files) => {
            var params = {};
            params["data"] = objData;
            callbackgetData(files, params);
        }).catch((error) => { debugger; });
    } else {
        fetch(`https://us-central1-docextract-38175.cloudfunctions.net/listBackupFiles?domain=${envVariable}&referenceId=${referenceId}&taskId=${taskId}`).then((response) => { return response.json() }).then((files) => {
            var params = {};
            params["data"] = objData;
            callbackgetData(files, params);
        }).catch((error) => { debugger; });
    }
}
Utils.restoreBackup = function (isFirebase, referenceId, taskId, filepath, filename, callbackgetData) {

    var domain = "localhost";

    if (document.URL.indexOf("localhost") != -1) {
        domain = "localhost";
    }
    else if (document.URL.indexOf("extractstaging") != -1) {
        domain = "staging";
    }
    else if (document.URL.indexOf("extracttraining") != -1) {
        domain = "training";
    }
    else if (document.URL.indexOf("extracttest") != -1) {
        domain = "extracttest";
    }
    else if (document.URL.indexOf("extract") != -1) {
        domain = "production";
    }

    fetch(`https://us-central1-docextract-38175.cloudfunctions.net/restoreExtractData`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain, referenceId: referenceId, taskId: taskId, fileName: filename, filePath: filepath, isFirebase: isFirebase })
    }).then((response) => {
        callbackgetData(response);
        console.log(response);
    }).catch((error) => {
        console.error(error);
    })
}
Utils.getTaskIdByRefId = function (refid) {
    var refTask = {
        62837: 33752,
        165102: 36549,
        165126: 33757,
        165146: 33572,
        165177: 33510,
        165187: 33573,
        165909: 36550,
        166057: 33760,
        166572: 33851,
        166596: 36551,
        166610: 33574,
        166611: 36552,
        167211: 33246,
        167222: 36553,
        167263: 36554,
        167415: 36555,
        167533: 36556,
        168015: 36557,
        168136: 36558,
        168143: 33708,
        168146: 36559,
        168152: 36560,
        168239: 36561,
        168253: 33801,
        168257: 33803,
        176782: 36562,
        201300: 36563,
        353089: 36564,
        354842: 33583,
        509828: 36565,
        765184: 33195,
        765188: 36566,
        766919: 33774,
        767230: 36567,
        767505: 33398,
        767653: 33818,
        767796: 36568,
        926441: 36569,
        926443: 36570,
        926445: 36571,
        926453: 36572,
        926461: 33197,
        926470: 33249,
        926473: 33849,
        926486: 33198,
        926489: 33853,
        926511: 33528,
        926525: 33199,
        926526: 36573,
        926533: 33798,
        926554: 33256,
        926556: 33529,
        926561: 33369,
        926564: 33207,
        926565: 33208,
        926568: 36574,
        926579: 33751,
        1202741: 36575,
        1202755: 33211,
        1719368: 33226,
        1719438: 33531,
        1852021: 36576,
        1852470: 33621,
        1852503: 36577,
        1852515: 33746,
        1852522: 33535,
        1852550: 33623,
        1852583: 33626,
        1853011: 33639,
        1888937: 33560,
        1888971: 36578,
        1888992: 36579,
        1889005: 33638,
        1891616: 36580,
        1893797: 33720,
        2273898: 36581,
        2273899: 36582,
        2273900: 36583,
        2273903: 36584,
        2273904: 36585,
        2281655: 36586,
        2281656: 36587,
        2281657: 36588
    }
    var taskid = 0;
    if (refTask[refid]) {
        taskid = refTask[refid];
    }
    return taskid;
}
Utils.updatedExcelDataToFirebase = function (dataList) {

    dataList.forEach(function (item) {
        var refId = item["refid"];
        var taskId = item["taskid"];
        var jsonData = item["jsonData"];

        ////Convert data and set for Extract.studyId        
        //var convertedData = Extract.Helper.convertToNewFormat(studyData);

        //Update data to path
        //refId = 4915;
        //taskId = 6589;
        var path = Utils.getDBPath(refId, taskId);

        //changed the branch name to localhost for testing (in firebase)
        path = path.replace("staging", "extracttest");
        path = path.replace("localhost", "extracttest");
        path = path.replace("training", "extracttest");
        path = path.replace("production", "extracttest");
        //path = path.replace("extracttest", "localhost");
        console.log(`Request created for ${path}`);
        firebase.database().ref(path).set(jsonData);
        //Extract.Core.updateToPath(path, jsonData);
    });
}
