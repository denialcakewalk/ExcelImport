
var Extract = Extract ? Extract : {}
Extract.Data = {};
Extract.studyId = "";
Extract.taskId;
Extract.statusUpdated = false;

Extract.Core = {


    //openStudy: function (studyId, taskId, path) {
    openStudy: function (studyId, taskId, path, uiCallback, failure) {

        return new Promise(function (fulfill, reject) {
            ////using static reference no.
            //if (!studyId)
            //    studyId = 12345;

            if (studyId != "BlankTemplateTextData") {
                Extract.studyId = studyId;
                Extract.taskId = taskId;
            }

            var dbpath = Utils.getDBPath(studyId, taskId);
            console.log('dbpath : ' + dbpath);
            //Check migration path before proceeding
            if (path == "migration") {
                var dbpath = Utils.getMigrationPath(Extract.studyId, Extract.taskId);
                console.log('dbpath2 : ' + dbpath);
            }
            firebase.database().ref(dbpath).once('value', function (snapshot) {
                Extract.Data = snapshot.val();

                if (Extract.Data == null || Extract.Data == "" || Extract.Data == "{}") {
                    return reject();
                }

                if (Extract.Data && Extract.Data.StudyLevel && Ext.isObject(Extract.Data.StudyLevel.Study_Type)) {
                    Extract.Data.StudyLevel.Study_Type = Object.values(Extract.Data.StudyLevel.Study_Type);
                }
                return fulfill(snapshot.val());

            });

        }).catch(function (response, uiCallback) {
            console.log('promise called');
            //if (failure)
            //    failure(response, uiCallback);
        });
    },

    getUndoData: function (type, id) {
        var undoDbPath = Utils.getUndoDBPath(Extract.studyId, id);
        firebase.database().ref(undoDbPath).once('value', function (snapshot) {
            return fulfill(snapshot.val());
        });
    },

    getEntity: function (type, id, data) {
        //return Extract.Helper["get" + type + "ById"](id);
        if (data) {
            if (data[type] && data[type][id])
                return data[type][id];
        }
        if (Extract.Data[type])
            return Extract.Data[type][id];
        return undefined;
    },

    //updated entity data in db
    setEntity: function (type, id, obj, callback, failure, mode) {

        try {
            //if (Utils.isReadOnly()) {
            //    return;
            //}

            ////Generate id if empty
            //if (Ext.isEmpty(id))
            //    id = Utils.getUniqueId();;

            //var updateDbPath = Utils.setDBPath(Extract.studyId, type, id);

            //obj.timestamp = Utils.getTimestamp();

            ////obj.uid = firebase.auth().getUid();

            ////obj.uid = "amit@cakewalk.in"; //change the userid to get user email dynamically
            //obj.uid = Utils.getUserEmail();


            //var prevVal = Extract.Helper.prevVal(id, type);
            //var prevValForUndo = Ext.decode(Ext.encode(prevVal));

            //if (mode == "delete")
            //    obj.isDeleted = true;

            //var keyToUpdate = "";

            //if (Object.keys(obj).length > 0)
            //    keyToUpdate = Object.keys(obj)[0];

            ////updated because of :https://github.com/DoctorEvidence/DocExtract/issues/5278#issuecomment-356353632 on 10 Jan 2018 (its updated data on flag click cell click etc..)
            ////if (prevVal === obj){
            ////    return;
            ////}


            //if (prevVal && Object.keys(obj).length <= 3) {
            //    var key = Object.keys(obj)[0];
            //    if (key) { //if key is null
            //        if (prevVal[key] != undefined && (prevVal[key] == obj[key] || prevVal[key].toString() == obj[key].toString()) && mode != "delete") {
            //            return;
            //        }
            //    }
            //}

            //var isStudyLoading = false;
            //if (!Ext.isEmpty(Extract.Helper.isStudyLoading)) {
            //    isStudyLoading = Ext.decode(Ext.encode(Extract.Helper.isStudyLoading));
            //    if (prevVal && isStudyLoading == false && (prevVal[key] == obj[key]) && !Extract.statusUpdated) { isStudyLoading = true;}
            //} 

            //firebase.database().ref(updateDbPath).update(obj,
            //    function () {

            //        if (!Ext.isEmpty(prevVal)) {

            //            var diff = (obj.timestamp - prevVal.timestamp) / 1000;

            //            if (diff > 30) {

            //                //write add to undo.
            //                Extract.Core.setUndoData(Extract.studyId, id, prevValForUndo, keyToUpdate);
            //            }
            //            //write undo code here from cloud function.
            //            Extract.Core.afterSuccessUpdateEntity(prevVal, obj);
            //        }
            //        else if (mode != "delete") {

            if (!Extract.Data[type]) {
                Extract.Data[type] = {};
            }
            if (!Extract.Data[type][id]) {
                Extract.Data[type][id] = obj;
            }
            //        }

            //        //reverted due to issue
            //        if (!Extract.statusUpdated && objTextParsing.isFormLoad == false && isStudyLoading == false)                    
            //        {
            //            Extract.statusUpdated = true;
            //            objTextParsing.SaveStudyStatus(2, false, false, false); // 2 = InProgress (set status on keyPress)
            //            console.log("Status Inprogress");
            //        }

            //        if (callback) {
            //            callback();
            //        }
            //    });
        } catch (e) {
            console.error(e);
        }
    },

    //used to push id in array
    pushDataToPath: function (updateDbPath, obj) {

        if (Utils.isReadOnly()) {
            return;
        }

        //firebase.database().ref(updateDbPath).push(obj);
        firebase.database().ref(updateDbPath).set(obj);

    },

    //For now used to update propertySets fields, left, right, source
    //used to delete datapoints and some other object permanently 
    updateToPath: function (updatePath, obj) {

        if (Utils.isReadOnly()) {
            return;
        }

        firebase.database().ref(updatePath).update(obj);

        //Discuss with Amit and add undo code here on update.
    },

    setUndoData: function (refId, id, obj, keyToUpdate) {

        var undoDbPath = Utils.getUndoDBPath(refId, id);

        //what data you want to add in undo data
        //var undoObj = { timestamp: obj.timestamp, uid: obj.uid, Value: obj.Value };
        var undoObj = { timestamp: obj.timestamp, uid: obj.uid };

        if (!Ext.isEmpty(keyToUpdate))
            undoObj[keyToUpdate] = obj[keyToUpdate];

        //Extract.Core.pushDataToPath(undoDbPath, undoObj);
        firebase.database().ref(undoDbPath).push(undoObj);
    },

    deleteEntity: function (type, id, obj, callback, failure) {

        if (Utils.isReadOnly()) {
            return;
        }

        Extract.Core.setEntity(type, id, obj, callback, failure, 'delete');
        if (callback) {
            callback();
        }
    },

    afterSuccessUpdateEntity: function (oldObj, newObj) {

        if (Ext.isEmpty(oldObj))
            return;

        for (var key in newObj) {
            oldObj[key] = newObj[key];
        }
    },

    //delete id from array of given path
    deleteIdFromEntity: function (path, dpId) {

        if (Utils.isReadOnly()) {
            return;
        }

        //firebase.database().ref(path).remove(dpId);
        firebase.database().ref(path).once("value", function (snapshot) {
            snapshot.forEach(function (itemSnapshot) {
                if (itemSnapshot.val() == dpId)
                    itemSnapshot.ref.remove();
            });
        });
    },

    deleteObjectFromPath: function (type, typeId) {

        if (Utils.isReadOnly()) {
            return;
        }

        var timestamp = Utils.getTimestamp();
        var prevVal = Extract.Helper.prevVal(typeId, type);

        if (Ext.isEmpty(prevVal))
            return;

        var dbPath = Utils.setDBPath(Extract.studyId, type, typeId);

        firebase.database().ref(dbPath).remove(function () {

            var diff = (timestamp - prevVal.timestamp) / 1000;

            if (diff > 30) {

                //write add to undo.
                var undoDbPath = Utils.getUndoDBPath(Extract.studyId, typeId);
                //what data you want to add in undo data
                var undoObj = { timestamp: prevVal.timestamp, uid: prevVal.uid, Name: prevVal.Name, Value: prevVal.Value, IsDeleted: true };
                Extract.Core.pushDataToPath(undoDbPath, undoObj);
            }
            Extract.Helper.deleteObjectFromEntity(type, typeId);
        });
    },

    copyData: function (fromRefId, fromTaskId, toRefId, toTaskId, callback) {

        var dbpath = Utils.getDBPath(fromRefId, fromTaskId);
        console.log('dbpath : ' + dbpath);

        firebase.database().ref(dbpath).once('value', function (snapshot) {
            var dataToUpdate = snapshot.val();

            if (dataToUpdate == null || dataToUpdate == "" || dataToUpdate == "{}") {
                console.log("No data found for" + fromRefId + " - " + fromTaskId);
                dataToUpdate = [];
            }

            var updateDbPath = Utils.getDBPath(toRefId, toTaskId);
            updateDbPath = updateDbPath.replace("/" + toTaskId, "");

            var obj = {};
            obj[toTaskId] = dataToUpdate;

            firebase.database().ref(updateDbPath).update(obj, function (snapshotData) {
                console.log("Data updated for : " + fromRefId + " - " + toTaskId);

                if (callback)
                    callback();
            });

        });
    },

    getStudyData: function (refId, taskId, callback) {

        var dbpath = Utils.getDBPath(refId, taskId);

        firebase.database().ref(dbpath).once('value', function (snapshot) {
            var dataToUpdate = snapshot.val();

            if (dataToUpdate == null || dataToUpdate == "" || dataToUpdate == "{}") {
                console.log("No data found for" + fromRefId + " - " + fromTaskId);
                dataToUpdate = {};
            }

            if (callback) {
                callback(dataToUpdate);
            }

        });

    },
    getUndoData: function (refId, taskId, callback) {
        var undoDbPath = Utils.getUndoDBPathForCopy(refId, taskId);
        firebase.database().ref(undoDbPath).once('value', function (snapshot) {
            if (callback) {
                callback(snapshot.val());
            }
        });
    },

    Suppport: {

        getUnitLabelStudies: function (domain, unitLabelText, count, references, result) {
            domain = domain.replace(/[^\w\s]/gi, "");

            return new Promise(function (fulfill, reject) {
                debugger;
                fetch("https://us-central1-docextract-38175.cloudfunctions.net/getUnitLabelStudies",
                {
                    method: "POST", body: JSON.stringify({ domain: domain, unitLabels: unitLabelText, count: count, references: references, result: result })
                }).then(function (_response) {

                    return _response.json();
                }).then(function (res) {
                    debugger;
                    return fulfill(res);
                }).catch(function (err) {
                    console.log(err);
                });

            }).catch(function (response, uiCallback) {
                console.log('promise called3');
            });

        },

        mergeUnitLabels: function (domain, arrUnitLabels) {

            return new Promise(function (fulfill, reject) {
                debugger;
                fetch("https://us-central1-docextract-38175.cloudfunctions.net/mergeUnitLabels",
                {
                    method: "POST", body: JSON.stringify({ domain: domain, arrUnitLabels: arrUnitLabels })
                }).then(function (_response) {

                    return _response.json();
                }).then(function (res) {
                    debugger;
                    return fulfill(res);
                }).catch(function (err) {
                    console.log(err);
                });

            }).catch(function (response, uiCallback) {
                console.log('promise called');
            });

        },

        getUnitLabels: function (domain, unitLabelText, count, references, result, callback) {
            domain = domain.replace(/[^\w\s]/gi, "");
            if (count == 0) {

                fetch("https://docextract-38175.firebaseio.com/" + domain + ".json?shallow=true").then(function (_response) {
                    return _response.json();
                }).then(function (res) {
                    for (var refId in res) {
                        references.push(refId);
                        Con.Support.ManageSupport.arrData.push(refId);
                    }
                    Extract.Core.Suppport.processStudies(domain, unitLabelText, count, references, result, callback);
                }).catch(function (err) {
                    console.log(err);
                });
            }
            else {
                if (count < references.length) {
                    Extract.Core.Suppport.processStudies(domain, unitLabelText, count, references, result, callback);
                }
                else {
                    callback(result);
                }

            }

        },

        processStudies: function (domain, unitLabelText, count, references, result, callback) {
            var dataRef = firebase.database().ref(domain), start = 0, end = 0;
            if (references.length - count > 50) {
                start = references[count].toString();
                end = references[count + 49].toString();
            }
            else {
                start = references[count].toString();
                end = references[references.length - 1].toString();
            }



            return dataRef.orderByKey().startAt(start).endAt(end).once('value').then(function (data) {
                var _data = data.val();
                if (_data != null) {
                    var totalMatchedCount = [];
                    var referenceKeys = Object.keys(_data);
                    if (referenceKeys && referenceKeys.length > 0) {
                        for (var i = 0; i < referenceKeys.length; i++) {
                            var isTaskDone = false;
                            var referenceKey = referenceKeys[i];
                            var taskIds = Object.keys(_data[referenceKey]);
                            if (taskIds && taskIds.length > 0) {
                                for (var j = 0; j < taskIds.length; j++) {
                                    var taskId = taskIds[j];
                                    var task = _data[referenceKey][taskId];
                                    if (task.hasOwnProperty("Datapoints")) {
                                        var datapointKeys = Object.keys(task["Datapoints"]);

                                        if (datapointKeys && datapointKeys.length > 0) {
                                            isTaskDone = false;
                                            for (var k = 0; k < datapointKeys.length; k++) {
                                                var datapointKey = datapointKeys[k];
                                                var datapoint = task.Datapoints[datapointKey];
                                                if (datapoint != undefined && datapoint != null) {
                                                    if (datapoint.hasOwnProperty("Name") && datapoint.hasOwnProperty("Value")) {
                                                        if ((datapoint.Name == "QUnitLabel" || datapoint.Name == "UnitLabel") && datapoint.Value != "") {
                                                            if (unitLabelText.includes(datapoint.Value.trim())) {
                                                                totalMatchedCount.push({
                                                                    refId: referenceKey,
                                                                    taskId: taskId,
                                                                    unitLabel: datapoint.Value
                                                                });
                                                                isTaskDone = true;
                                                            }
                                                        }
                                                    }
                                                }
                                                if (isTaskDone) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        result.push(totalMatchedCount);
                        count += 50;
                        Extract.Core.Suppport.getUnitLabels(domain, unitLabelText, count, references, result, callback);
                        // res.status(200).send({data: totalMatchedCount}).end();
                        // return fulfill(totalMatchedCount);
                    }
                }
                else {
                    // res.status(201).send({ data: [] }).end();
                }
            });
        },

        mergeUnitLabelUpdateInRange: function (domain, arrUnitLabels, count, callback) {
            domain = domain.replace(/[^\w\s]/gi, "");
            if (count < arrUnitLabels.arrDeleted.length) {
                Extract.Core.Suppport.mergeUnitLabelUpdateIndividual(domain, arrUnitLabels, count, callback);
            }
            else {
                callback({});
            }
        },

        mergeUnitLabelUpdateIndividual: function (domain, arrUnitLabels, count, callback) {


            var arrDeletedUnitLabels = arrUnitLabels.arrDeleted.map(function (obj) {
                return obj.unitLabel
            });

            var insteadUnitLabel = arrUnitLabels.arrInstead.map(function (obj) {
                return obj.unitLabel
            })[0];

            var ref = arrUnitLabels.arrDeleted[count];
            var path = domain + "/" + ref.refId + "/" + ref.taskId + "/Datapoints";
            var dataRef = firebase.database().ref(path);

            return dataRef.once('value').then(function (data) {
                var _data = data.val();
                if (_data != null) {

                    for (var key in _data) {
                        var datapoint = _data[key];
                        if (datapoint != undefined && datapoint != null) {
                            if (datapoint.hasOwnProperty("Name") && datapoint.hasOwnProperty("Value")) {
                                if ((datapoint.Name == "QUnitLabel" || datapoint.Name == "UnitLabel") && datapoint.Value != "") {
                                    if (arrDeletedUnitLabels.includes(datapoint.Value.trim())) {
                                        var path = domain + "/" + ref.refId + "/" + ref.taskId + "/Datapoints/" + key + "/";

                                        firebase.database().ref(path).update({ "Value": insteadUnitLabel },
                                                                          function () {
                                                                              console.log("Unit Label Changed in RefId" + ref.refId + " TaskId " + ref.taskId);
                                                                          });
                                    }
                                }
                            }
                        }
                    }

                    count++;
                    Extract.Core.Suppport.mergeUnitLabelUpdateInRange(domain, arrUnitLabels, count, callback);
                }
                else {
                    count++;
                    Extract.Core.Suppport.mergeUnitLabelUpdateInRange(domain, arrUnitLabels, count, callback);
                }
            });

        },

    },

    Training: {
        copyStudyFromAnother: function (domain, refId, oldTaskId, newTaskIds) {

            return new Promise(function (fulfill, reject) {
                debugger;
                fetch("https://us-central1-docextract-38175.cloudfunctions.net/copyStudyFromAnother",
                {
                    method: "POST", body: JSON.stringify({ domain: domain, refId: refId, oldTaskId: oldTaskId, newTaskIds: newTaskIds })
                }).then(function (_response) {

                    return _response.json();
                }).then(function (res) {
                    debugger;
                    return fulfill(res);
                }).catch(function (err) {
                    console.log(err);
                });

            }).catch(function (response, uiCallback) {
                console.log('promise called');
            });

        }
    }

}