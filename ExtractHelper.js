/// <reference path="../Core/ExtractCore.js" />
/// <reference path="../Analytics/ExtractCreate.js" />


var Extract = Extract ? Extract : {}

Extract.EntityTypes = {
    Datapoints: "Datapoints",
    Groups: "Groups",
    GroupName: "GroupName",
    InterventionSets: "InterventionSets",
    Interventions: "Interventions",
    Phases: "Phases",
    Outcomes: "Outcomes",
    OutcomeSets: "OutcomeSets",
    OutcomeGroupValues: "OutcomeGroupValues",
    PropertySets: "PropertySets",
    StudyLevel: "StudyLevel",
    FieldValues: "FieldValues",
    Highlights: "Highlights",
    WarningReports: "WarningReports",
    Participants: "Participants",
    Notes: "Notes",
    WarningDismissReports: "WarningDismissReports",
    Others: "Others"
}

Extract.Helper = {

    isStudyLoading: true,

    //studyId is referenceId

    getStudyData: function (studyId, taskId, callback) {
        var me = this;

        //code for InProgress on key press if Study status is Imported or Assigned.
        window.setTimeout(function () {
            if (objTextParsing != undefined) {
                //if (objTextParsing.status != "Imported" && objTextParsing.status != "Assigned") {
                //    Extract.statusUpdated = true;
                //}
            }
        }, 1600);

        //Extract.Core.openStudy(studyId, taskId).then(function (res) {
        Extract.Core.openStudy(studyId, taskId, "", callback, me.onGetStudyDataFailure).then(function (res) {

            Extract.Data = res;

            if (Extract.Data == null || Extract.Data.toString() == "{}") {
                return me.getStudyDataForEmptyTemplateOrSqlDb(studyId, taskId, callback);
            }
            else {
                if (callback)
                    callback();
            }
        });
        //Extract.Core.openStudy(studyId, taskId, "", callback, me.onGetStudyDataSuccess, me.onGetStudyDataFailure);
    },

    onGetStudyDataFailure: function (response, callback) {
        var me = Extract.Helper;
        return me.getStudyDataForEmptyTemplateOrSqlDb(Extract.studyId, Extract.taskId, callback);
    },

    getFinalStudyData: function (studyId, taskId, callback) {
        var me = this;
        return me.getTextDataFromFirebase(studyId, taskId, me.afterSuccessGetFinalStudyData, callback);
    },


    afterSuccessGetFinalStudyData: function (response, extraParam) {
        var me = Extract.Helper;
        var data = JSON.parse(response);

        if (data != null && data != "" && typeof data != "object") {
            try {
                data = JSON.parse(data);
            }
            catch (exc) {
                console.log(exc);
            }
        }

        if (data == null || data == "") {
            Extract.Core.openStudy("BlankTemplateTextData").then(function (res) {

                // Extract.Data = res;

                //  me.convertToNewFormatAndPost(res);
                var convertedData = me.convertToNewFormat(studyData);

                //Update data to path
                Extract.Core.updateToPath(Utils.getDBPath(Extract.studyId, Extract.taskId), convertedData);

                if (extraParam.callbackParent)
                    extraParam.callbackParent(convertedData);
                // return convertedData;
            });
        }
        else {
            var studyData = JSON.parse(data[0]); //study data

            //push highlightdata 
            if (data[1] && data[1] != "")
                studyData.push({ type: "Highlights", data: JSON.parse(data[1]) });

            //Data returned from sql server, so update it with permanet migration functions, then convert to new format
            studyData = me.ImportFunctions.updateStudyWithPermanentMigration(studyData);

            // Extract.Helper.convertToNewFormatAndPost(studyData);

            var convertedData = me.convertToNewFormat(studyData);

            //Update data to path
            Extract.Core.updateToPath(Utils.getDBPath(Extract.studyId, Extract.taskId), convertedData);

            if (extraParam.callbackParent)
                extraParam.callbackParent(convertedData);
            //return convertedData;
        }

        console.log("After Success Get Text Data From Firebase");
    },

    getStudyDataForEmptyTemplateOrSqlDb: function (studyId, taskId, callback) {
        var me = this;
        return me.getTextDataFromFirebase(studyId, taskId, me.afterSuccessGetTextDataFromFirebase, callback);
    },

    getTextDataFromFirebase: function (studyId, taskId, callBack, callbackParent) {
        var objService = {};
        var objData = {};
        objData.studyId = studyId;
        objData.taskId = taskId;

        objService.type = Request.Common.getTextDataFromFirebase.type.GET;
        objService.url = Request.Common.getTextDataFromFirebase.url;

        objService.data = objData;

        var params = new setParameters(objService);
        var extraParam = {};
        extraParam.callbackParent = callbackParent;

        Request.Service.executeService(params, callBack, extraParam);
    },

    afterSuccessGetTextDataFromFirebase: function (response, extraParam) {
        var me = Extract.Helper;
        var data = JSON.parse(response);

        if (data != null && data != "" && typeof data != "object") {
            try {
                data = JSON.parse(data);
            }
            catch (exc) {
                console.log(exc);
            }
        }

        if (data == null || data == "") {
            Extract.Core.openStudy("BlankTemplateTextData").then(function (res) {

                Extract.Data = res;

                me.convertToNewFormatAndPost(Extract.Data);

                if (extraParam.callbackParent)
                    extraParam.callbackParent();
            });
        }
        else {
            var studyData = JSON.parse(data[0]); //study data

            //push highlightdata 
            if (data[1] && data[1] != "")
                studyData.push({ type: "Highlights", data: JSON.parse(data[1]) });

            //Data returned from sql server, so update it with permanet migration functions, then convert to new format
            studyData = me.ImportFunctions.updateStudyWithPermanentMigration(studyData);

            Extract.Helper.convertToNewFormatAndPost(studyData);

            if (extraParam.callbackParent)
                extraParam.callbackParent();
        }

        console.log("After Success Get Text Data From Firebase");
    },

    //Convert study data to new format and post to firebase
    convertToNewFormatAndPost: function (studyData) {
        var me = this;
        Extract.Data = studyData;

        //Convert data and set for Extract.studyId        
        var convertedData = me.convertToNewFormat(studyData);

        //Update data to path
        Extract.Core.updateToPath(Utils.getDBPath(Extract.studyId, Extract.taskId), convertedData);

        Extract.Data = convertedData;
    },

    convertToNewFormat: function (studyData) {
        var me = Extract.Helper;
        var studyObj = {};
        studyObj.oldData = studyData;

        var studyLevelData = me.getObjectFromName(studyData, Extract.EntityTypes.StudyLevel);
        var groupData = me.getObjectFromName(studyData, Extract.EntityTypes.Groups);
        var outcomeData = me.getObjectFromName(studyData, Extract.EntityTypes.Outcomes);
        var phaseData = me.getObjectFromName(studyData, Extract.EntityTypes.Phases);
        var propertySetsData = me.getObjectFromName(studyData, Extract.EntityTypes.PropertySets);
        var highlighData = me.getObjectFromName(studyData, Extract.EntityTypes.Highlights);
        var notesData = me.getObjectFromName(studyData, Extract.EntityTypes.Notes);
        var WarningDismissData = me.getObjectFromName(studyData, Extract.EntityTypes.WarningDismissReports);
        var WarningReportsData = me.getObjectFromName(studyData, Extract.EntityTypes.WarningReports);


        studyObj.root = {};
        studyObj.Groups = {};
        studyObj.InterventionSets = {};
        studyObj.Interventions = {};
        studyObj.Outcomes = {};
        studyObj.OutcomeSets = {};
        studyObj.OutcomeGroupValues = {};
        studyObj.PropertySets = {};
        studyObj.FieldValues = {};
        studyObj.Phases = {};
        studyObj.StudyLevel = {};
        studyObj.Highlights = {};
        studyObj.Notes = {};
        studyObj.WarningReports = {};
        studyObj.WarningDismissReports = {};

        //init root
        if (studyObj.oldData) {
            studyObj.oldData.forEach(function (item) {
                studyObj.root[item.type] = {};
            })
        }

        studyObj.Datapoints = {};
        if (studyLevelData.data) {
            studyLevelData.data.forEach(function (item) {
                if (item.sourcename) {
                    studyObj.StudyLevel[item.sourcename] = [];
                    if (item.Datapoints) {
                        item.Datapoints.forEach(function (dp) {
                            if (dp.id) {
                                me.setUniqueId(dp, studyObj);
                                dp.SourceName = item.sourcename;
                                dp.SourceType = "StudyLevel";
                                if (["Study_Setting_Location_Type", "Study_Setting_Type", "Study_Setting_Total_Rows"].indexOf(dp.SourceName) > -1 && ["n/% or Avg", "Misc"].indexOf(dp.Name) > -1) {
                                    if (dp.Value instanceof Array && dp.Value.length > 0) {
                                        var arrftypeid = [];
                                        dp.Value.forEach(function (item) {
                                            item.id = Utils.getUniqueId();
                                            item.SourceName = dp.SourceName;
                                            if (arrftypeid.indexOf(item.id) == -1) {
                                                arrftypeid.push(item.id);
                                                //console.log(item);
                                            }
                                            studyObj.FieldValues[item.id] = item;
                                            //delete item.id;
                                        });
                                        dp.Value = arrftypeid;
                                    }
                                }
                                // if have frequencyt report then location 
                                if (item.sourcename == "Frequency_Report") {
                                    if (dp["Location"]) {
                                        var arrLocation = dp["Location"];
                                        // dp["Location"] = {}; // Make location empty to add new property of sourcename as array 
                                        arrLocation.forEach(function (Location) {
                                            dp["Location"][Location.sourcename] = [];
                                            Location.Datapoints.forEach(function (locDp) {
                                                if (locDp.id) {
                                                    // Add sourcename to Location DP
                                                    locDp.sourcename = Location.sourcename;
                                                    dp["Location"][Location.sourcename].push(locDp.id);
                                                    studyObj.Datapoints[locDp.id] = locDp;
                                                }
                                            });
                                        });
                                    }
                                }
                                if (item.sourcename) {
                                    studyObj.Datapoints[dp.id] = dp;
                                    studyObj.StudyLevel[item.sourcename].push(dp.id);
                                }
                                //delete dp.id;
                            }
                        })

                    }
                }
            });
        }

        // Group Data
        studyObj.root[groupData.type] = [];

        if (groupData.data) {
            groupData.data.forEach(function (group, index) {
                me.setUniqueId(group, studyObj);
                studyObj.root[groupData.type].push(group.id);
                var _grpObj = {
                    id: group.id,
                    name: group.name,
                    GroupType: group.GroupType,
                    Type: group.Type,
                    Sources: {},
                    InterventionSets: [],
                    Participants: [],
                    index: index,
                    displayName: group.displayName
                };
                group.Participants.forEach(function (item) {
                    if (item.id) {
                        _grpObj.Participants.push(item.id);
                        item.SourceName = "Participants";
                        studyObj.Datapoints[item.id] = item;
                    }
                });

                if (group.Sources) {
                    group.Sources.forEach(function (item) {
                        if (item.sourcename) {
                            _grpObj.Sources[item.sourcename] = [];

                            if (item.Datapoints) {
                                item.Datapoints.forEach(function (dp) {
                                    me.setUniqueId(dp, studyObj);
                                    if (dp.id) {
                                        dp.SourceName = item.sourcename;
                                        dp.SourceType = "Groups";
                                        if (item.sourcename == "Arm_Population_Age" && dp.Name == "Age Field Value") {
                                            if (dp.Value instanceof Array && dp.Value.length > 0) {
                                                var arrftypeid = [];
                                                dp.Value.forEach(function (item) {
                                                    item.id = Utils.getUniqueId();
                                                    item.SourceName = "AgeFieldValue"
                                                    if (arrftypeid.indexOf(item.id) == -1) {
                                                        arrftypeid.push(item.id);
                                                        console.log(item);
                                                    }
                                                    studyObj.FieldValues[item.id] = item;
                                                    // delete item.id;
                                                });
                                                dp.Value = arrftypeid;
                                            }
                                        }
                                        if (item.sourcename) {
                                            studyObj.Datapoints[dp.id] = dp;
                                            _grpObj.Sources[item.sourcename].push(dp.id);
                                            //delete dp.id;
                                        }
                                    }
                                })
                            }
                        }
                    })
                }
                studyObj[groupData.type][group.id] = _grpObj;
                //delete _grpObj.id;

                var _intSets = group.InterventionSets;
                if (_intSets) {
                    _intSets.forEach(function (iSet) {
                        me.setUniqueId(iSet, studyObj);
                        _grpObj.InterventionSets.push(iSet.id);
                        var _iSetObj = {
                            id: iSet.id,
                            name: iSet.name,
                            groupId: iSet.groupId,
                            caseNo: iSet.caseNo,
                            Sources: {},
                            Interventions: []
                        };
                        if (iSet.Sources) {
                            iSet.Sources.forEach(function (iSet_item) {
                                if (iSet_item.sourcename != "") {
                                    _iSetObj.Sources[iSet_item.sourcename] = [];
                                    if (iSet_item.Datapoints) {
                                        iSet_item.Datapoints.forEach(function (dp) {
                                            if (dp.id) {
                                                me.setUniqueId(dp, studyObj);
                                                dp.SourceName = iSet_item.sourcename;
                                                dp.SourceType = "InterventionSets";
                                                studyObj.Datapoints[dp.id] = dp;


                                                _iSetObj.Sources[iSet_item.sourcename].push(dp.id);
                                                //delete dp.id;
                                            }
                                        })
                                    }
                                }
                            })
                        }
                        studyObj["InterventionSets"][_iSetObj.id] = _iSetObj;
                        //delete _iSetObj.id;


                        var _intrv = iSet.Interventions;
                        if (_intrv) {
                            _intrv.forEach(function (intrv) {
                                me.setUniqueId(intrv, studyObj);
                                _iSetObj.Interventions.push(intrv.id);
                                var _intObj = {
                                    id: intrv.id,
                                    groupId: iSet.groupId,
                                    intervSetId: iSet.id,
                                    phaseid: intrv.phaseid,
                                    Sources: {}
                                };
                                if (intrv.Sources) {
                                    intrv.Sources.forEach(function (intrv_item) {
                                        _intObj.Sources[intrv_item.sourcename] = [];
                                        if (intrv_item.sourcename != "") {
                                            if (intrv_item.Datapoints) {
                                                intrv_item.Datapoints.forEach(function (dp) {
                                                    if (dp.id) {
                                                        me.setUniqueId(dp, studyObj);
                                                        dp.SourceName = intrv_item.sourcename;
                                                        dp.SourceType = "Interventions";
                                                        if (intrv_item.sourcename == "Dosage" && dp.Name == "Dosage Field Value") {
                                                            if (dp.Value instanceof Array && dp.Value.length > 0) {
                                                                var arrftypeid = [];
                                                                dp.Value.forEach(function (item) {
                                                                    item.id = Utils.getUniqueId();
                                                                    item.SourceName = "DosageFieldValue";
                                                                    if (arrftypeid.indexOf(item.id) == -1) {
                                                                        arrftypeid.push(item.id);
                                                                        //console.log(item);
                                                                    }
                                                                    studyObj.FieldValues[item.id] = item;
                                                                    //delete item.id;
                                                                });
                                                                dp.Value = arrftypeid;
                                                            }
                                                        }
                                                        if (intrv_item.sourcename) {
                                                            studyObj.Datapoints[dp.id] = dp;
                                                            _intObj.Sources[intrv_item.sourcename].push(dp.id);
                                                            //delete dp.id;
                                                        }
                                                    }
                                                })
                                            }
                                        }

                                    })
                                }
                                studyObj["Interventions"][_intObj.id] = _intObj;
                                //delete _intObj.id;
                            });
                        }
                    });
                }
            });
        }

        // Outcome Data        
        studyObj.root[outcomeData.type] = [];
        if (outcomeData.data) {
            outcomeData.data.forEach(function (outcome, index) {
                me.setUniqueId(outcome, studyObj);
                studyObj.root[outcomeData.type].push(outcome.id);  // Outcomes in Array
                outcome.SourceName = outcomeData.type;

                outcome.sources = {};
                outcome.outcomesets = [];

                if (outcome.Sources) {
                    outcome.Sources.forEach(function (sourceItem) {
                        outcome.sources[sourceItem.sourcename] = [];
                        if (sourceItem.Datapoints) {
                            sourceItem.Datapoints.forEach(function (dp) {
                                me.setUniqueId(dp, studyObj);
                                if (dp.id) {
                                    outcome.sources[sourceItem.sourcename].push(dp.id);
                                    dp.SourceName = sourceItem.sourcename;
                                    dp.SourceType = "Outcomes";
                                    studyObj.Datapoints[dp.id] = dp;
                                    //delete dp.id;
                                }
                            });
                        }
                    });
                }
                outcome.Sources = outcome.sources;
                delete outcome.sources; // Remove object
                // OutcomeSets
                if (outcome.OutcomeSets) {
                    outcome.OutcomeSets.forEach(function (oset) {
                        var oldOsetId = Ext.decode(Ext.encode(oset.id));
                        me.setUniqueId(oset, studyObj);
                        outcome.outcomesets.push(oset.id);
                        oset.SourceName = 'OutcomeSets';
                        studyObj.OutcomeSets[oset.id] = oset;
                        var newOsetId = oset.id;
                        if (oldOsetId != oset.id) {
                            //update propertysets data for new OutcomeSet Id
                            me.updatePropertySetAssociatedWitOutcomeSet(outcome.id, oldOsetId, newOsetId, propertySetsData);
                        }
                        //delete oset.id;

                        //Sources
                        oset.sources = {};
                        if (oset.Sources) {
                            oset.Sources.forEach(function (osetSource) {
                                if (osetSource.sourcename) {
                                    oset.sources[osetSource.sourcename] = []

                                    if (osetSource.Datapoints) {
                                        osetSource.Datapoints.forEach(function (dp) {
                                            me.setUniqueId(dp, studyObj);
                                            if (dp.id) {
                                                oset.sources[osetSource.sourcename].push(dp.id);
                                                dp.SourceName = osetSource.sourcename;
                                                dp.SourceType = "OutcomeSets";
                                                studyObj.Datapoints[dp.id] = dp;
                                                //delete dp.id;
                                            }
                                        });
                                    }
                                }
                            });
                        }
                        oset.Sources = oset.sources;
                        delete oset.sources;
                        //Group values
                        oset.outcomegroupvalues = [];
                        if (oset.OutcomeGroupValues) {
                            oset.OutcomeGroupValues.forEach(function (ogv, ogvIndex) {
                                me.setUniqueId(ogv, studyObj);
                                oset.outcomegroupvalues.push(ogv.id);
                                oset.SourceName = 'OutcomeSets';
                                // Outcome group value sources
                                ogv.sources = {};
                                if (ogv.Sources) {
                                    ogv.Sources.forEach(function (ogvSource) {
                                        if (ogvSource.sourcename) {
                                            ogv.sources[ogvSource.sourcename] = [];

                                            if (ogvSource.Datapoints) {
                                                ogvSource.Datapoints.forEach(function (dp) {
                                                    if (dp.id) {
                                                        me.setUniqueId(dp, studyObj);
                                                        ogv.sources[ogvSource.sourcename].push(dp.id);
                                                        ogv.SourceName = 'OutcomeGroupValues';
                                                        dp.SourceName = ogvSource.sourcename;
                                                        dp.SourceType = "OutcomeGroupValues";

                                                        var arrid = [];
                                                        if (dp.Name == "FieldValue") {
                                                            if (dp.Value instanceof Array && dp.Value.length > 0) {
                                                                //console.log(dp)

                                                                dp.Value.forEach(function (item) {
                                                                    item.id = Utils.getUniqueId();
                                                                    item.SourceName = "OutcomeGroupFieldValue"
                                                                    if (arrid.indexOf(item.id) == -1) {
                                                                        arrid.push(item.id);
                                                                        //console.log(item)
                                                                    }
                                                                    studyObj.FieldValues[item.id] = item;
                                                                    //delete item.id;
                                                                });
                                                                dp.Value = arrid;
                                                            }
                                                        }

                                                        studyObj.Datapoints[dp.id] = dp;
                                                        // delete dp.id;
                                                    }
                                                });
                                            }
                                        }
                                    });
                                }
                                ogv.Sources = ogv.sources;
                                ogv.index = ogvIndex;
                                delete ogv.sources;
                                studyObj.OutcomeGroupValues[ogv.id] = ogv;
                                //delete ogv.id;
                            });
                        }
                        oset.OutcomeGroupValues = oset.outcomegroupvalues
                        delete oset.outcomegroupvalues; // Remove object
                    });
                }
                outcome.OutcomeSets = outcome.outcomesets;
                delete outcome.outcomesets; // Remove object
                outcome.index = index;
                studyObj[outcomeData.type][outcome.id] = outcome;
                //delete outcome.id;
            })
        }

        // PropertySets
        studyObj.root[propertySetsData.type] = [];
        if (propertySetsData.data) {
            propertySetsData.data.forEach(function (pSet) {
                me.setUniqueId(pSet, studyObj);
                studyObj.root[propertySetsData.type].push(pSet.id);
                pSet.SourceName = propertySetsData.type;
                pSet.sources = {};
                if (pSet.Sources) {
                    pSet.Sources.forEach(function (sourceItem) {
                        if (sourceItem.sourcename) {
                            pSet.sources[sourceItem.sourcename] = [];
                            if (sourceItem.Datapoints) {
                                sourceItem.Datapoints.forEach(function (dp) {
                                    if (dp.id) {
                                        me.setUniqueId(dp, studyObj);
                                        pSet.sources[sourceItem.sourcename].push(dp.id);
                                        dp.SourceName = sourceItem.sourcename;
                                        dp.SourceType = "PropertySets";
                                        studyObj.Datapoints[dp.id] = dp;
                                        //delete dp.id;
                                    }
                                });
                            }
                        }
                    });
                }
                pSet.Sources = pSet.sources;
                delete pSet.sources; // Remove object


                studyObj[propertySetsData.type][pSet.id] = pSet;
                //delete pSet.id;
            })
        }
        //Phases
        studyObj.root[phaseData.type] = [];
        if (phaseData.data) {
            phaseData.data.forEach(function (phase, index) {
                phase.index = index;
                me.setUniqueId(phase, studyObj);
                if (phase.id) {
                    studyObj.root[phaseData.type].push(phase.id);

                    if (phase.hasOwnProperty('fieldTypeValue')) {
                        if (phase.fieldTypeValue instanceof Array && phase.fieldTypeValue.length > 0) {
                            var arrftypeid = [];
                            phase.fieldTypeValue.forEach(function (item) {
                                item.id = Utils.getUniqueId();
                                item.SourceName = "PhaseFieldValue"
                                if (arrftypeid.indexOf(item.id) == -1) {
                                    arrftypeid.push(item.id);
                                    console.log(item)
                                }
                                studyObj.FieldValues[item.id] = item;

                                //delete item.id;
                            });
                            phase.fieldTypeValue = arrftypeid;
                        }
                    }
                    studyObj[phaseData.type][phase.id] = phase;
                    //delete phase.id;   
                }
            });
        }
        //studyObj.root[studyData.type] = [];

        //for (var i = 0; i < studyData.data.length; i++) {
        //   var dpObj = studyData.data[i];
        //   studyObj.root[studyData.type].push(dpObj.id);
        //   studyObj.Datapoints[dpObj.id] = dpObj;
        //}

        // Highlights
        if (highlighData.data) {
            highlighData.data.forEach(function (hItem) {
                var obj = {};
                hItem.highlightData.forEach(function (hData) {
                    if (hData) {
                        hData.propType = hItem.propType;
                        obj[hData.highlightid] = hData;
                    }
                });
                if (hItem.entityId) {
                    studyObj[highlighData.type][hItem.entityId] = obj;
                }
            });
        }

        //Notes
        if (notesData.data) {
            notesData.data.forEach(function (noteItem) {
                studyObj[notesData.type][noteItem.id] = noteItem;
            });
        }
        // Warning Reports data
        if (WarningReportsData && WarningReportsData.data) {
            WarningReportsData.data.forEach(function (WarningReport) {
                var warningId = Utils.getUniqueId();
                studyObj[WarningReportsData.type][warningId] = WarningReport;
            });
        }

        // Warning Dismiss data
        if (WarningDismissData && WarningDismissData.data) {
            WarningDismissData.data.forEach(function (WarningDismiss) {
                var warningId = Utils.getUniqueId();
                studyObj[WarningDismissData.type][warningId] = WarningDismiss;
            });
        }
        //replace all undefined values with empty string, as undefined will not be updated in firebase and it will give and error on save
        studyObj = JSON.parse(JSON.stringify(studyObj).replace(/undefined/g, ''));

        return studyObj;
    },
    isUniqueId: function (id, studyObj) {
        var ret = true;
        var isBreak = false;
        Object.keys(studyObj).forEach(function (sKey) {
            if (sKey != "root" && sKey != "oldData") {
                Object.keys(studyObj[sKey]).forEach(function (key) {
                    if (key == id) {
                        ret = false;
                        isBreak = true;
                        return;
                    }
                });
            }
            if (isBreak) {
                isBreak = false;
                return;
            }
        });
        return ret;
    },
    setUniqueId: function (obj, studyObj) {
        var me = Extract.Helper;
        if (!me.isUniqueId(obj.id, studyObj)) {
            obj.id = Utils.getUniqueId();
        }
        return obj;
    },
    updatePropertySetAssociatedWitOutcomeSet: function (outcomeId, oldOsetId, newOsetId, propertySetsData) {
        // if oucomeset id is duplicate we are creating new one and update in propertysets
        if (propertySetsData.data) {
            propertySetsData.data.forEach(function (pSet) {
                if (!Ext.isEmpty(pSet.left)) {
                    for (var l = 0; l < pSet.left.length; l++) {
                        if (outcomeId == pSet.left[l].outcomeId && oldOsetId == pSet.left[l].outcomeSetId) {
                            pSet.left[l].outcomeSetId = newOsetId;
                        }
                    }
                }
                if (!Ext.isEmpty(pSet.right)) {
                    for (var l = 0; l < pSet.right.length; l++) {
                        if (outcomeId == pSet.right[l].outcomeId && oldOsetId == pSet.right[l].outcomeSetId) {
                            pSet.right[l].outcomeSetId = newOsetId;
                        }
                    }
                }
            });
        }
    },
    getObjectFromName: function (oldStudyObject, type) {

        for (var i = 0; i < oldStudyObject.length; i++) {
            if (oldStudyObject[i].type == type)
                return oldStudyObject[i];
        }
        return {};
    },

    getEntity: function (type, id, data) {
        return Extract.Core.getEntity(type, id, data);
    },

    getUndoObject: function (type, id) {
        return Extract.Core.getUndoData(type, id);
    },

    setEntity: function (type, id, obj, callback, failure) {

        Extract.Core.setEntity(type, id, obj, callback, failure);
    },

    deleteEntityData: function (type, id, obj, callback, failure) {
        if (!obj) {
            obj = {};
        }
        Extract.Core.deleteEntity(type, id, obj, callback, failure);
    },

    pushArrayToEntity: function (entityType, entityId, value, callback, failure) {

        if (!Extract.Data[entityType] || !Extract.Data[entityType][entityId]) {
            return;
        }

        var obj = Ext.decode(Ext.encode(Extract.Data[entityType][entityId]));
        obj.push(value);

        Extract.Helper.setEntity(entityType, entityId, { Value: obj });
    },


    prevVal: function (id, type) {

        if (!Extract.Data[type])
            Extract.Data[type] = {};

        return Extract.Data[type][id];
    },

    //Get list of datapoints by array of datapoint ids
    getEntityListByArrayId: function (arrDpId, type, extractData) {
        var dpList = [];
        if (!Ext.isEmpty(arrDpId)) {
            var type = Ext.isEmpty(type) ? Extract.EntityTypes.Datapoints : type;
            for (var i = 0; i < arrDpId.length; i++) {
                var dp = Extract.Helper.getEntity(type, arrDpId[i], extractData);
                if (dp != null && dp.isDeleted != true)
                    dpList.push(dp);
            }
        }
        if (dpList.length > 0 && dpList[0].hasOwnProperty('index')) {
            dpList.sort(function (obj1, obj2) {
                return obj1.index - obj2.index;
            });
        }
        return dpList;
    },

    deleteGroupObject: function (groupid) {

        if (Extract.Data.Groups[groupid]) {
            if (!Ext.isEmpty(Extract.Data.Groups[groupid].InterventionSets)) {
                for (var i = 0; i < Extract.Data.Groups[groupid].InterventionSets.length; i++) {
                    var iSetId = Extract.Data.Groups[groupid].InterventionSets[i];
                    Extract.Helper.deleteInterventionSet(iSetId, Extract.Data.InterventionSets[iSetId])
                }
            }

            for (var key in Extract.Data.Groups[groupid].Sources) {
                Extract.Helper.deleteSourceDatapoints(Extract.Data.Groups[groupid].Sources[key]);
            }
            Extract.Helper.deleteSourceDatapoints(Extract.Data.Groups[groupid].Participants);
            Extract.Core.deleteEntity(Extract.EntityTypes.Groups, groupid, Extract.Data.Groups[groupid]);
        }
    },

    deleteInterventionSet: function (iSetId, obj) {

        for (var i = 0; i < Extract.Data.InterventionSets[iSetId].Interventions.length; i++) {

            var intrvId = Extract.Data.InterventionSets[iSetId].Interventions[i];
            Extract.Helper.deleteIntervention(intrvId, Extract.Data.Interventions[intrvId]);
        }
        //Group => InterventionSet => Sources
        for (var key in Extract.Data.InterventionSets[iSetId].Sources) {
            Extract.Helper.deleteSourceDatapoints(Extract.Data.InterventionSets[iSetId].Sources[key]);
        }

        //Delete interventionSet
        Extract.Core.deleteEntity(Extract.EntityTypes.InterventionSets, iSetId, Extract.Data.InterventionSets[iSetId]);
    },

    deleteIntervention: function (intrvId, obj) {

        //Group => InterventionSet => Interventions => Sources
        for (var key in Extract.Data.Interventions[intrvId].Sources) {
            Extract.Helper.deleteSourceDatapoints(Extract.Data.Interventions[intrvId].Sources[key]);
        }

        //Delete intervention
        Extract.Core.deleteEntity(Extract.EntityTypes.Interventions, intrvId, Extract.Data.Interventions[intrvId]);

    },

    deleteOutcomeObject: function (outcomeId) {

        if (Extract.Data.Outcomes[outcomeId]) {

            for (var i = 0; i < Extract.Data.Outcomes[outcomeId].OutcomeSets.length; i++) {
                var outSetId = Extract.Data.Outcomes[outcomeId].OutcomeSets[i];
                Extract.Helper.deleteOutcomeSet(outSetId, Extract.Data.OutcomeSets[outSetId])
            }

            for (var key in Extract.Data.Outcomes[outcomeId].Sources) {
                Extract.Helper.deleteSourceDatapoints(Extract.Data.Outcomes[outcomeId].Sources[key]);
            }

            Extract.Core.deleteEntity("Outcomes", outcomeId, Extract.Data.Outcomes[outcomeId]);
        }
    },

    deleteOutcomeSet: function (outSetId) {

        for (var i = 0; i < Extract.Data.OutcomeSets[outSetId].OutcomeGroupValues.length; i++) {

            var outGroupId = Extract.Data.OutcomeSets[outSetId].OutcomeGroupValues[i];
            Extract.Helper.deleteOutcomeGroup(outGroupId, Extract.Data.OutcomeGroupValues[outGroupId]);
        }
        //Outcomeset => Sources
        for (var key in Extract.Data.OutcomeSets[outSetId].Sources) {
            Extract.Helper.deleteSourceDatapoints(Extract.Data.OutcomeSets[outSetId].Sources[key]);
        }

        //Delete Outconeset
        Extract.Core.deleteEntity("OutcomeSets", outSetId, Extract.Data.OutcomeSets[outSetId]);
    },

    deleteOutcomeGroup: function (outGroupId) {

        //Outcomegroup=> Sources
        for (var key in Extract.Data.OutcomeGroupValues[outGroupId].Sources) {
            Extract.Helper.deleteSourceDatapoints(Extract.Data.OutcomeGroupValues[outGroupId].Sources[key]);
        }
        //Delete outcomegroup
        Extract.Core.deleteEntity("OutcomeGroupValues", outGroupId, Extract.Data.OutcomeGroupValues[outGroupId]);

    },
    deleteOutcomGroupByGroupId: function (groupId) {
        var me = this;

        for (var key in Extract.Data.Outcomes) {
            for (var i = 0; i < Extract.Data.Outcomes[key].OutcomeSets.length; i++) {
                var oSet = Extract.Data.OutcomeSets[Extract.Data.Outcomes[key].OutcomeSets[i]];

                if (!Ext.isEmpty(oSet.OutcomeGroupValues)) {
                    for (var j = 0; j < oSet.OutcomeGroupValues.length; j++) {
                        var ogv = Extract.Data.OutcomeGroupValues[oSet.OutcomeGroupValues[j]];

                        if (ogv.groupId == groupId)
                            me.deleteOutcomeGroup(ogv.id);
                    }
                }
            }
        }
    },
    //Delete all dataPoints of the source
    deleteSourceDatapoints: function (source) {

        for (var j = 0; j < source.length; j++) {
            var dpId = source[j];
            if (Extract.Data.Datapoints[dpId]) {
                Extract.Core.deleteEntity("Datapoints", dpId, Extract.Data.Datapoints[dpId]);
            }
        }
    },

    //Delete propertySets
    deletePropertySets: function (propSetId, obj) {

        Extract.Core.deleteEntity("PropertySets", propSetId, Extract.Data.PropertySets[propSetId]);
    },

    //Delete Phases
    deletePhases: function (phaseId, obj) {

        Extract.Core.deleteEntity("Phases", phaseId, Extract.Data.Phases[phaseId]);
    },

    //get object in old format to send to Stewart
    getOldObject: function (studyData) {
        if (!Extract.Data)
            Extract.Data = {};

        Extract.Data = studyData;

        var me = this;
        var oldObj = [];

        var groupObj = Extract.Helper.getGroupObjectOldFormat();
        var outcomeObj = Extract.Helper.getOutcomeObjectOldFormat();
        var studyLevelObj = Extract.Helper.getStudyLevelObjectOldFormat();
        var phaseObj = me.getPhaseObjectOldFormat();
        var propertySetsObj = me.getPropertySetsObjectOldFormat();

        oldObj.push(groupObj);
        oldObj.push(outcomeObj);
        oldObj.push(studyLevelObj);
        oldObj.push(phaseObj);
        oldObj.push(propertySetsObj);

        return oldObj;
    },

    getGroupObjectOldFormat: function () {
        var me = this;
        var groupObject = { type: "Groups", data: [] };
        var groupIds = Extract.Data.root.Groups || [];

        for (var i = 0; i < groupIds.length; i++) {
            var objgroup = Ext.decode(JSON.stringify(Extract.Data.Groups[groupIds[i]]));
            objgroup.InterventionSets = me.getInterventionSetsOldFormat(objgroup.InterventionSets);
            objgroup.Sources = me.getSourcesObjectOldFormat(objgroup.Sources);
            objgroup.Participants = me.getEntityListByArrayId(objgroup.Participants, Extract.EntityTypes.Datapoints)
            groupObject.data.push(objgroup);
        }
        return groupObject;
    },

    getInterventionSetsOldFormat: function (iSetsIds) {
        var me = this;
        var iSets = [];
        iSetsIds = iSetsIds || [];
        for (var i = 0; i < iSetsIds.length; i++) {
            var iSet = Ext.decode(JSON.stringify(Extract.Data.InterventionSets[iSetsIds[i]]));
            iSet.Interventions = me.getInterventionsOldFormat(iSet.Interventions);
            iSet.Sources = me.getSourcesObjectOldFormat(iSet.Sources);
            iSets.push(iSet);
        }
        return iSets;
    },

    getInterventionsOldFormat: function (intrvIds) {
        var me = this;
        var inverventions = [];

        intrvIds = intrvIds || [];

        for (var i = 0; i < intrvIds.length; i++) {

            var intrv = Ext.decode(JSON.stringify(Extract.Data.Interventions[intrvIds[i]]));
            intrv.Sources = me.getSourcesObjectOldFormat(intrv.Sources);
            inverventions.push(intrv);
        }
        return inverventions;
    },


    getOutcomeObjectOldFormat: function () {
        var me = this;
        var outcomeObject = { type: "Outcomes", data: [] };
        var outcomeIds = Extract.Data.root.Outcomes || [];

        for (var i = 0; i < outcomeIds.length; i++) {
            var objOutcome = Ext.decode(JSON.stringify(Extract.Data.Outcomes[outcomeIds[i]]));
            objOutcome.OutcomeSets = me.getOutcomeSetsOldFormat(objOutcome.OutcomeSets);
            objOutcome.Sources = me.getSourcesObjectOldFormat(objOutcome.Sources);
            outcomeObject.data.push(objOutcome);
        }
        return outcomeObject;
    },

    getOutcomeSetsOldFormat: function (oSetsIds) {
        var me = this;
        var oSets = [];

        oSetsIds = oSetsIds || [];

        for (var i = 0; i < oSetsIds.length; i++) {
            var oSet = Ext.decode(JSON.stringify(Extract.Data.OutcomeSets[oSetsIds[i]]));
            oSet.OutcomeGroupValues = me.getOutcomeGroupValuesOldFormat(oSet.OutcomeGroupValues);
            oSet.Sources = me.getSourcesObjectOldFormat(oSet.Sources);
            oSets.push(oSet);
        }
        return oSets;
    },

    getOutcomeGroupValuesOldFormat: function (ogvIds) {
        var me = this;
        var ogvObj = [];

        ogvIds = ogvIds || [];

        for (var i = 0; i < ogvIds.length; i++) {
            var ogv = Ext.decode(JSON.stringify(Extract.Data.OutcomeGroupValues[ogvIds[i]]));
            ogv.Sources = me.getSourcesObjectOldFormat(ogv.Sources);
            ogvObj.push(ogv);
        }
        return ogvObj;
    },


    getStudyLevelObjectOldFormat: function () {
        var me = this;
        var studyLevelObject = { type: "StudyLevel", data: [] };
        studyLevelObject.data = me.getSourcesObjectOldFormat(Extract.Data.StudyLevel);

        return studyLevelObject;
    },

    getPhaseObjectOldFormat: function () {
        var me = this;
        var phaseObj = { type: "Phases", data: [] };

        var phaseIds = Extract.Data.root.Phases || [];
        for (var i = 0; i < phaseIds.length; i++) {
            if (Extract.Data.Phases[phaseIds[i]]) {
                var phase = Extract.Data.Phases[phaseIds[i]];
                phase["fieldTypeValue"] = me.getFieldValueFromId(phase["fieldTypeValue"]);
                phaseObj.data.push(phase);
            }
        }
        return phaseObj;
    },

    getPropertySetsObjectOldFormat: function () {
        var me = this;
        var pSetObj = { type: "PropertySets", data: [] };

        var pSetIds = Extract.Data.root.PropertySets || [];
        for (var i = 0; i < pSetIds.length; i++) {
            if (Extract.Data.PropertySets[pSetIds[i]]) {
                var pSet = Extract.Data.PropertySets[pSetIds[i]];
                pSet.Sources = me.getSourcesObjectOldFormat(pSet.Sources);
                pSetObj.data.push(pSet);
            }
        }
        return pSetObj;
    },

    getSourcesObjectOldFormat: function (sources) {
        var me = this;
        var sourceObjOld = [];

        for (var key in sources) {
            sourceObjOld.push(me.getSourceObjectFromSourceName(key, sources[key], "import"));
        }

        return sourceObjOld;
    },

    getSourceObjectFromSourceName: function (sourceName, dpIdList, mode, extractData) {

        var me = this;
        var source = {};

        var dpList = me.getEntityListByArrayId(dpIdList, "", extractData);
        source.sourcename = sourceName;

        //update fieldValue object instead of id for convert to old object for import
        if (mode == "import") {

            for (var k = 0; k < dpList.length; k++) {

                var dp = dpList[k] || {};

                //If its has location field then convert it from id to datapoint and then save in Location as an array of source
                if (sourceName == "Frequency_Report" && typeof (dp["Location"]) == "object") {

                    dp["Location"] = me.getSourcesObjectOldFormat(dp["Location"]);
                    continue;
                }

                if (dp["Name"] != "Age Field Value" &&
                    dp["Name"] != "Dosage Field Value" &&
                    dp["Name"] != "n/% or Avg" &&
                    dp["Name"] != "Misc" &&
                    dp["Name"] != "FieldValue")
                    continue;

                var idList = dp["Value"] || [];
                dp["Value"] = me.getFieldValueFromId(idList);
            }
        }

        source.Datapoints = dpList;

        return source;
    },

    //get field value object from Extract.Data.FieldValues from its id, on convert to old object for import
    getFieldValueFromId: function (idList) {

        var value = [];

        if (typeof (idList) != "object" || idList == "")
            return idList;


        for (var i = 0; i < idList.length; i++) {
            if (Extract.Data.FieldValues && Extract.Data.FieldValues[idList[i]])
                value.push(Extract.Data.FieldValues[idList[i]]);
        }
        return value;
    },

    // 
    getSourceOthers: function (sourceObj, sourceName, extractData) {

        if (!sourceObj["Sources"] || !sourceObj["Sources"][sourceName]) {
            if (!sourceObj["Sources"]) {
                sourceObj["Sources"] = {};
            }
            sourceObj["Sources"][sourceName] = [];
        }

        var dpIdList = sourceObj.Sources[sourceName];
        return this.getSourceObjectFromSourceName(sourceName, dpIdList, "", extractData);
    },

    //get object in old format to send to Stewart, Ends here

    getEntityAsArray: function (entityType) {
        var array = $.map(Extract.Data[entityType], function (value, index) {
            if (value.isDeleted != true)
                return [value];
        });

        if (array.length > 0 && array[0].hasOwnProperty('index')) {
            array.sort(function (obj1, obj2) {
                return obj1.index - obj2.index;
            });
        }
        return array;
    },

    addDPToSource: function (type, typeId, sourceName, obj) {
        var me = this;
        //if (type == Extract.EntityTypes.Groups || type == Extract.EntityTypes.InterventionSets || type == Extract.EntityTypes.Interventions) {
        //    me.addDPToSourceForGroups(type, typeId, sourceName, obj, _sourceObj);
        //} else {
        var sourceObj = {};

        if (!Extract.Data[type])
            Extract.Data[type] = {};

        if (type == Extract.EntityTypes.StudyLevel) {

            if (!Extract.Data[type][sourceName]) {
                Extract.Data[type][sourceName] = [];
            }
            sourceObj = Extract.Data[type][sourceName];
        }
        else {
            if (!Extract.Data[type][typeId]["Sources"]) {
                Extract.Data[type][typeId]["Sources"] = {};
            }
            if (!Extract.Data[type][typeId]["Sources"][sourceName]) {
                Extract.Data[type][typeId]["Sources"][sourceName] = [];
            }
            sourceObj = Extract.Data[type][typeId]["Sources"][sourceName];
        }

        if (Utils.typeof(sourceObj) == 'Array') {
            sourceObj.push(obj.id);
        }

        //code to add id in particular source, inteven,set,group,out,oset,ogv, get path with their id then
        //groups/id/source/sourcename

        var path = Utils.getSourcePath(Extract.studyId, type, typeId, sourceName);
        var id = sourceObj.length;

        //array getting converted to object when 0th element is removed
        //Extract.Core.pushDataToPath(path + "/" + id, obj.id);
        Extract.Core.pushDataToPath(path, sourceObj);
        //}
    },

    addDPToDatapoints: function (dpObj) {

        if (!Extract.Data.Datapoints) {
            Extract.Data.Datapoints = {};
        }

        Extract.Core.setEntity(Extract.EntityTypes.Datapoints, dpObj.id, dpObj);
        //window.setTimeout(function () {
        Extract.Data.Datapoints[dpObj.id] = dpObj;
        // }, 200);

    },

    createDatapointAddToSource: function (ValueType, Name, Value, state, Row, Column, type, typeId, sourceName) {

        var me = this;

        var dp = Extract.Create.DataPoints(ValueType, Name, Value, state, Row, Column);

        me.addDPToSource(type, typeId, sourceName, dp);
        me.addDPToDatapoints(dp);

        return dp;
    },


    deleteDatapoint: function (type, typeId, sourceName, dpId) {

        var me = this;

        me.deleteDPFromDatapoints(dpId);
        //We are keeping datapoint id in source. Hence below function commented
        //me.deleteIdFromSource(type, typeId, sourceName, dpId);
    },

    deleteDPFromDatapoints: function (dpId) {

        if (Extract.Data.Datapoints[dpId]) {
            delete (Extract.Data.Datapoints[dpId]);
        }

        //code to add id in particular source, inteven,set,group,out,oset,ogv, get path with their id then
        //groups/id/source/sourcename

        //var path = Utils.getSourcePath(Extract.studyId, type, typeId, sourceName);
        // Delete logically not permenantly 
        Extract.Core.deleteEntity(Extract.EntityTypes.Datapoints, dpId, {});
    },

    deleteIdFromSource: function (type, typeId, sourceName, dpId) {

        var path = Utils.getSourcePath(Extract.studyId, type, typeId, sourceName);
        Extract.Core.deleteIdFromEntity(path, dpId);

    },

    //Phase
    deleteDPFromPhases: function (dpId) {

        if (Extract.Data.Phases[dpId]) {
            delete (Extract.Data.Phases[dpId]);
        }

        //code to add id in particular source, inteven,set,group,out,oset,ogv, get path with their id then
        //groups/id/source/sourcename

        //var path = Utils.getSourcePath(Extract.studyId, type, typeId, sourceName);

        Extract.Core.deleteEntity(Extract.EntityTypes.Phases, dpId, {});
    },

    //---X---X

    getDPBySourceAndDPName: function (sourcename, dpName, dpRow) {
        var dp;
        var dpList = [];
        dpList = Extract.Helper.getEntityListByArrayId(Extract.Data.StudyLevel[sourcename], Extract.EntityTypes.Datapoints);
        dp = $.grep(dpList, function (e) {
            return e.Name == dpName && e.Row == dpRow;
        });
        return dp;
    },

    getDataPointByName: function (type, typeId, sourceObj, sourceName, dpName, row, col, value) {
        var dp = {};
        var dpList = [];
        if (!sourceObj["Sources"]) {
            sourceObj["Sources"] = {};
        }
        if (sourceObj.Sources.hasOwnProperty(sourceName)) {
            dpList = Extract.Helper.getEntityListByArrayId(sourceObj.Sources[sourceName]);
        }

        for (var i = 0; i < dpList.length; i++) {

            if (!Ext.isEmpty(row) && !Ext.isEmpty(col)) {
                if (dpList[i].Name == dpName && dpList[i].Row == row && dpList[i].Column == col) {
                    dp = dpList[i];
                    break;
                }
            }
            else if (dpList[i].Name == dpName) {
                dp = dpList[i];
                break;
            }
        }

        if (Ext.isEmpty(row) && Ext.isEmpty(col)) {
            row = 1
            col = 1;
        }

        dp;

        if (Object.keys(dp).length === 0) {
            var dpVal = '';
            if (dpName == "notReported") {
                dpVal = true;
            } else {
                dpVal = '';
            }
            if (Ext.isEmpty(dpVal) && !Ext.isEmpty(value)) {
                dpVal = value;
            }
            dp = Extract.Helper.createDatapointAddToSource(Extract.Datapoint.VALUETYPE.MEMO, dpName,
                dpVal, Extract.Datapoint.STATE.ADDED, row, col, type, typeId, sourceName);
        }
        return dp;
    },


    getOutcomeGroupValuesByGroupId: function (outcomeSet, groupId) {
        var gp = {};
        for (var i = 0; i < outcomeSet.OutcomeGroupValues.length; i++) {
            var ogv = Extract.Helper.getEntity(Extract.EntityTypes.OutcomeGroupValues, outcomeSet.OutcomeGroupValues[i]);
            if (ogv.groupId == groupId && Ext.isEmpty(ogv.isDeleted)) {
                gp = ogv;
                break;
            }
        }
        return gp;
    },

    createPhaseAddToSource: function (name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh) {

        var me = this;

        var phase = Extract.Create.Phases(name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh);

        //me.addToSource(type, typeId, sourceName, phase);
        me.addToPhases(phase);

        return phase;
    },

    addToPhases: function (phase) {

        if (!Extract.Data.Phases) {
            Extract.Data.Phases = {};
        }

        Extract.Core.setEntity(Extract.EntityTypes.Phases, phase.id, phase);
        Extract.Data.Phases[phase.id] = phase;
    },

    getPropertySetByOCOsetArmId: function (armId, outcomeId, outcomeSetId) {
        for (var pSet in Extract.Data.PropertySets) {
            var obj = Extract.Data.PropertySets[pSet];
            if (obj.left) {
                for (var j = 0; j < obj.left.length; j++) {
                    var left = obj.left[j];
                    if (left) {
                        if (left.outcomeId == outcomeId && left.outcomeSetId == outcomeSetId && obj.armId == armId) {
                            return obj;
                        }
                    }
                }

            }

            if (obj.right) {
                for (var j = 0; j < obj.right.length; j++) {
                    var right = obj.right[j];
                    if (right) {
                        if (right.outcomeId == outcomeId && right.outcomeSetId == outcomeSetId && obj.armId == armId) {
                            return obj;
                        }
                    }
                }
            }
        }
        //for (var i = 0; i < this.Data.length; i++) {

        //    for (var j = 0; j < this.Data[i].left.length; j++) {
        //        if (this.Data[i].left[j].outcomeId == outcomeId && this.Data[i].left[j].outcomeSetId == outcomeSetId && this.Data[i].armId == armId) {
        //            return this.Data[i]
        //        }
        //    }

        //    for (var j = 0; j < this.Data[i].right.length; j++) {
        //        if (this.Data[i].right[j].outcomeId == outcomeId && this.Data[i].right[j].outcomeSetId == outcomeSetId && this.Data[i].armId == armId) {
        //            return this.Data[i]
        //        }
        //    }

        //}
    },
    getPropertySetByOCOsetId: function (outcomeId, outcomeSetId) {
        for (var pSet in Extract.Data.PropertySets) {
            var obj = Extract.Data.PropertySets[pSet];
            if (obj.left) {
                for (var j = 0; j < obj.left.length; j++) {
                    var left = obj.left[j];
                    if (left) {
                        if (left.outcomeId == outcomeId && left.outcomeSetId == outcomeSetId) {
                            return obj;
                        }
                    }
                }

            }

            if (obj.right) {
                for (var j = 0; j < obj.right.length; j++) {
                    var right = obj.right[j];
                    if (right) {
                        if (right.outcomeId == outcomeId && right.outcomeSetId == outcomeSetId) {
                            return obj;
                        }
                    }
                }
            }
        }

    },
    createFieldValue: function (name, value, source, dpId, type, fieldToUpdate) {

        if (!Extract.Data.FieldValues)
            Extract.Data.FieldValues = {};

        var fieldValue = Extract.Create.FieldValues(name, value, source);

        Extract.Data.FieldValues[fieldValue.id] = fieldValue;

        if (!Extract.Data[type][dpId])
            Extract.Data[type][dpId] = {};

        if (Ext.isEmpty(Extract.Data[type][dpId][fieldToUpdate])) {
            if (fieldToUpdate) {
                Extract.Data[type][dpId][fieldToUpdate] = [];
            } else {
                Extract.Data[type][dpId].Value = [];
            }
        }

        //update FieldValues in database 
        Extract.Helper.setEntity(Extract.EntityTypes.FieldValues, fieldValue.id, fieldValue);

        //var path = Utils.setDBPath(Extract.studyId, type, dpId);

        //Update local object
        Extract.Data[type][dpId][fieldToUpdate].push(fieldValue.id);

        ////update Datapoints in database 

        Extract.Helper.updateArrayAtPath(Extract.studyId, type, dpId, fieldToUpdate, Extract.Data[type][dpId][fieldToUpdate]);
        return fieldValue;
    },

    deleteFieldValue: function (dpId, type, fieldToUpdate, callback, failure) {

        if (!Extract.Data[type][dpId][fieldToUpdate]) {
            if (callback) {
                callback();
            }
            return;
        }

        for (var i = 0; i < Extract.Data[type][dpId][fieldToUpdate].length; i++) {

            var fvId = Extract.Data[type][dpId][fieldToUpdate][i];

            if (Extract.Data.FieldValues[fvId]) {

                Extract.Core.deleteObjectFromPath(Extract.EntityTypes.FieldValues, fvId);
            }
        }
        var obj = {};
        obj.id = dpId;
        obj[fieldToUpdate] = [];

        Extract.Core.setEntity(type, dpId, obj, callback, failure);
    },

    deleteSingleFieldValue: function (dpId, fval, type, fieldToUpdate) {
        if (!Extract.Data[type][dpId][fieldToUpdate])
            return;
        for (var i = 0; i < Extract.Data[type][dpId][fieldToUpdate].length; i++) {

            if (fval.id == Extract.Data[type][dpId][fieldToUpdate][i]) {

                if (Extract.Data.FieldValues[fval.id]) {
                    Extract.Data[type][dpId][fieldToUpdate].splice($.inArray(fval.id, Extract.Data[type][dpId][fieldToUpdate]), 1);
                    var obj = {};
                    obj[fieldToUpdate] = Extract.Data[type][dpId][fieldToUpdate];
                    obj.id = dpId;
                    Extract.Core.setEntity(type, dpId, obj);
                    Extract.Core.deleteObjectFromPath(Extract.EntityTypes.FieldValues, fval.id);
                    break;
                }
            }
        }

    },



    //PropertySets
    createPropertySet: function () {

        var pSet = Extract.Create.PropertySets();
        Extract.Core.setEntity(Extract.EntityTypes.PropertySets, pSet.id, pSet);
        return pSet;
    },

    getFirstPropertySetByArmId: function (armId) {
        for (var pSet in Extract.Data.PropertySets) {
            var obj = Extract.Data.PropertySets[pSet];
            if (obj.armId == armId) {
                return obj;
            }
        }
    },

    propertySetAddToLeft: function (groupId, outcomeId, outcomeSetId, pSet) {

        var me = Extract.Helper;

        var obj = {
            groupId: groupId,
            outcomeId: outcomeId,
            outcomeSetId: outcomeSetId
        }

        if (!Extract.Data.PropertySets[pSet.id]) {
            if (!pSet["left"])
                pSet["left"] = [];

            pSet["left"].push(obj);

            Extract.Data.PropertySets[pSet.id] = pSet;
            me.setEntity(Extract.EntityTypes.PropertySets, pSet.id, pSet);
            return;
        }

        if (!Extract.Data.PropertySets[pSet.id]["left"])
            Extract.Data.PropertySets[pSet.id]["left"] = [];

        var rLength = pSet["right"] ? pSet["right"].length : 0;
        var lLength = pSet["left"] ? pSet["left"].length : 0;
        if ((rLength == 1 || lLength == 1) && !pSet.isAdded) { // remove dummy data
            Extract.Data.PropertySets[pSet.id]["right"] = [];

            //Extract.Data.PropertySets[pSet.id]["isAdded"] = true;
            // var obj = { "isAdded": true };

            me.setEntity(Extract.EntityTypes.PropertySets, pSet.id, { "isAdded": true });
            me.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSet.id, "right", Extract.Data.PropertySets[pSet.id]["right"]);
        }

        Extract.Data.PropertySets[pSet.id]["left"].push(obj);

        me.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSet.id, "left", Extract.Data.PropertySets[pSet.id]["left"]);
        return pSet;
    },

    propertySetAddToRight: function (groupId, outcomeId, outcomeSetId, pSet) {
        var me = this;

        var obj = {
            groupId: groupId,
            outcomeId: outcomeId,
            outcomeSetId: outcomeSetId
        }

        if (!Extract.Data.PropertySets[pSet.id]) {
            if (!pSet["right"])
                pSet["right"] = [];

            pSet["right"].push(obj);

            Extract.Data.PropertySets[pSet.id] = pSet;
            Extract.Helper.setEntity(Extract.EntityTypes.PropertySets, pSet.id, pSet);
            return;
        }

        if (!Extract.Data.PropertySets[pSet.id]["right"])
            Extract.Data.PropertySets[pSet.id]["right"] = [];

        var rLength = pSet["right"] ? pSet["right"].length : 0;
        var lLength = pSet["left"] ? pSet["left"].length : 0;

        if ((rLength == 1 || lLength == 1) && !pSet.isAdded) { // remove dummy data
            Extract.Data.PropertySets[pSet.id]["right"] = [];

            //Extract.Data.PropertySets[pSet.id]["isAdded"] = true;
            //var objIsAdded = { "isAdded": true };

            me.setEntity(Extract.EntityTypes.PropertySets, pSet.id, { "isAdded": true });

            me.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSet.id, "right", Extract.Data.PropertySets[pSet.id]["right"]);
        }

        Extract.Data.PropertySets[pSet.id]["right"].push(obj);

        //var path = Utils.setDBPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSet.id);
        //Extract.Core (path + "/left", obj);

        me.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSet.id, "right", Extract.Data.PropertySets[pSet.id]["right"]);
        return pSet;
    },

    propertySetAddToPosition: function (groupId, outcomeId, outcomeSetId, outcomeNameId, position, pSetId) {
        var obj = {
            groupId: groupId,
            outcomeId: outcomeId,
            outcomeSetId: outcomeSetId,
            outcomeNameId: outcomeNameId
        }

        if (!Extract.Data.PropertySets[pSetId][position])
            Extract.Data.PropertySets[pSetId][position] = [];

        Extract.Data.PropertySets[pSetId][position].push(obj);

        var path = Utils.setDBPath(Extract.studyId, Extract.EntityTypes.PropertySets, pSetId);

        Extract.Core.updateToPath(path + "/" + position, obj);
        //Add position in db
        return obj;
    },

    propertySetAddDPToSource: function (sourcename, datapoint, pSetId) {
        var source;

        if (!Extract.Data.PropertySets[pSetId].Sources) {
            Extract.Data.PropertySets[pSetId].Sources = {};
            Extract.Data.PropertySets[pSetId].Sources[sourcename] = [];
        }

        Extract.Data.PropertySets[pSetId].Sources[sourcename].push(datapoint);

        //Add source in db
        var path = Utils.getSourcePath(Extract.studyId, Extract.EntityTypes.PropertySets, pSetId, sourcename);
        Extract.Core.updateToPath(path, Extract.Data.PropertySets[pSetId].Sources[sourcename]);

    },

    deleteAllPropertySetByArmId: function (armId) {
        var me = this;

        if (!Extract.Data.PropertySets)
            return;

        for (var key in Extract.Data.PropertySets) {
            var pSet = Extract.Data.PropertySets[key];

            if (pSet.armId && pSet.armId == armId) {
                //me.deleteObjectFromEntity(Extract.EntityTypes.PropertySets, key);
                Extract.Helper.Highlights.deleteFromHighlightsByEntityId(pSet.id); // delete highlights for propertysets
                me.deleteEntity(Extract.EntityTypes.PropertySets, key);
            }
        }
    },

    //PropertySets ENds here



    deleteObjectFromEntity: function (type, typeId) {

        if (Extract.Data[type]) {
            if (Extract.Data[type][typeId])
                delete Extract.Data[type][typeId];
        }
    },



    //Groups
    createGroups: function (group) {

        if (typeof (group) != "string")
            return group;

        var groupObj = Extract.Create.Groups(group);

        //Update groups in firebase dB
        Extract.Core.setEntity(Extract.EntityTypes.Groups, groupObj.id, groupObj);

        return groupObj;
    },

    getGroupNameById: function (groupId) {

        if (Extract.Data.Groups[groupId])
            return Extract.Data.Groups[groupId].name;

        return "";
    },

    addParticipants: function (sourceObj, Gender, Number, Percentage, id) {
        var me = this;
        if (!sourceObj.Participants)
            sourceObj.Participants = [];

        var objPart = {};
        if (Extract.Helper.getEntityListByArrayId(sourceObj.Participants)) {
            var lstPart = Extract.Helper.getEntityListByArrayId(sourceObj.Participants).filter(function (a) { return a.Gender == Gender });
            if (lstPart.length > 0) {
                objPart = lstPart[0];
            }
        }

        if (Object.keys(objPart).length == 0) {
            objPart = Extract.Create.Participants(Gender, Number, Percentage, "Participants");
            sourceObj.Participants.push(objPart.id);
            //update array in database in groups.participants
            var indexPart = sourceObj.Participants.indexOf(id);

            if (Extract.Data.Datapoints[id] == undefined && indexPart > -1) {
                sourceObj.Participants.splice(indexPart, 1);
            }

            me.addDPToDatapoints(objPart);
            me.updateObjectAtPath(Extract.EntityTypes.Groups, sourceObj.id, Extract.EntityTypes.Participants, sourceObj.Participants);
        }

        return objPart;
    },

    //updateParticipants:function(sourceObj, Gender, Number, Percentage){

    //},

    //Groups Ends here



    //Outcomes
    createOutcome: function (outcomeName) {

        var outcome = Extract.Create.Outcomes(outcomeName);
        Extract.Core.setEntity(Extract.EntityTypes.Outcomes, outcome.id, outcome);

        if (!Extract.Data[Extract.EntityTypes.Outcomes][outcome.id])
            Extract.Data[Extract.EntityTypes.Outcomes][outcome.id] = outcome;

        return outcome;
    },

    createOutcomeSet: function (outcomeId) {

        var outSet = Extract.Create.OutcomeSets();
        //Extract.Core.setEntity(Extract.EntityTypes.OutcomeSets, outSet.id, outSet);


        var length = Extract.Data.Outcomes[outcomeId].OutcomeSets.length;
        //var path = Utils.getArrayObjectPath(Extract.studyId, Extract.EntityTypes.Outcomes, outcomeId, Extract.EntityTypes.OutcomeSets, length);

        //Update local object
        Extract.Data.Outcomes[outcomeId].OutcomeSets.push(outSet.id);

        ////Update to firebase

        Extract.Helper.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.Outcomes, outcomeId, Extract.EntityTypes.OutcomeSets, Extract.Data.Outcomes[outcomeId].OutcomeSets);

        //Updated outcomeSet in firebase dB
        Extract.Core.setEntity(Extract.EntityTypes.OutcomeSets, outSet.id, outSet);

        if (!Extract.Data[Extract.EntityTypes.OutcomeSets][outSet.id])
            Extract.Data[Extract.EntityTypes.OutcomeSets][outSet.id] = outSet;

        return outSet;
    },

    createOutcomeGroupValues: function (outcomeSetId, isDeleted, groupId) {

        var ogv = Extract.Create.OutcomeGroupValues();


        if (isDeleted && isDeleted == true)
            ogv.isDeleted = isDeleted;

        if (groupId)
            ogv.groupId = groupId;
        //Extract.Core.setEntity(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv);

        var length = Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues.length;
        //var path = Utils.getArrayObjectPath(Extract.studyId, Extract.EntityTypes.OutcomeSets, outcomeSetId, Extract.EntityTypes.OutcomeGroupValues, length);

        //Update local object
        Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues.push(ogv.id);

        ////Update to firebase
        Extract.Helper.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.OutcomeSets, outcomeSetId, Extract.EntityTypes.OutcomeGroupValues, Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues);

        //Updated outcomeSet in firebase dB
        Extract.Core.setEntity(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv);

        if (!Extract.Data[Extract.EntityTypes.OutcomeGroupValues][ogv.id])
            Extract.Data[Extract.EntityTypes.OutcomeGroupValues][ogv.id] = ogv;
        var ogvIndex = this.getOgvIndex(Extract.Data.OutcomeSets[outcomeSetId]);
        Extract.Helper.setEntity(Extract.EntityTypes.OutcomeGroupValues, ogv.id, { index: ogvIndex });
        ogv.index = ogvIndex;

        return ogv;
    },
    getOgvIndex: function (outcomeSet) {
        var index = 0;
        var OutcGroupValues = Extract.Helper.getEntityListByArrayId(outcomeSet.OutcomeGroupValues, Extract.EntityTypes.OutcomeGroupValues);
        for (var i = 0; i < OutcGroupValues.length; i++) {
            var obj = OutcGroupValues[i];

            if (obj.index && index < obj.index) {
                index = obj.index;
            }
        }
        return index + 1;
    },
    phaseExist: function (name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh) {
        var me = this;
        var existingPhase = "";
        var phases = Extract.Helper.getEntityAsArray('Phases');
        for (let i = 0; i < phases.length; i++) {
            var phase = phases[i];
            if (phase.description == description && phase.description == description && phase.descriptionHigh == descriptionHigh && phase.drugName == drugName && phase.end == end && phase.endUnit == endUnit  && phase.name == name && phase.start == start && phase.startUnit == startUnit && phase.type == type) {
                existingPhase = phase;
                break;
            }
        }
        return existingPhase;
    },

    cloneOutcome: function (outcome) {

        var me = this;
        var outcomeObj = me.createOutcome(outcome.name); //JSON.parse(JSON.stringify(outcome));

        //oldOutcome = JSON.parse(JSON.stringify(outcome));
        oldOutcome = Object.assign({}, outcome);
        //Update below code when needed
        //ExtractData.Highlights.addHighlightByclone(outcomeObj.id, newOutcomeId);

        var oSource = oldOutcome.Sources;

        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.Outcomes, outcomeObj.id, oSource);

        //Clone OutcomeSet and add to DB

        for (var i = 0; i < oldOutcome.OutcomeSets.length; i++) {
            var outSetId = oldOutcome.OutcomeSets[i];
            Extract.Helper.cloneOutcomeSets(outcomeObj.id, outSetId);
        }

        //Clone OutcomeGroupValues and add to DB

        // do not copy from Old Outcome Code

        return outcomeObj;
    },

    cloneSource: function (type, typeId, source) {
        var me = this;

        if (type == Extract.EntityTypes.OutcomeGroupValues) {
            var groupId = Extract.Data[type][typeId].groupId;
        }

        for (key in source) {

            var dpList = me.getEntityListByArrayId(source[key], "");
            me.emptySourceArray(type, typeId, key);

            for (var i = 0; i < dpList.length; i++) {

                var oldDp = Ext.decode(Ext.encode(dpList[i]));

                if (type == Extract.EntityTypes.Outcomes && (oldDp.Name == "Acronym" || oldDp.Name == "Note" || oldDp.Name == "QualitativeNote")) {
                    oldDp.Value = "";
                }

                if (type == Extract.EntityTypes.OutcomeSets) {

                    if (oldDp.Name == "UnitLabel") {
                        var fldtype = $.grep(dpList, function (dt) {
                            return dt.Name == "FieldType";
                        });
                        if (fldtype.length > 0) {
                            if (fldtype[0].type) {
                                if (fldtype[0].type == "Incidence" || fldtype[0].type == "Prevalence") {
                                    oldDp.Value = "";
                                }
                            }
                        }
                    }
                    if (oldDp.Name == "Note" || oldDp.Name == "QualitativeNote") {
                        oldDp.Value = "";
                    }

                }

                if (type == Extract.EntityTypes.OutcomeGroupValues) {

                    if (key == Extract.Outcomes.SOURCENAMES.POPULATION) {

                        if (oldDp.Name == "name")
                            oldDp.Value = OutcomeManager.getDefaultPopulationName(groupId);
                        else if (oldDp.Name == "value")
                            oldDp.Value = OutcomeManager.getDefaultPopulationValue(groupId);

                    }
                    else if (key == Extract.Outcomes.SOURCENAMES.FIELDVALUE && oldDp.Name == "FieldValue") {
                        oldDp.Value = "";
                    }
                }
                var dp = me.createDatapointAddToSource(oldDp.ValueType, oldDp.Name, oldDp.Value, oldDp.state, oldDp.Row, oldDp.Column, type, typeId, key);
                if (type == Extract.EntityTypes.OutcomeSets) {
                    if (oldDp.Name == "FieldType" && !Ext.isEmpty(oldDp.type)) {
                        Extract.Helper.setEntity(Extract.EntityTypes.Datapoints, dp.id, { type: oldDp.type });
                        dp.type = oldDp.type;
                    }
                    Extract.Helper.Highlights.addHighlightByclone(oldDp.id, dp.id);
                }

            }
        }
    },

    emptySourceArray: function (type, typeId, sourceName) {

        var path = Utils.getSourcePath(Extract.studyId, type, typeId, sourceName);
        Extract.Core.updateToPath(path, []);
    },

    cloneOutcomeSets: function (outcomeId, outcomeSetId) {
        var me = this;
        // var oldOutcomeSet = JSON.parse(JSON.stringify(Extract.Data.OutcomeSets[outcomeSetId]));
        var oldOutcomeSet = Object.assign({}, Extract.Data.OutcomeSets[outcomeSetId]);
        var oSource = oldOutcomeSet.Sources;

        if (oldOutcomeSet.isDeleted)
            return;

        var outcomeSet = me.createOutcomeSet(outcomeId);

        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.OutcomeSets, outcomeSet.id, oSource);

        //Clone OutcomeGroupValues and add to DB

        for (var i = 0; i < oldOutcomeSet.OutcomeGroupValues.length; i++) {
            var ogvId = oldOutcomeSet.OutcomeGroupValues[i];
            Extract.Helper.cloneOutcomeGroupValues(outcomeSet.id, ogvId);
        }
        return outcomeSet;
    },

    cloneOutcomeGroupValues: function (outcomeSetId, ogvId) {
        var me = this;
        //var oldOutcomeGroup = JSON.parse(JSON.stringify(Extract.Data.OutcomeGroupValues[ogvId]));
        var oldOutcomeGroup = Object.assign({}, Extract.Data.OutcomeGroupValues[ogvId]);
        var oSource = oldOutcomeGroup.Sources;

        var outcomeGroup = me.createOutcomeGroupValues(outcomeSetId, oldOutcomeGroup.isDeleted, oldOutcomeGroup.groupId);
        // Extract.Helper.setEntity(Extract.EntityTypes.OutcomeGroupValues, outcomeGroup.id, { timepoint: oldOutcomeGroup.timepoint });
        Extract.Helper.updateObjectAtPath(Extract.EntityTypes.OutcomeGroupValues, outcomeGroup.id, "timepoint", oldOutcomeGroup.timepoint);
        outcomeGroup.timepoint = Object.assign({}, oldOutcomeGroup.timepoint);
        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.OutcomeGroupValues, outcomeGroup.id, oSource);
        return outcomeGroup;
    },

    //Outcomes Ends here


    cloneGroup: function () { },
    updateObjectAtPath: function (type, typeId, propertyName, value) {

        var path = Utils.getArrayObjectPath(Extract.studyId, type, typeId, propertyName);
        Extract.Core.updateToPath(path, value);
    },

    setTimePoint: function (ogvid, id, type) {
        var ogv = Extract.Helper.getEntity(Extract.EntityTypes.OutcomeGroupValues, ogvid);
        if (type == null || type == undefined) {
            type = "alone";
        }
        if (ogv.timepoint.type != "alone") {
            ogv.timepoint.id = id;
            Extract.Helper.updateObjectAtPath(Extract.EntityTypes.OutcomeGroupValues, ogv.id, "timepoint", ogv.timepoint);
        }
    },

    createInterventionSets: function (name, groupId, interventionSetObj, caseNo) {

        if (typeof (interventionSetObj) == "object")
            return interventionSetObj;

        if (!Extract.Data.Groups[groupId]) {
            console.log("GroupId does not exists : " + groupId);
            return;
        }

        var iSet = Extract.Create.InterventionSets(name, groupId, caseNo);

        Extract.Core.setEntity(Extract.EntityTypes.InterventionSets, iSet.id, iSet);
        Extract.Data.InterventionSets[iSet.id] = iSet;

        if (!Extract.Data.Groups[groupId].InterventionSets)
            Extract.Data.Groups[groupId].InterventionSets = [];

        //update local object
        Extract.Data.Groups[groupId].InterventionSets.push(iSet.id);

        //var path = Utils.getArrayObjectPath(Extract.studyId, Extract.EntityTypes.Groups, groupId, Extract.EntityTypes.InterventionSets, length);
        Extract.Helper.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.Groups, groupId, Extract.EntityTypes.InterventionSets, Extract.Data.Groups[groupId].InterventionSets);

        return iSet;
    },

    createInterventions: function (iSetId, phaseId, intervenObj, groupId) {

        if (typeof (intervenObj) == "object")
            return intervenObj;

        if (!Extract.Data.InterventionSets[iSetId]) {
            console.log("InterventionSets does not exists : " + iSetId);
            return;
        }

        var interv = Extract.Create.Interventions(phaseId, iSetId, groupId);

        Extract.Core.setEntity(Extract.EntityTypes.Interventions, interv.id, interv);
        Extract.Data.Interventions[interv.id] = interv;

        if (!Extract.Data.InterventionSets[iSetId].Interventions)
            Extract.Data.InterventionSets[iSetId].Interventions = [];

        //update local object
        Extract.Data.InterventionSets[iSetId].Interventions.push(interv.id);

        //var path = Utils.getArrayObjectPath(Extract.studyId, Extract.EntityTypes.InterventionSets, iSetId, Extract.EntityTypes.Interventions, length);
        Extract.Helper.updateArrayAtPath(Extract.studyId, Extract.EntityTypes.InterventionSets, iSetId, Extract.EntityTypes.Interventions, Extract.Data.InterventionSets[iSetId].Interventions);

        return interv;
    },

    cloneInterventionSets: function (groupId, interventionSetObj) {

        if (!Extract.Data.Groups[groupId]) {
            console.log("GroupId does not exists : " + groupId);
            return;
        }

        var me = this;
        var oldIntSet = JSON.parse(JSON.stringify(Extract.Data.InterventionSets[interventionSetObj.id]));
        var oSource = oldIntSet.Sources;

        var iSet = me.createInterventionSets(oldIntSet.name, groupId, "", oldIntSet.caseNo);

        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.InterventionSets, iSet.id, oSource);

        //Clone OutcomeGroupValues and add to DB

        for (var i = 0; i < oldIntSet.Interventions.length; i++) {
            var interventionId = oldIntSet.Interventions[i];
            var phaseId = "";
            if (Extract.Data.Interventions[interventionId]) {
                phaseId = Extract.Data.Interventions[interventionId].phaseid;
            }
            Extract.Helper.cloneInterventions(iSet.id, interventionId, phaseId, groupId);
        }

        return iSet;

    },

    cloneInterventions: function (iSetId, intrvId, phaseId, groupId) {

        if (!Extract.Data.InterventionSets[iSetId]) {
            console.log("GroupId does not exists : " + groupId);
            return;
        }

        var me = this;
        var oldIntv = JSON.parse(JSON.stringify(Extract.Data.Interventions[intrvId]));
        var oSource = oldIntv.Sources;

        var intervention = me.createInterventions(iSetId, phaseId, "", groupId);

        Extract.Core.setEntity(Extract.EntityTypes.Interventions, intervention.id, intervention);
        Extract.Data.Interventions[intervention.id] = intervention;

        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.Interventions, intervention.id, oSource);

        return intervention;
    },



    //Common functions (it can be at multiple places in this file)
    isEntityDeleted: function (type, typeId) {
        var isDeleted = false;
        if (Extract.Data[type][typeId] != null) {
            if (Extract.Data[type][typeId].isDeleted == true) {
                isDeleted = true;
            }
        } else {
            isDeleted = true;
        }
        return isDeleted;
    },

    //update array of particular object in side object
    updateArrayAtPath: function (refId, type, typeId, subType, newArrObj) {

        var path = Utils.getArrayObjectPath(refId, type, typeId, subType);
        Extract.Core.pushDataToPath(path, newArrObj);

    },

    //Delete permanenty from firebase database
    deleteEntity: function (type, entityId) {

        var me = this;
        var path = Utils.getDeleteEntityPath(Extract.studyId, type);

        var obj = {};
        obj[entityId] = [];

        Extract.Core.updateToPath(path, obj);
        me.deleteObjectFromEntity(type, entityId);
    },

    deleteSubEntity: function (type, entityId, subType, subEntityId) {

        var me = this;

        var subPath = type + "/" + entityId + "/" + subType;

        me.deleteEntity(subPath, subEntityId);
    },

    //Common functions Ends here



    updateWarningData: function (strWarning) {

        if (!Extract.Data.WarningReports)
            Extract.Data.WarningReports = [];

        Extract.Data.WarningReports.push(strWarning);

        var path = Utils.getDBPath(Extract.studyId) + "/" + Extract.EntityTypes.WarningReports;
        Extract.Core.updateWarningDataToPath(path, Extract.Data.WarningReports);
    },

    deleteWarningData: function (strWarning) {
        if (!Extract.Data.WarningReports) {
            Extract.Data.WarningReports = [];
            return;
        }

        var index = Extract.Data.WarningReports.indexOf(strWarning);
        Extract.Data.WarningReports.splice(index, 1);

        var path = Utils.getDBPath(Extract.studyId) + "/" + Extract.EntityTypes.WarningReports;
        Extract.Core.updateWarningDataToPath(path, Extract.Data.WarningReports);
    },

    updateWarningDataToPath: function (path, data) {

        Extract.Core.pushDataToPath(path, data);

    },

    createNote: function (TaskId, TaskDetailId, ReferenceId, Notes, CreatedBy, CreatedByName, CreatedOn, ToEmails, UserNames, IsEmailSent, callback) {
        var notes = Extract.Create.Notes(TaskId, TaskDetailId, ReferenceId, Notes, CreatedBy, CreatedByName, CreatedOn, ToEmails, UserNames, false);

        Extract.Helper.setEntity(Extract.EntityTypes.Notes, notes.id, notes, callback);
    },




    Highlights: {

        createObject: function (entityId, currentHighlight, propType) {
            var me = this;

            var Obj = Extract.Create.Highlights(entityId);
            if (propType) {
                Obj.propType = propType;
            }

            if (!Ext.isEmpty(currentHighlight) && currentHighlight != "{}") {
                var highlightObj = JSON.parse(currentHighlight);
                Obj.mainElementID = highlightObj.mainElementID;
                Obj.Coordinates = highlightObj.Coordinates;
                Obj.selectedText = highlightObj.selectedText;
                Obj.textColor = highlightObj.textColor;
                Obj.refId = highlightObj.refId;
                Obj.isStrikeThrough = highlightObj.isStrikeThrough;
                Obj.textComment = highlightObj.textComment;
                Obj.highlightid = highlightObj.highlightid;
            }

            if (!Extract.Data.Highlights) {
                Extract.Data.Highlights = {};
            }

            if (!Extract.Data.Highlights[entityId]) {
                Extract.Data.Highlights[entityId] = {};
            }

            Extract.Data.Highlights[entityId][Obj.highlightid] = Obj;

            me.updateData(entityId, Obj.highlightid, Obj);
        },

        updateData: function (entityId, objId, obj, mode) {

            var hPath = Utils.getHighlightPath(Extract.studyId, "Highlights", entityId, objId);

            if (mode == "delete")
                hPath = Utils.getHighlightDeletePath(Extract.studyId, "Highlights", entityId);

            Extract.Core.updateToPath(hPath, obj);

            var objHighlight = Extract.Data.Highlights[entityId][objId];
            if (objHighlight) {
                var key = Object.keys(obj)[0];
                objHighlight[key] = obj[key];
            }
        },

        deleteData: function (entityId, highlightId) {
            var me = this;

            if (!Extract.Data.Highlights)
                return;

            //to delete object, set that object to empty array
            var obj = {};
            obj[highlightId] = [];

            me.updateData(entityId, highlightId, obj, "delete");
            delete Extract.Data.Highlights[entityId][highlightId];
        },

        deleteEntity: function (entityId) {
            var me = this;

            if (!Extract.Data.Highlights)
                return;

            //to delete object, set that object to empty array
            var obj = {};
            obj[entityId] = [];

            //me.updateData(entityId, "", [], "delete");
            var path = Utils.getDeleteEntityPath(Extract.studyId, Extract.EntityTypes.Highlights);
            Extract.Core.updateToPath(path, obj);

            delete Extract.Data.Highlights[entityId];
        },

        deleteDpHighlight: function (entityId, propType) {
            var arrHighlight = this.getByEntityId(entityId, propType);
            var _this = this;
            $.each(arrHighlight, function (i, objHighlight) {
                _this.deleteData(entityId, objHighlight.highlightid);
                var pdfContent = App.pdfViewer.iframe.dom.contentWindow;
                var divs = pdfContent.document.getElementsByClassName(objHighlight.highlightid);
                if (divs.length > 0) {
                    $(divs).remove();
                }
            });
        },

        getByEntityId: function (entityId, propType, data) {
            var arrList = [], ExtractHighlight = Extract.Data.Highlights;
            if (data) {
                ExtractHighlight = data.Highlights;
            }

            if (ExtractHighlight && ExtractHighlight[entityId]) {

                for (var key in ExtractHighlight[entityId]) {

                    if (propType && ExtractHighlight[entityId][key]) {
                        if (ExtractHighlight[entityId][key].propType == propType) {
                            arrList.push(ExtractHighlight[entityId][key]);
                        }
                    }
                    else if (ExtractHighlight[entityId][key]) {
                        arrList.push(ExtractHighlight[entityId][key]);
                    }
                }
            }
            return arrList;
        },

        getByHighlightId: function (entityId, highlightid, propType) {

            if (Extract.Data.Highlights && Extract.Data.Highlights[entityId]) {

                if (Extract.Data.Highlights[entityId][highlightid] && Extract.Data.Highlights[entityId][highlightid].propType == propType) {

                    return Extract.Data.Highlights[entityId][highlightid];
                }
            }
        },


        addHighlightByclone: function (entityId, newEntityId) {

            if (Extract.Data.Highlights != null && Extract.Data.Highlights != undefined && Extract.Data.Highlights[entityId]) {

                var newObj = {};
                //newObj[newEntityId] = {};

                var highlightObj = {};

                for (var key in Extract.Data.Highlights[entityId]) {
                    highlightObj = Ext.decode(Ext.encode(Extract.Data.Highlights[entityId][key]));
                    highlightObj.highlightid = new Date().getTime();

                    newObj[highlightObj.highlightid] = highlightObj;
                }

                if (!Extract.Data.Highlights)
                    Extract.Data.Highlights = {};

                Extract.Data.Highlights[newEntityId] = newObj;

                Extract.Helper.setEntity(Extract.EntityTypes.Highlights, newEntityId, newObj);

            }
        },


        //#region Highlight
        createHighlight: function (cmp, event) {
            //if (objTextParsing.isReadOnly) { // commentd by Jignesh : #6057
            //    return;
            //}
            if (event.ctrlKey || event.shiftKey || event.metaKey) {

                if (cmp.isHighlightSupport) {
                    var currentHighlight = {}

                    if (top.winOpen.highlightManager != undefined) {
                        currentHighlight = top.winOpen.highlightManager.currentHighlight;
                    }
                    else {
                        currentHighlight = top.HighlightManager.currentHighlight;
                    }

                    if (objTextParsing.isReadOnly) { // commentd by Jignesh : #6057
                        currentHighlight = "";
                    }

                    if (!cmp.highlights) cmp.highlights = [];
                    if (currentHighlight != "" && currentHighlight != undefined) {
                        currentHighlight.textColor = this.getFieldColor(cmp);
                        currentHighlight.selectedText = currentHighlight.selectedText.trim();
                        if (event.ctrlKey || event.metaKey) {
                            var val = (cmp.getValue() == null || cmp.getValue() == "") ? "" : cmp.getValue() + " ";
                            if (cmp.name == "cmbFrequency") {
                                var arr = [];
                                arr = cmp.getValue();
                                arr.push(currentHighlight.selectedText);
                                if (cmp.editable != false) {
                                    cmp.setValue(arr);
                                }
                            }
                            else {
                                if (cmp.isCalloutField != true) {
                                    if (cmp.editable != false) {
                                        var strSelected = currentHighlight.selectedText.replace(/</img, "&#60;");
                                        cmp.setValue(val + strSelected);
                                        if (cmp.name == "equality") { // Add Highlighted text in equality store
                                            cmp.store.add({ 'field1': currentHighlight.selectedText });
                                        }
                                    }
                                }
                            }


                            //if (top.winOpen.highlightManager != undefined) {
                            //    cmp.highlights.push(JSON.stringify(top.winOpen.highlightManager.currentHighlight));
                            //    //if (Ext.isEmpty(cmp.sourceObj) || Ext.isEmptyObj(cmp.sourceObj)) {
                            //        //var dp = ExtractData.StudyLevel.getDataPointById(cmp.source, "0");
                            //        ExtractData.Highlights.pushHighlightData(cmp, top.winOpen.highlightManager.currentHighlight);
                            //    //}
                            //}
                            //else {
                            //    cmp.highlights.push(JSON.stringify(top.HighlightManager.currentHighlight));
                            //    //ExtractData.Highlights.addHighlight(this.dp.id, top.HighlightManager.currentHighlight);
                            //    ExtractData.Highlights.pushHighlightData(cmp, top.HighlightManager.currentHighlight);
                            //}
                        }

                        if (top.winOpen.highlightManager != undefined) {
                            cmp.highlights.push(JSON.stringify(top.winOpen.highlightManager.currentHighlight));
                            //ExtractData.Highlights.pushHighlightData(cmp, top.winOpen.highlightManager.currentHighlight);
                            Extract.Helper.Highlights.pushHighlightData(cmp, top.winOpen.highlightManager.currentHighlight);
                        }
                        else {
                            cmp.highlights.push(JSON.stringify(top.HighlightManager.currentHighlight));
                            //ExtractData.Highlights.pushHighlightData(cmp, top.HighlightManager.currentHighlight);
                            Extract.Helper.Highlights.pushHighlightData(cmp, top.HighlightManager.currentHighlight);
                        }

                        //else if (event.shiftKey) {
                        //    if (top.winOpen.highlightManager != undefined) {
                        //        cmp.highlights.push(JSON.stringify(top.winOpen.highlightManager.currentHighlight));
                        //        ExtractData.Highlights.pushHighlightData(cmp, top.winOpen.highlightManager.currentHighlight);
                        //    }
                        //    else {
                        //        cmp.highlights.push(JSON.stringify(top.HighlightManager.currentHighlight));
                        //        ExtractData.Highlights.pushHighlightData(cmp, top.HighlightManager.currentHighlight);
                        //    }
                        //    ////this.noteEl.show();
                        //    ////this.setNote(this.note + " " + currentHighlight.selectedText);
                        //    ////var cmp = this;
                        //    //redoLayout(cmp);
                        //}

                        if (top.winOpen.highlightManager != undefined) {
                            top.winOpen.highlightManager.currentHighlight = "";
                        }
                        else {
                            top.HighlightManager.currentHighlight = "";
                        }

                    }
                    if ((event.ctrlKey || event.shiftKey || event.metaKey) && !cmp.isNotHighlightCallout) {
                        if (cmp.highlights.length > 0) {
                            top.item = cmp;
                            ////cmp.addCls("inputHasHighlight");
                            //ExtractData.Highlights.setHighlightFieldColor(cmp, true);
                            Extract.Helper.Highlights.setHighlightFieldColor(cmp, true);
                            ////redoLayout(cmp);
                            if (!Ext.isEmpty(cmp.callouts)) {
                                if (cmp.callouts[0].isHidden() == false) {
                                    cmp.callouts[0].hide();
                                }
                            }
                            createHighlightCallout(cmp);
                        }
                        else {
                            //cmp.removeCls("inputHasHighlight");
                            Extract.Helper.Highlights.setHighlightFieldColor(cmp, false);
                        }
                    }

                    function redoLayout(item) {
                        var me = item;


                        if (me.xtype != 'htmleditor') {
                            while (true) {
                                //var d = Con.StudyPanel.studyLevel().body.dom;
                                me = me.up();
                                if (me.xtype == "fieldcontainer" || me.xtype == "fieldset" || me.xtype == "container" || me.xtype == "myNoteCallout" || me.xtype == "myGeneralCallout") {
                                    me.doLayout();
                                    //d.scrollTop = d.scrollHeight - d.offsetHeight + 20;
                                    break;
                                }
                            }
                        }
                    }
                    function createHighlightCallout(item) {
                        var highlightData = [];
                        for (var i = 0; i < item.highlights.length; i++) {
                            if (Utils.typeof(item.highlights[i]) == 'Object') {
                                //if (item.highlights[i]['refId'] == objTextParsing.currentActiveRefId) {
                                highlightData.push({ "displayText": item.highlights[i].selectedText, "rawText": JSON.stringify(item.highlights[i]), "refId": item.highlights[i].refId, "textColor": item.highlights[i].textColor });
                                //}
                            } else {
                                var obj = JSON.parse(item.highlights[i]);
                                //if (obj['refId'] == objTextParsing.currentActiveRefId) {
                                highlightData.push({ "displayText": obj.selectedText, "rawText": item.highlights[i], "refId": obj.refId, "textColor": obj.textColor });
                                //}
                            }
                        }
                        var me = item;
                        var callout = Ext.net.Callout.show(item,
                            {
                                xtype: "callout", hideDelay: 500, alignment: "bottomleft", trigger: "focus", closeOnOutsideClick: true, bodyWidget: {
                                    cls: "highlightlist", tpl: Ext.create("Ext.net.XTemplate", {
                                        html: ["<h3>Highlights</h3>", "<ul>", "<tpl for=\".\">", "<li>", "<div style='max-height: 80px; overflow-y: auto; overflow-x: hidden;'>{displayText}</div>", "</li>", "</tpl>", "</ul>", ""]
                                    }), width: 250, xtype: "dataview", itemSelector: "li", overItemCls: "highlightover",
                                    store: { autoLoad: false, fields: [{ name: "displayText" }, { name: "rawText" }, { name: "refId" }, { name: "textColor" }] }, trackOver: true, listeners: {
                                        itemclick: {
                                            fn: function (item, record, node, index, e) {
                                                top.isSetOnLoad = true;

                                                //In old highlight data, Refid didn't store, so RefId = Current RefId
                                                var refId = objTextParsing.currentActiveRefId;
                                                if (record.data.refId) {
                                                    refId = record.data.refId;
                                                }

                                                if (refId == objTextParsing.currentActiveRefId) {
                                                    var textColor = Extract.Helper.Highlights.getFieldColor(me);

                                                    var itemHdata = JSON.parse(record.data.rawText);
                                                    itemHdata.textColor = textColor;

                                                    top.HighlightManager.createHighlight(JSON.stringify(itemHdata));

                                                    top.HighlightManager.getElementInView(JSON.stringify(itemHdata));

                                                    if (me.setFieldStyle) {
                                                        me.setFieldStyle({ 'background-color': textColor });
                                                    }
                                                }
                                                //item.callout.calloutOwner.setValue(record.data.displayText);
                                                if (objTextParsing.isReadOnly) { // #6057
                                                    this.callout.events.beforehide.resume();
                                                }
                                                this.callout.itemclicked = true;
                                                if ((e.ctrlKey || e.metaKey) && !objTextParsing.isReadOnly) { // #6057
                                                    if (record.prevText) {
                                                        var id = JSON.parse(record.get("rawText")).highlightid;
                                                        for (var i = 0; i < me.highlights.length; i++) {
                                                            var data = '';
                                                            if (Utils.typeof(me.highlights[i]) == 'Object') {
                                                                data = me.highlights[i];
                                                            } else {
                                                                data = JSON.parse(me.highlights[i]);
                                                            }
                                                            if (!Ext.isEmpty(data)) {
                                                                if (data.highlightid == id) {
                                                                    me.highlights.splice(i, 1);
                                                                    var propType = 'Value';
                                                                    if (!Ext.isEmpty(me.dPFieldtoUpdate)) {
                                                                        propType = me.dPFieldtoUpdate;
                                                                    }

                                                                    //delete highlight from pdf
                                                                    var pdfContent = App.pdfViewer.iframe.dom.contentWindow;
                                                                    var divs = pdfContent.document.getElementsByClassName(id);
                                                                    if (divs) {
                                                                        $(divs).remove();
                                                                    }

                                                                    //ExtractData.Highlights.deleteFromHighlights(me.entity.id, propType, id);
                                                                    Extract.Helper.Highlights.deleteFromHighlights(me.entity.id, propType, id);
                                                                    if (App.studyTab.getActiveTab().id == "sparmoutcome") {
                                                                        if (!Ext.isEmpty(this.callout.calloutOwner.sourceNode) && !Ext.isEmpty(this.callout.calloutOwner.sourceNode.dataset)) {
                                                                            var callout = callOutManager.isExistCallout(this.callout.calloutOwner.sourceNode.dataset.calloutId);
                                                                            if (!Ext.isEmpty(callout)) {
                                                                                var outcome = callout.bodyWidget.outcome;
                                                                                var outcomeSet = callout.bodyWidget.outcomeSet;
                                                                                if (!Ext.isEmpty(outcome) && !Ext.isEmpty(outcomeSet)) {
                                                                                    OutcomeManager.setLocationColor(outcome, outcomeSet);
                                                                                }
                                                                            }
                                                                        }
                                                                    }

                                                                    break;
                                                                }
                                                            }
                                                        }
                                                        item.store.remove(record);
                                                        if (item.store.getCount() == 0) {
                                                            delete this.callout.itemclicked;
                                                            //me.removeCls("inputHasHighlight");
                                                            //ExtractData.Highlights.setHighlightFieldColor(me, false);
                                                            Extract.Helper.Highlights.setHighlightFieldColor(me, false);
                                                            if (me.studyDateItem) {
                                                                var highlightsData = Extract.Data.Highlights[me.entity.id];
                                                                var keys = [];
                                                                if (highlightsData) {
                                                                    keys = Object.keys(highlightsData);
                                                                }

                                                                if (keys.length == 0) {
                                                                    $('#' + me.studyDateItem.inputId).css({ 'background-color': "" });
                                                                    $('#' + me.studyDateItem.inputId).removeClass(me.studyDateItem.entity.id);
                                                                }
                                                            }
                                                            window.setTimeout(function () {
                                                                item.callout.hide();
                                                            }, 200);
                                                        }
                                                    }
                                                    else {
                                                        record.prevText = record.get("displayText");
                                                        record.set("displayText", "Ctrl+Click to Confirm Delete. Single Click to Undo.");
                                                    }
                                                }
                                                else {
                                                    if (record.prevText) {
                                                        var prevText = record.prevText;
                                                        delete record.prevText;

                                                        record.set("displayText", prevText);

                                                        node.classList.remove("highlightoverred");
                                                    }
                                                }
                                            }
                                        },
                                        itemupdate: {
                                            fn: function (record, index, node, index, e) {
                                                if (record.prevText) {
                                                    node.classList.add("highlightoverred");
                                                }
                                                else {
                                                    node.classList.remove("highlightoverred");
                                                }

                                            }
                                        },
                                    }
                                }, bodyStyle: "padding:2px 0px;",
                                listeners: {
                                    beforehide: {
                                        fn: function (item) {
                                            if (item.itemclicked) {
                                                delete item.itemclicked;
                                                item.calloutOwner.focus();
                                                return false;
                                            }
                                            top.HighlightManager.clearHighlight();
                                            if (ExtractData.IsHighlightonPDFPage) {
                                                Extract.Helper.Highlights.restoreHighlights();
                                            }
                                        }
                                    },
                                    hide: {
                                        buffer: 100,
                                        fn: function (item) {
                                            this.destroy();
                                        }
                                    }
                                }
                            }, true);

                        callout.bodyWidget.store.removeAll();
                        callout.bodyWidget.store.add(highlightData);
                        callout.show();
                        top.highlights = item.highlights;
                    }
                }
                else if (cmp.isHighlightSupport == false) {
                    Ext.Msg.show({
                        title: 'Highlight not supported',
                        msg: 'This field does not support highlight.',
                        buttons: Ext.Msg.OK, buttonText: { ok: "OK" },
                        icon: Ext.Msg.ERROR
                    });
                }


            }
        },

        pushHighlightData: function (item, highlightData) {
            var propType = 'Value';
            if (!Ext.isEmpty(item.dPFieldtoUpdate)) {
                propType = item.dPFieldtoUpdate;
            }
            //ExtractData.Highlights.addHighlight(item.entity.id, propType, highlightData);
            Extract.Helper.Highlights.createObject(item.entity.id, JSON.stringify(highlightData), propType);
        },

        addHighlight: function (entityId, propType, highlightObj) {

            if (Extract.Data.Highlights[entityId]) {
                var Obj = {};
                Obj.propType = propType;
                Obj.mainElementID = highlightObj.mainElementID;
                Obj.Coordinates = highlightObj.Coordinates;
                Obj.selectedText = highlightObj.selectedText;
                Obj.textColor = highlightObj.textColor;
                Obj.refId = highlightObj.refId;
                Obj.isStrikeThrough = highlightObj.isStrikeThrough;
                Obj.textComment = highlightObj.textComment;
                Obj.highlightid = highlightObj.highlightid;


                Extract.Data.Highlights[entityId][Obj.highlightid] = Obj;

                this.updateData(entityId, Obj.highlightid, Obj);
            }
            else {
                Extract.Helper.Highlights.createObject(entityId, JSON.stringify(highlightObj), propType);
            }

        },

        getHighlight: function (entityId, propType) {
            var me = this;
            var source = me.getByEntityId(entityId, propType);
            // var source = [];
            //for (var i = 0; i < this.Data.length; i++) {
            //    if (this.Data[i].entityId == entityId && this.Data[i].propType == propType) {
            //        source = this.Data[i];
            //        break;
            //    }
            //}
            return source;
        },

        setHighlights: function (data) {
            var me = this;
            for (var hkey in Extract.Data.Highlights) {
                var hData = Extract.Data.Highlights[hkey];
                for (var key in hData) {
                    if (Ext.isEmpty(hData[key]['refId'])) {
                        hData[key]['refId'] = objTextParsing.refId;
                        me.updateData(hkey, key, hData[key]);
                    }
                }
            }
        },

        restoreHighlights: function () {
            var me = this;
            top.isSetOnLoad = true;
            var arr = [];
            for (var hkey in Extract.Data.Highlights) {
                var hData = Extract.Data.Highlights[hkey];
                for (var key in hData) {
                    //In old highlight data, Refid didn't store, so RefId = Current RefId
                    var refId = objTextParsing.currentActiveRefId;
                    if (hData[key]['refId']) {
                        refId = hData[key]['refId'];
                    }

                    var str = refId;
                    $.each(hData[key].Coordinates, function (k, coord) {
                        str += "-" + coord.height + "-" + coord.left + "-" + coord.rotate + "-" + coord.scale + "-" + coord.top + "-" + coord.width;
                    });

                    if (refId == objTextParsing.currentActiveRefId && arr.indexOf(str) == -1) {
                        arr.push(str);
                        top.HighlightManager.restoreHighlight(JSON.stringify(hData[key]), hkey, hData[key].propType);
                    }
                }
            }
            top.isSetOnLoad = false;
        },

        deleteFromHighlights: function (entityId, propType, highlightId) {
            var me = this;
            me.deleteData(entityId, highlightId);
            //var source = me.getHighlight(entityId, propType);
            //if (!Ext.isEmpty(source)) {
            //    for (var i = 0; i < source.highlightData.length; i++) {
            //        var data = source.highlightData[i];
            //        if (data.highlightid == highlightId) {
            //            source.highlightData.splice(i, 1);
            //            break;
            //        }
            //    }
            //    //if (!Ext.isEmpty(this.Data)) {
            //    //    Request.Study.insertHighlightText(JSON.stringify(this.Data), objTextParsing.taskId);
            //    //}
            //}
        },

        setHighlightFieldColor: function (item, isAddCls) {
            var me = this;
            if (!Ext.isEmpty(item) && !Ext.isEmptyObj(item)) {
                if (['myFullScreenTextArea', 'tinymce_textarea'].indexOf(item.xtype) > -1) {
                    if (!Ext.isEmpty(item.bodyEl)) {
                        var _itm = $(item.bodyEl.dom).find('.mce-toolbar-grp');
                        if (_itm.length > 0) {
                            if (isAddCls) {
                                var highlights = Extract.Data.Highlights[item.entity.id];
                                if (highlights) {

                                    var textColor = this.getFieldColor(item);

                                    $.each(Object.keys(Extract.Data.Highlights[item.entity.id]), function (i, key) {
                                        me.updateData(item.entity.id, key, { textColor: textColor });
                                        var pdfContent = App.pdfViewer.iframe.dom.contentWindow;
                                        var divs = pdfContent.document.getElementsByClassName(key); //pdfContent.$("."+hId+"");
                                        if (divs.length > 0) {
                                            $.each(divs, function (i, div) {
                                                div.style.backgroundColor = textColor;
                                            });
                                        }
                                    });

                                    $('#' + _itm[0].id).css({ 'background-color': textColor });
                                    $('#' + _itm[0].id).addClass(item.entity.id);
                                    $('#' + item.inputId)[0].setAttribute("dPFieldtoUpdate", item.dPFieldtoUpdate);
                                }

                            } else {
                                $('#' + _itm[0].id).css({ 'background-color': "" });
                            }
                        }
                    }
                } else {
                    if (!Ext.isEmpty(item.inputId)) {
                        if (isAddCls) {
                            var highlights = Extract.Data.Highlights[item.entity.id];
                            if (highlights) {

                                var textColor = this.getFieldColor(item);

                                $.each(Object.keys(Extract.Data.Highlights[item.entity.id]), function (i, key) {
                                    me.updateData(item.entity.id, key, { textColor: textColor });
                                    var pdfContent = App.pdfViewer.iframe.dom.contentWindow;
                                    var divs = pdfContent.document.getElementsByClassName(key); //pdfContent.$("."+hId+"");
                                    if (divs.length > 0) {
                                        $.each(divs, function (i, div) {
                                            div.style.backgroundColor = textColor;
                                        });
                                    }
                                });


                                $('#' + item.inputId).css({ 'background-color': textColor });
                                $('#' + item.inputId).addClass(item.entity.id);
                                $('#' + item.inputId)[0].setAttribute("dPFieldtoUpdate", item.dPFieldtoUpdate);
                            }
                        } else {
                            $('#' + item.inputId).css({ 'background-color': "" });
                        }
                    }
                }
            }
        },

        getFieldColor: function (item) { // added by Jignesh
            var textColor = "";
            if (App.studyTab.activeTab.title == "Study Level" && $.isEmptyObject(item.sourceObj)) {
                var parent = item.up();
                if (parent && (parent.source == "Study_Exculsion_Criteria" || parent.source == "Study_Inclusion_Criteria")) { //(item.dp.Name == "Inclusion Criteria" || item.dp.Name=="Exclusion Criteria" || item.dp.Name=="Author Definition" || item.dp.Name=="Category")
                    textColor = objTextParsing.fieldHighlight.studyInclusionExclusion;
                }
                else {
                    textColor = objTextParsing.fieldHighlight.studyLevelAllOtherFields;
                }
            }
            else if (App.studyTab.activeTab.title == "Group / Results" || (App.studyTab.activeTab.title == "Study Level" && !$.isEmptyObject(item.sourceObj))) {
                var sourceName = "", isMatched = false, dpName = item.dpName, dpName1 = "";
                if (item.entity) {
                    dpName1 = item.entity.Name;
                }
                var arrGroups = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Groups);
                if (dpName || dpName1) {
                    //$.each(arrGroups, function (i, objGroup) {
                    //    $.each(objGroup.Sources, function(j,objSource){
                    //        $.each(objSource.Datapoints, function(k,objDp){
                    //            if(objDp.Name == dpName || objDp.Name == dpName1){
                    //                sourceName = objSource.sourcename;
                    //                isMatched = true;
                    //                return false;
                    //            }
                    //        });
                    //    });
                    //});

                    $.each(arrGroups, function (i, objGroup) {
                        for (var key in objGroup.Sources) {
                            var objSource = Extract.Helper.getSourceOthers(objGroup, key);
                            $.each(objSource.Datapoints, function (k, objDp) {
                                if (objDp.Name == dpName || objDp.Name == dpName1) {
                                    sourceName = objSource.sourcename;
                                    isMatched = true;
                                    return false;
                                }
                            });
                        }
                    });

                    if (!isMatched) {
                        $.each(arrGroups, function (i, objGroup) {
                            var arrParticipants = Extract.Helper.getEntityListByArrayId(objGroup.Participants);
                            $.each(arrParticipants, function (j, objParticipants) {
                                if (objParticipants.Gender == dpName || objParticipants.Gender == dpName1) {
                                    sourceName = "Participants";
                                    isMatched = true;
                                    return false;
                                }
                            });
                        });
                    }

                    if (!isMatched || item.name == "medUnit") {
                        $.each(arrGroups, function (i, objGroup) {
                            var arrInterventionSets = Extract.Helper.getEntityListByArrayId(objGroup.InterventionSets, Extract.EntityTypes.InterventionSets);

                            $.each(arrInterventionSets, function (j, objInterventionSet) {
                                for (var key in objInterventionSet.Sources) {
                                    var objSource = Extract.Helper.getSourceOthers(objInterventionSet, key);
                                    $.each(objSource.Datapoints, function (l, objDp) {
                                        if (objDp.Name == dpName || objDp.Name == dpName1) {
                                            sourceName = "InterventionSets";
                                            isMatched = true;
                                            return false;
                                        }
                                    });
                                }

                                var arrInterventions = Extract.Helper.getEntityListByArrayId(objInterventionSet.Interventions, Extract.EntityTypes.Interventions);

                                $.each(arrInterventions, function (m, objIntervention) {
                                    for (var key in objIntervention.Sources) {
                                        var objSource = Extract.Helper.getSourceOthers(objIntervention, key);
                                        $.each(objSource.Datapoints, function (k, objDp) {
                                            if (objDp.Name == dpName || objDp.Name == dpName1) {
                                                sourceName = "InterventionSets";
                                                isMatched = true;
                                                return false;
                                            }
                                        });
                                    }
                                });



                            });
                        });
                    }

                    if (isMatched) {
                        if (sourceName == "InterventionSets" || sourceName == "Additional_Information") {
                            textColor = objTextParsing.fieldHighlight.groupIntervationInfo;
                        }
                        else {
                            textColor = objTextParsing.fieldHighlight.groupAllOtherFields;
                        }
                    }
                    else {
                        if (dpName == "Dosage Frequency" || dpName == "Frequency Unit" || dpName == "Timepoint Name" || dpName == "Timepoint Value" || dpName == "Misc" || dpName1 == "Dosage Frequency" || dpName1 == "Frequency Unit" || dpName1 == "Timepoint Name" || dpName1 == "Timepoint Value" || dpName1 == "Misc") {
                            textColor = objTextParsing.fieldHighlight.groupIntervationInfo;
                        }
                        else {
                            textColor = objTextParsing.fieldHighlight.resultsAllFields;
                        }
                    }
                }
                else {
                    textColor = objTextParsing.fieldHighlight.resultsAllFields;
                }
            }
            else if (App.studyTab.activeTab.title == "EoD") {
                textColor = objTextParsing.fieldHighlight.eodFields;
            }

            return textColor;
        },

        getHighlightDataById: function (entityId, propType, data) {
            var me = this;
            var source = me.getByEntityId(entityId, propType, data);
            return source;
        },

        getHighlightById: function (entityId, data) {
            var me = this;
            var source = me.getByEntityId(entityId, "", data);
            //for (var i = 0; i < this.Data.length; i++) {
            //    if (this.Data[i].entityId == entityId) {
            //        source.push(this.Data[i]);
            //    }
            //}
            return source;
        },

        deleteFromHighlightsByEntityId: function (entityId) {
            var me = this;
            me.deleteEntity(entityId);

            var pdfContent = App.pdfViewer.iframe.dom.contentWindow;
            var divs = pdfContent.document.getElementsByClassName("singlehighlight");
            if (divs) {
                $(divs).remove();
            }
            Extract.Helper.Highlights.restoreHighlights();

            //for (var i = 0; i < this.Data.length; i++) {
            //    if (this.Data[i].entityId == entityId) {
            //        this.Data.splice(i, 1);
            //        break;
            //    }
            //}
        },

        updateEntityId: function (oldEntityId, newEntityId) {

            var me = this;

            if (!Extract.Data.Highlights || !Extract.Data.Highlights[oldEntityId])
                return;

            //Extract.Data.Highlights[newEntityId] = Ext.decode(Ext.encode( Extract.Data.Highlights[oldEntityId]));

            Extract.Helper.setEntity(Extract.EntityTypes.Highlights, newEntityId, Extract.Data.Highlights[oldEntityId]);
            me.deleteEntity(oldEntityId);
        }

        //deleteFromHighlightsByEntityId_FR: function (entityId) { // For frequency report
        //    var dataLength = this.Data.length;
        //    for (var i = 0; i < dataLength; i++) {
        //        if (this.Data[i].entityId == entityId) {
        //            this.Data.splice(i, 1);
        //            --i; // retain to current index because current index deleted above. 
        //            dataLength = this.Data.length; // Reset data length
        //        }
        //    }
        //}
        //#endregion
    },


    //get source for only Frequency report location column. 
    FR: {

        createDummyDatapoint: function (dpId, ValueType, Name, Value, state, Row, Column) {
            // return if exist 
            if (Extract.Data.Datapoints[dpId]) {
                return Extract.Data.Datapoints[dpId];
            }
            var dp = Extract.Create.DataPointsFRDummy(dpId, ValueType, Name, Value, state, Row, Column);
            this.addFRLocationDPToDatapoints(dp); // Pushed to firebase 
            Extract.Data.Datapoints[dp.id] = dp;
            return dp;
        },

        getFRLocationSource: function (dpId, source, sourceName, isAddNewDP, value) {
            var me = this;
            var obj;
            for (var key in source) {
                if (key == sourceName) {
                    obj = source[key];
                    if (isAddNewDP) {
                        dp = me.createFRLocationDatapointAddToSource('memo', '', value, 1, 1, 1, Extract.EntityTypes.Datapoints, dpId, sourceName);// ExtractData.VALUETYPE.MEMO, '', '', ExtractData.STATE.ADDED, 1, 1);
                        obj.push(dp.id);
                        return dp.id;
                    }
                    break;
                }
            }
            if (obj == (undefined || null)) {
                obj = {};
                obj[sourceName] = [];

                dp = me.createFRLocationDatapointAddToSource('memo', '', '', 1, 1, 1, Extract.EntityTypes.Datapoints, dpId, sourceName); //ExtractData.Create.DataPoint(ExtractData.VALUETYPE.MEMO, '', '', ExtractData.STATE.ADDED, 1, 1);
                obj[sourceName].push(dp.id);
                return obj[sourceName];
            }
            return obj;
        },

        getFRLocationSourceFromSourceName: function (dpId, sourceName) {
            var me = this;
            var obj = {};
            obj.sourcename = sourceName;
            obj.Datapoints = [];

            if (Extract.Data.Datapoints[dpId]) {
                var dp = Extract.Data.Datapoints[dpId];
                if (dp.Location && dp.Location[sourceName]) {
                    var dpList = Extract.Helper.getEntityListByArrayId(dp.Location[sourceName], Extract.EntityTypes.Datapoints);
                    obj.Datapoints = dpList;
                    return obj;
                }
            }
            return obj;
        },

        createFRLocationDatapointAddToSource: function (ValueType, Name, Value, state, Row, Column, type, typeId, sourceName) {

            var me = this;

            var dp = Extract.Create.DataPoints(ValueType, Name, Value, state, Row, Column);

            me.addFRLocationDPToSource(type, typeId, sourceName, dp);
            me.addFRLocationDPToDatapoints(dp);

            return dp;
        },

        addFRLocationDPToSource: function (type, typeId, sourceName, dp) {

            var sourceObj = {};

            if (!Extract.Data[type])
                Extract.Data[type] = {};

            if (!Extract.Data[type][typeId]["Location"]) {
                Extract.Data[type][typeId]["Location"] = {};
            }
            if (!Extract.Data[type][typeId]["Location"][sourceName]) {
                Extract.Data[type][typeId]["Location"][sourceName] = [];
            }
            sourceObj = Extract.Data[type][typeId]["Location"][sourceName];
            sourceObj.push(dp.id);
            //code to add id in particular source, inteven,set,group,out,oset,ogv, get path with their id then
            //groups/id/source/sourcename

            var path = Utils.getFRLocationPath(Extract.studyId, type, typeId, "Location", sourceName);

            //array getting converted to object when 0th element is removed
            //Extract.Core.pushDataToPath(path + "/" + id, obj.id);
            Extract.Core.pushDataToPath(path, sourceObj);
        },

        addFRLocationDPToDatapoints: function (dpObj) {

            if (!Extract.Data.Datapoints) {
                Extract.Data.Datapoints = {};
            }

            Extract.Helper.setEntity(Extract.EntityTypes.Datapoints, dpObj.id, dpObj);
            Extract.Data.Datapoints[dpObj.id] = dpObj;
        },

        cloneFRLocationDP: function (dpId, oldLocationDP) {

            var me = this;
            var type = Extract.EntityTypes.Datapoints;
            var typeId = dpId;
            var sourceName = "";
            Extract.Helper.FR.deleteFRLocationDP(dpId, true); // Remove Location data. 

            if (!Extract.Data || !Extract.Data.Datapoints || !Extract.Data.Datapoints[dpId]) {
                return null;
            }

            for (var key in oldLocationDP) {
                sourceName = key;

                for (var i = 0; i < oldLocationDP[key].length; i++) {
                    var oldDp = Extract.Data.Datapoints[oldLocationDP[key][i]];

                    if (!oldDp)
                        continue;

                    me.createFRLocationDatapointAddToSource(oldDp.ValueType, oldDp.Name, oldDp.Value, oldDp.state, oldDp.Row, oldDp.Column, type, typeId, sourceName);
                }
            }

            return Extract.Data.Datapoints[dpId];
        },

        deleteFRLocationDP: function (dpId, deleteFRDP) {

            if (!Extract.Data || !Extract.Data.Datapoints || !Extract.Data.Datapoints[dpId]) {
                return null;
            }

            var dpToDelete = Extract.Data.Datapoints[dpId];

            if (dpToDelete["Location"]) {
                for (var key in dpToDelete["Location"]) {
                    source = dpToDelete["Location"][key];

                    for (var i = 0; i < source.length; i++) {
                        Extract.Helper.deleteEntity(Extract.EntityTypes.Datapoints, source[i]);
                    }
                }
            }
            if (!deleteFRDP) { // if have not get deleteFRDP then remove FR DP
                Extract.Helper.deleteEntity(Extract.EntityTypes.Datapoints, dpId);
            }
        }
    },
    WarningReport: {
        removeWarningData: function (type) {
            //Remove all data
            var path = Utils.getDeleteEntityPath(Extract.refId, type);
            Extract.Core.pushDataToPath(path, {});
            if (Extract.Data[type]) {
                Extract.Data[type] = {};
            }
        },
        addWarningReport: function (msg) {
            // Add single message
            var uniqueId = Utils.getUniqueId();
            var path = Utils.setDBPath(Extract.refId, Extract.EntityTypes.WarningReports, uniqueId);//Utils.getDeleteEntityPath(Extract.refId, Extract.EntityTypes.WarningReports);
            Extract.Core.pushDataToPath(path, msg);
            if (!Extract.Data.WarningReports) {
                Extract.Data.WarningReports = {};
            }
            Extract.Data.WarningReports[uniqueId] = msg;
        },
        addWarningDismissReportObj: function (Obj) {
            // Add single message
            var uniqueId = Utils.getUniqueId();
            var path = Utils.setDBPath(Extract.refId, Extract.EntityTypes.WarningDismissReports, uniqueId);//Utils.getDeleteEntityPath(Extract.refId, Extract.EntityTypes.WarningReports);
            Extract.Core.pushDataToPath(path, Obj);
            if (!Extract.Data.WarningDismissReports) {
                Extract.Data.WarningDismissReports = {};
            }
            Extract.Data.WarningDismissReports[uniqueId] = Obj;
        },
        // Delete dismissWarningReport
        deleteWarningData: function (type, uniqeId) {
            Extract.Helper.deleteEntity(type, uniqeId);
        }


    },

    ImportFunctions: {
        permanentMigration: function () {
            var me = this;

            Extract.Core.openStudy(112233, "", "migration").then(function (res) {

                try {

                    Extract.Data = res;

                    var oldData = Extract.Data;

                    if (Extract.Data.oldData && Extract.Data.oldData.length > 0)
                        oldData = Extract.Data.oldData;

                    //var studyLevel = oldData[0];
                    //var groups = oldData[1];
                    //var outcomes = oldData[2];
                    //var phases = oldData[3];
                    //var propertySets = oldData[4];

                    //me.updateStudylevel(studyLevel);
                    //me.updateGroups(groups);
                    //me.updateOutcomes(outcomes, phases);
                    //me.updatePhases(phases);
                    //me.updatePropertySets(propertySets, groups);
                    oldData = me.updateStudyWithPermanentMigration(oldData);

                    return Ext.encode(oldData);
                }
                catch (ex) {
                    console.log(ex);
                }

            });
        },

        updateStudyWithPermanentMigration: function (studyDataOldFormat) {
            var me = this;
            var helper = Extract.Helper;

            var studyLevel = helper.getObjectFromName(studyDataOldFormat, Extract.EntityTypes.StudyLevel);
            var groups = helper.getObjectFromName(studyDataOldFormat, Extract.EntityTypes.Groups);
            var outcomes = helper.getObjectFromName(studyDataOldFormat, Extract.EntityTypes.Outcomes);
            var phases = helper.getObjectFromName(studyDataOldFormat, Extract.EntityTypes.Phases);
            var propertySets = helper.getObjectFromName(studyDataOldFormat, Extract.EntityTypes.PropertySets);

            me.updateStudylevel(studyLevel);
            me.updateGroups(groups);
            me.updateOutcomes(outcomes, phases);
            me.updatePhases(phases);
            me.updatePropertySets(propertySets, groups);

            return studyDataOldFormat;
        },

        updateStudylevel: function (studyLevel) {
            var me = this;

            me.updateStudylevelDatapoints(studyLevel);
            me.updateGroupsToSetArrayInIncExc(studyLevel);

            me.updateNinSetting(studyLevel);
            me.updateStudyType(studyLevel);
            me.updateStudyDesign(studyLevel);
            me.updateStudyLocation(studyLevel);
            me.updatephaseInEoD(studyLevel);
            me.updatePFinEoD(studyLevel);
            //Con.StudyFrequency.setPFValue();

        },

        updateStudylevelDatapoints: function (studyLevel) {
            var unifiedRegistryNameValue = "";
            var addNewAcronymRegistrySource = false;
            var listStudyDesigns = [];

            for (var i = 0; i < studyLevel.data.length; i++) {

                var source = studyLevel.data[i];
                var sourcename = source.sourcename;

                if (!source.Datapoints)
                    source.Datapoints = [];

                for (var j = 0; j < source.Datapoints.length; j++) {

                    var dp = source.Datapoints[j];
                    if (!dp)
                        continue;

                    //Change Location Name value to string if its an array : 7 Jan 2015 
                    if (!Ext.isEmpty(dp.Name) && dp.Name.toString() == "Location Name") {
                        if (typeof (dp.Value) == "object") {
                            dp.Value = dp.Value.join(',');
                        }
                    }

                    //if source name is Frequency_Report and datapoint name contains Intervention/Group then set numValue to 1 : 28 Jan 2016
                    //if (sourcename != null && sourcename == "Frequency_Report") {
                    //    dp.numValue = Ext.isEmpty(dp.numValue) ? "0" : dp.numValue;
                    //    if (!Ext.isEmpty(dp.Name) && dp.Name.toString().indexOf("Intervention/Group") > -1) {
                    //        dp.numValue = "1";
                    //    }
                    //}

                    //Get Unify registry name / acronym fields : https://github.com/DoctorEvidence/DocExtract/issues/1620 : 24 Nov 2016
                    if (!Ext.isEmpty(dp.Name) && (dp.Name.toString() == "Patient Database/Registry Source" || dp.Name.toString() == "Trial Acronym")) {
                        addNewAcronymRegistrySource = true;
                        if (dp.Value != null && dp.Value.toString().trim() != "") {
                            unifiedRegistryNameValue = (unifiedRegistryNameValue == "") ? dp.Value.toString() : " : " + dp.Value.toString();
                        }
                    }
                }

                //Unify registry name / acronym fields : https://github.com/DoctorEvidence/DocExtract/issues/1620 : 24 Nov 2016
                if (sourcename != null && sourcename == "Study_Setting") {
                    //Remove old datapoints

                    if (!source.Datapoints)
                        source.Datapoints = [];

                    for (var k = source.Datapoints.length - 1; k >= 0; k--) {
                        var oldDp = source.Datapoints[k];
                        var oldDpId = oldDp.id;

                        if (!Ext.isEmpty(dp.Name) && oldDp.Name == null)
                            continue;

                        var dpname = oldDp.Name.toString().toLowerCase();
                        if (dpname == "patient database/registry source" || dpname == "patient database/registry source-old" || dpname == "trial acronym-old" || dpname == "trial acronym") {
                            var index = source.Datapoints.indexOf(oldDp);
                            if (index > -1) {
                                source.Datapoints.splice(index, 1);
                            }
                        }
                    }
                    //Add new Datapoint
                    if (addNewAcronymRegistrySource) {
                        var newDp = Extract.Create.DataPoints("memo", "Acronym/Source Population", unifiedRegistryNameValue, 1, 1, 1);

                        if (!source.Datapoints)
                            source.Datapoints = [];

                        source.Datapoints.push(newDp);
                    }
                }

            }
        },

        updateGroupsToSetArrayInIncExc: function (studyLevel) {
            for (var i = 0; i < studyLevel.data.length; i++) {

                var source = studyLevel.data[i];

                if (source.sourcename != "Study_Inclusion_Criteria" && source.sourcename != "Study_Exculsion_Criteria") {
                    continue;
                }

                if (!source.Datapoints)
                    source.Datapoints = [];

                //if only single datapoint then only convert value to array and add datapoints
                if (source.Datapoints.length > 1)
                    continue;

                var dPCount = 1;
                var listValue = [];
                var firstDpName = "";

                for (var j = 0; j < source.Datapoints.length; j++) {

                    var dp = source.Datapoints[j];
                    if (!dp)
                        continue;

                    if (dp.Value != null && dp.Value.toString().trim() != "") {

                        listValue = this.getArrayFromDpValue(dp.Value.toString().trim());

                        if (listValue.length > 0)
                            dp.Value = listValue[0];
                        //dp.Value = listValue.ToArray();
                    }

                    firstDpName = dp.Name.toString();

                }//for lool of studyLevel.Datapoints 

                //create new datapoints for list array
                for (var k = 0; k < listValue.length; k++) {

                    var strValue = listValue[k];

                    if (strValue.trim() == "")
                        continue;

                    var newDp = new DocDtoExtractDatapoint();

                    if (dPCount != 1) {
                        newDp = Extract.Create.DataPoints("Memo", firstDpName, strValue, 1, dPCount, 1, "");
                        source.Datapoints.Add(newDp);
                    }

                    newDp = createDataPoint("Memo", "Author Definition", "", 1, dPCount, 2, "");
                    source.Datapoints.Add(newDp);

                    newDp = createDataPoint("Memo", "Category", "", 1, dPCount, 3, "");
                    source.Datapoints.Add(newDp);

                    dPCount++;
                }

            }//for lool of studyLevel 

        },

        getArrayFromDpValue: function (value) {

            var incExcData = value != null ? value.toString() : "";
            incExcData = incExcData.replace("<ul><li>", "").replace("</li></ul>", "");
            incExcData = incExcData.split("</li><li>");

            var list = [];
            for (var i = 0; i < incExcData.length; i++) {

                var data = incExcData[i];
                if (Ext.isEmpty(data)) {
                    list.push(data);
                }
            }
            return list;
        },

        getDatapoints: function (studylevel, sourcename) {
            var _datapoints = [];
            for (var i = 0; i < studylevel.data.length; i++) {
                if (studylevel.data[i].sourcename == sourcename) {
                    _datapoints = studylevel.data[i].Datapoints;
                    break;
                }
            }
            return _datapoints;
        },

        updateNinSetting: function (studylevel) {
            //var _sl = studylevel.data.map(function (a) { return a.Datapoints.filter(function (a) { a.Name == "N/% or Avg" }) }).filter(function (b) { b.length > 0 });
            var _sl = studylevel.data.map(function (a) { return a.Datapoints.filter(b => b.Name == "N/% or Avg") }).filter(c => c.length > 0);
            for (var i = 0; i < _sl.length; i++) {
                for (var j = 0; j < _sl[i].length; j++) {
                    var dp = _sl[i][j];
                    if (!Ext.isEmpty(dp.Value) && Utils.typeof(dp.Value) == "Array") {
                        for (var k = 0; k < dp.Value.length; k++) {
                            if (dp.Value[k].Name == "N") {
                                dp.Value[k].Name = "n";
                            }
                        }
                    }
                    dp.Name = "n/% or Avg";
                }
            }
        },

        updateStudyType: function (studylevel) {
            var me = this;

            var datalist = me.getDatapoints(studylevel, 'Study_Type');
            for (var i = 0; i < datalist.length; i++) {
                var dp = datalist[i];
                if (dp.Name == 'Study Subtype') {
                    if (dp.Value == 'Device/Surgery') {
                        dp.Value = 'Device';
                    } else if (dp.Value == 'Behavioral/Counseling') {
                        dp.Value = 'Behavioral';
                    }
                }
            }
        },

        updateStudyDesign: function (studylevel) {
            //SohebRapati-01.May.2017--Git-https://github.com/DoctorEvidence/DocExtract/issues/3246
            //-----Study Design dropdown: rename designs #3246
            var _stdsnDPs = [];
            for (var i = 0; i < studylevel.data.length; i++) {
                var sDes = studylevel.data[i];
                var s = sDes.sourcename;
                if (!Ext.isEmpty(sDes.sourcename)) {
                    if (sDes.sourcename.indexOf('StudyDesign_') > -1) {
                        var lst = $.grep(sDes.Datapoints, function (e) {
                            return e.Row < 50;
                        });
                        if (lst.length == 0) {
                            studylevel.data.splice(i, 1);
                            i--;
                        } else {
                            _stdsnDPs.push(sDes.Datapoints);
                        }
                    }
                }
            }

            for (var i = 0; i < _stdsnDPs.length; i++) {
                var _dpList = _stdsnDPs[i];
                for (var j = 0; j < _dpList.length; j++) {
                    var dp = _dpList[j];
                    if (dp.Name == 'Study Design') {
                        if (!Ext.isEmpty(dp.Value)) {
                            switch (dp.Value) {
                                case "Cross-Sectional":
                                    dp.Value = "Cross Sectional Study";
                                    break;
                                case "Descriptive Review":
                                    dp.Value = "Literature Review";
                                    break;
                                case "Study Design Overview":
                                    dp.Value = "Non-Comparative, Other";
                                    break;
                                case "Ambispective Observational":
                                    dp.Value = "Cohort Study";
                                    break;
                                case "Non-Randomized Crossover":
                                    dp.Value = "Non-Randomized Controlled Trial";
                                    break;
                                case "Prospective Observational":
                                    dp.Value = "Prospective Cohort Study";
                                    break;
                                case "Focus Groups":
                                    dp.Value = "Qualitative Research";
                                    break;
                                case "Non-Randomized Non-Controlled Trial":
                                    //dp.Value = "Uncontrolled Clinical Trial";
                                    dp.Value = "Non-Controlled Clinical Trial";
                                    break;
                                case "Retrospective Observational":
                                    dp.Value = "Retrospective Cohort Study";
                                    break;
                            }
                        }
                    } else if (dp.Name == 'Randomization Method') {
                        if (dp.Value == "NR") {
                            dp.Value = "Not Reported";
                        }
                    }
                }
            }
        },

        updateStudyLocation: function (studylevel) {
            // updated Location name to string rather than Array
            var me = this;
            var datalist = me.getDatapoints(studylevel, 'Study_Setting_Location_Type');
            for (var i = 0; i < datalist.length; i++) {
                var dp = datalist[i];
                if (dp.Name == 'Location Name' && Utils.typeof(dp.Value) == "Array") {
                    if (dp.Value.length > 0) {
                        dp.Value = dp.Value[0];
                    }
                }
            }
        },

        updatephaseInEoD: function (studylevel) {
            var me = this;
            var datalist = me.getDatapoints(studylevel, 'Frequency_Report');

            for (var i = 0; i < datalist.length; i++) {
                var dp = datalist[i];
                if (Utils.typeof(dp.Phase) == "Array") {
                    if (Ext.isEmpty(dp.Phase.join(",")) || dp.Phase.join(",") == "&nbsp;") {
                        dp.Phase = "";
                    } else {
                        var idx = dp.Phase.indexOf("&nbsp;");
                        if (idx != -1) {
                            dp.Phase.splice(idx, 1);
                        }
                    }
                }
                //Remove Statistics ,Inclusion and Exclusion because it was used previously. 
                if (Utils.typeof(dp.Name) == "Array" && !Ext.isEmpty(dp.Name)) {
                    var arrRemove = ['Statistics', 'Inclusion', 'Exclusion']; //Remove word from Name
                    for (var row = 0; row < arrRemove.length; row++) {
                        var idx = dp.Name.indexOf(arrRemove[row]);
                        if (idx > -1) {
                            dp.Name.splice(idx, 1);
                        }
                    }
                }
            }
        },

        getFRTagDP: function (studylevel) {
            var me = this;
            var dpListFRTag = me.getDatapoints(studylevel, 'Frequency_Report_Tags');
            var dp = {};
            if (dpListFRTag.length > 0) {
                var FRTagDp = $.grep(dpListFRTag, function (e) {
                    return e.Name != "Study Design";
                });
                if (FRTagDp.length > 0) {
                    dp = FRTagDp[0];
                }
            }
            if (dpListFRTag.length > 0) {
                dp = dpListFRTag[0];
            }
            return dp;
        },

        updatePFinEoD: function (studylevel) {
            var me = this;
            var _FRTgDP = me.getFRTagDP(studylevel), _isFRValExist = false;
            var datalist = me.getDatapoints(studylevel, 'Frequency_Report');
            for (var i = 0; i < datalist.length; i++) {

                var dp = datalist[i];
                if (!me.checkFRDP(dp)) {
                    _isFRValExist = true;
                    break;
                }
            }
            if (_isFRValExist && !Ext.isEmptyObj(_FRTgDP) && Ext.isEmpty(_FRTgDP["type"])) {
                _FRTgDP["type"] = "P";
            } else {
                if (!_isFRValExist && !Ext.isEmptyObj(_FRTgDP) && !Ext.isEmpty(_FRTgDP["type"])) {
                    _FRTgDP["type"] = "";
                }
            }
        },

        checkFRDP: function (dp) {
            var isDPValueEmpty = true;
            for (var key in dp) {
                if (key == "Name" || key == "Value" || key == "subGroup") {  //|| key == "numValue"
                    if (key == "Name") {
                        if (Utils.typeof(dp.Name) == "Array") {
                            if (dp.Name.join(',') != '') {
                                isDPValueEmpty = false;
                                break;
                            }
                        }
                    } else {
                        if (!Ext.isEmpty(dp[key])) {
                            isDPValueEmpty = false;
                            break;
                        }
                    }
                }
            }
            return isDPValueEmpty;
        },



        updateGroups: function (groups) {
            var me = this;

            me.updateSubgroupText(groups);
            me.updateGroupsUIFunctions(groups);
        },

        updateSubgroupText: function (groups) {

            for (var i = 0; i < groups.data.length; i++) {
                var grp = groups.data[i];

                for (var j = 0; j < grp.Sources.length; j++) {

                    var src = grp.Sources[j];
                    if (src.sourcename != "Subgroups")
                        continue;

                    if (!src.Datapoints)
                        src.Datapoints = [];

                    for (var k = 0; k < src.Datapoints.length; k++) {

                        var dp = src.Datapoints[k];

                        if (dp.Name != null && dp.Name.toString().indexOf("This study arm is a subgroup of the following characteristic/outcome") > -1) {
                            dp.Name = "This is a subgroup of";
                        }
                    }
                }
            }
        },

        //overlapping population, subgroup link id
        updateGroupsUIFunctions: function (groups) {
            var me = this;
            for (var i = 0; i < groups.data.length; i++) {
                //if (i == 0) {
                var srcs = groups.data[i].Sources;
                for (var j = 0; j < srcs.length; j++) {
                    if (srcs[j].sourcename == "Overlaping_Population") {
                        var dpList = srcs[j].Datapoints;

                        if (!dpList)
                            dpList = [];

                        for (var k = 0; k < dpList.length; k++) {
                            var dp = dpList[k];
                            if (dp.Name == "Overlapping Population?") {
                                if (!Ext.isEmpty(dp.Value)) {
                                    if (Utils.typeof(dp.Value) == "Array" && !Ext.isEmpty(dp.Value.toString())) {
                                        var lstVal = dp.Value;
                                        var lstObj = [];
                                        for (var l = 0; l < lstVal.length; l++) {
                                            if (Utils.typeof(lstVal[l]) == "String") {
                                                var grpId = me.getGroupIdFromGroupName(groups, lstVal[l]);
                                                if (!Ext.isEmpty(grpId)) {
                                                    var obj = { groupId: grpId, groupName: Ext.htmlDecode(lstVal[l]) };
                                                    lstObj.push(obj);
                                                }
                                            }
                                        }
                                        if (!Ext.isEmpty(lstObj)) {
                                            dp.Value = lstObj;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    // Change arm population age data for IQR Diff to IQR Difference
                    if (srcs[j].sourcename == 'Arm_Population_Age') {
                        var dpList = srcs[j].Datapoints;

                        if (!dpList)
                            dpList = [];

                        for (var k = 0; k < dpList.length; k++) {
                            var dp = dpList[k];
                            if (dp.Name == "Age Field Type") {
                                if (!Ext.isEmpty(dp.Value) && (dp.Value).indexOf("IQR Difference") == -1) {
                                    dp.Value = dp.Value.replace("IQR Diff", "IQR Difference");
                                }
                            }
                            if (dp.Name == "Age Field Value") {
                                if (!Ext.isEmpty(dp.Value)) {
                                    if (Utils.typeof(dp.Value) == "Array" && !Ext.isEmpty(dp.Value.toString())) {
                                        var lstVal = dp.Value;
                                        var lstObj = [];
                                        for (var l = 0; l < lstVal.length; l++) {
                                            if (Utils.typeof(lstVal[l]) == "Object") {
                                                if (!Ext.isEmpty(lstVal[l].Name)) {
                                                    var val = lstVal[l].Name;
                                                    if (["IQR Diff"].indexOf(val) > -1) {
                                                        dp.Value[l].Name = val.replace("IQR Diff", "IQR Difference");
                                                    } else {
                                                        dp.Value[l].Name = val.replace("IQR Diff-", "IQR Difference-");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    if (srcs[j].sourcename == 'Subgroups') {

                        if (!srcs[j].Datapoints)
                            srcs[j].Datapoints = [];

                        if (srcs[j].Datapoints.length > 0) {
                            var dpList = srcs[j].Datapoints;

                            if (!dpList)
                                dpList = [];

                            var rowWiseDpList = Utils.rowwiseDPList(dpList);
                            var grpId = "";
                            var dps = $.grep(dpList, function (e) {
                                return e.Name == "This study arm is a subgroup of the following characteristic/outcome";
                            });

                            if (dps.length > 0) {
                                if (!Ext.isEmpty(dps[0].Value) && dps[0].Value.indexOf(" - OldData") == -1) {
                                    grpId = me.getGroupIdFromGroupName(groups, dps[0].Value);
                                    dps[0].Value += " - OldData";
                                } else {
                                    if (dps[0].Value.indexOf("ext-data-") != -1) {
                                        grpId = dps[0].Value;
                                    }
                                }
                            }

                            for (var k = 0; k < rowWiseDpList.length; k++) {
                                var rwDpList = rowWiseDpList[k];
                                var rw = rwDpList[0].Row;
                                var obj = {};
                                obj.OutcomeId = "";
                                obj.OutcomeSetId = "";
                                obj.GroupId = grpId;

                                var lstSGL = $.grep(rwDpList, function (e) {
                                    return e.Name == "subgroup-link-id";
                                });

                                if (lstSGL.length == 0) {
                                    var dpSGL = Extract.Create.DataPoints(Extract.Datapoint.VALUETYPE.MEMO, "subgroup-link-id", '', 1, rw, 8);
                                    dpSGL.Value = obj;
                                    dpList.push(dpSGL);
                                } else {
                                    if (Utils.typeof(lstSGL[0].Value) == "Object" && Object.keys(lstSGL[0].Value).toString().indexOf("OutcomeSetId") != -1) {
                                        if (Ext.isEmpty(lstSGL[0].Value["GroupId"]) && !Ext.isEmpty(grpId)) {
                                            lstSGL[0].Value["GroupId"] = grpId;
                                        }
                                    } else {
                                        lstSGL[0].Value = obj;
                                    }
                                }
                            }
                        }
                    }
                }
                // IQR Diff to IQR Difference for Dosages
                var interventions = groups.data[i].InterventionSets;
                for (var k = 0; k < interventions.length; k++) {
                    var intervention = interventions[k].Interventions;
                    for (var m = 0; m < intervention.length; m++) {
                        var interventionSrcs = intervention[m].Sources;
                        for (var n = 0; n < interventionSrcs.length; n++) {
                            // Change arm population age data for IQR Diff to IQR Difference
                            if (interventionSrcs[n].sourcename == 'Dosage') {
                                var dpList = interventionSrcs[n].Datapoints;

                                if (!dpList)
                                    dpList = [];

                                for (var row = 0; row < dpList.length; row++) {
                                    var dp = dpList[row];
                                    if (dp.Name == "Dosage Field Type") {
                                        if (!Ext.isEmpty(dp.Value) && (dp.Value).indexOf("IQR Difference") == -1) {
                                            dp.Value = dp.Value.replace("IQR Diff", "IQR Difference");
                                        }
                                    }
                                    if (dp.Name == "Dosage Field Value") {
                                        if (!Ext.isEmpty(dp.Value)) {
                                            if (Utils.typeof(dp.Value) == "Array" && !Ext.isEmpty(dp.Value.toString())) {
                                                var lstVal = dp.Value;
                                                var lstObj = [];
                                                for (var row_lst = 0; row_lst < lstVal.length; row_lst++) {
                                                    if (Utils.typeof(lstVal[row_lst]) == "Object") {
                                                        if (!Ext.isEmpty(lstVal[row_lst].Name)) {
                                                            var val = lstVal[row_lst].Name;
                                                            if (["IQR Diff"].indexOf(val) > -1) {
                                                                dp.Value[row_lst].Name = val.replace("IQR Diff", "IQR Difference");
                                                            } else {
                                                                dp.Value[row_lst].Name = val.replace("IQR Diff-", "IQR Difference-");
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    if (dp.Name == "Time") {
                                        if (dp.Value == 'days') {
                                            dp.Value = 'd';
                                        }
                                        else if (dp.Value == 'weeks') {
                                            dp.Value = 'wk';
                                        }
                                        else if (dp.Value == 'months') {
                                            dp.Value = 'mo';
                                        }
                                        else if (dp.Value == 'years') {
                                            dp.Value = 'yr';
                                        }
                                    }
                                }
                                break;
                            }
                        }
                    }
                }

                //Soheb Rapati 9.Jun.2017 - Git=>https://github.com/DoctorEvidence/DocExtract/issues/2857
                var armType = groups.data[i].Type;
                var intSets = groups.data[i].InterventionSets;
                for (var j = 0; j < intSets.length; j++) {
                    var obj = intSets[j].Sources.filter(function (a) { a.sourcename == "Others" });
                    if (!Ext.isEmpty(obj) && !Ext.isEmpty(obj[0].Datapoints)) {
                        var tDp = obj[0].Datapoints.filter(function (a) { a.Name == "Treatment Tag" });
                        //Soheb Rapati 8.Aug.2017 - Git=>https://github.com/DoctorEvidence/DocExtract/issues/4079
                        if (!Ext.isEmpty(tDp) && tDp[0].Value == "Intervention of Interest") {
                            tDp[0].Value = "Intervention";
                        }

                        //if (!Ext.isEmpty(tDp) && tDp[0].Value == "Rescue Intervention" && tDp[0].Value != "Backbone Intervention") {
                        if (!Ext.isEmpty(tDp) && tDp[0].Value == "Treatment Tag") {
                            if (armType == "Arm")
                                tDp[0].Value = "Treatment Tag";
                            else if (armType == "Intervention")
                                tDp[0].Value = "Intervention";
                            else if (armType == "Control")
                                tDp[0].Value = "Control";

                            isSet = true;
                        }
                    }
                }

                //Soheb-4.Aug.2017--Git https://github.com/DoctorEvidence/DocExtract/issues/4033
                if (Ext.isEmpty(groups.data[i].displayName)) {
                    groups.data[i].displayName = groups.data[i].name;
                }
            }
        },

        getGroupIdFromGroupName: function (groups, grpName) {
            var grpId = "";
            if (!Ext.isEmpty(groups)) {
                for (var i = 0; i < groups.data.length; i++) {
                    if (Ext.htmlEncode(groups.data[i].name) == Ext.htmlEncode(grpName)) {
                        grpId = groups.data[i].id;
                        break;
                    }
                }
            }
            return grpId;
        },



        updateOutcomes: function (outcomes, phases) {
            var me = this;
            me.setUnitLableDefaultValueFromFieldType(outcomes, phases);
            me.removeOutcomeWithZeroOset(outcomes);
        },

        /// <summary>
        ///     Remove All outcome which has zero Outcomesets #4662 (for Old Data)
        /// </summary>   919
        /// <returns></returns>
        removeOutcomeWithZeroOset: function (Ocs) {
            //var Ocs = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Outcomes);
            // Please update related fireabse. 
            var i = 0;
            while (i < Ocs.length) {
                if (Ocs[i].OutcomeSets.length == 0) {
                    Ocs.splice(i, 1);
                }
                else {
                    ++i;
                }
            }

        },


        updatePhases: function (phases) {
            var me = this;
            for (var i = 0; i < phases.data.length; i++) {
                var phase = phases.data[i];

                if (phase.startUnit != null && phase.startUnit == "mi")
                    phase.startUnit = "min";

                if (phase.endUnit != null && phase.endUnit == "mi")
                    phase.endUnit = "min";
            }

            me.updateIQRDiffInPhase(phases);
        },

        updateIQRDiffInPhase: function (phases) {
            for (var k = 0; k < phases.data.length; k++) {
                var dp = phases.data[k];
                if (!Ext.isEmpty(dp) && (dp.source == "phase" || dp.source == "timepoint")) {
                    //Update IQR Diff to IQR Difference
                    if (!Ext.isEmpty(dp.fieldType) && (dp.fieldType).indexOf("IQR Difference") == -1) {
                        dp.fieldType = dp.fieldType.replace("IQR Diff", "IQR Difference");
                    }

                    if (!Ext.isEmpty(dp.fieldTypeValue)) {
                        if (Utils.typeof(dp.fieldTypeValue) == "Array" && !Ext.isEmpty(dp.fieldTypeValue.toString())) {
                            var lstVal = dp.fieldTypeValue;
                            var lstObj = [];
                            for (var l = 0; l < lstVal.length; l++) {
                                if (Utils.typeof(lstVal[l]) == "Object") {
                                    if (!Ext.isEmpty(lstVal[l].Name)) {
                                        var val = lstVal[l].Name;
                                        if (["IQR Diff"].indexOf(val) > -1) {
                                            dp.fieldTypeValue[l].Name = val.replace("IQR Diff", "IQR Difference");
                                        } else {
                                            dp.fieldTypeValue[l].Name = val.replace("IQR Diff-", "IQR Difference-");
                                        }
                                    }
                                }
                            }
                        }
                    }

                    if (!Ext.isEmpty(dp.name) && Utils.typeof(dp.name) == "Array") {
                        dp.name = Ext.htmlDecode(dp.name);
                    }
                }
            }
        },



        updatePropertySets: function (pSets, groups) {
            var me = this;
            me.convertAndUpdatePropertySets(pSets, groups);
            //OutcomeManager.removeExtraPropertySets();

        },

        convertAndUpdatePropertySets: function (propertySets, groups) {
            var me = this;
            for (var i = 0; i < propertySets.data.length; i++) {
                pSets = propertySets.data[i];
                pSets.amType = me.updateAmTypeInPropertySets(pSets.amType);
                var amType = pSets.amType;

                //Update statistical values here
                var statTest = me.createListOfStatisticalTest();
                for (var j = 0; j < statTest.length; j++) {
                    str = statTest[j];
                    if (amType == str && Ext.isEmpty(pSets.amStatisticalTest)) {
                        pSets.amStatisticalTest = str;

                        var sValue = pSets.amValue;
                        pSets.amStatsTest = sValue;

                        pSets.amType = "";
                        pSets.amValue = "";

                        break;
                    }
                }

                if (!Ext.isEmpty(pSets.amStatsTest))
                    pSets.amStatisticalTestValue = pSets.amStatsTest;

                if (Ext.isEmpty(pSets.amStatisticalTest))
                    pSets.amStatisticalTest = "";

                if (Ext.isEmpty(pSets.amStatisticalTestValue))
                    pSets.amStatisticalTestValue = "";

                if (Ext.isEmpty(pSets.amDegOfFreedom))
                    pSets.amDegOfFreedom = "";

                pSets.amStatsTest = "";

                //pSets.amValue = new var(pSets.amValue.Where(c => !char.IsControl(c)).ToArray());
                //pSets.CIValue = new var(pSets.CIValue.Where(c => !char.IsControl(c)).ToArray());

                if (pSets.isAdded != null && pSets.isAdded.toString().trim().toLowerCase() == "true") {
                    me.removeGroupIdInPropertySet(pSets, groups);
                }

                if (me.isPropertySetEmpty(pSets)) {
                    propertySets.data.splice(i, 1);
                }
            }
        },

        removeGroupIdInPropertySet: function (pSet, groups) {

            if (Ext.isEmpty(pSet.right))
                return;

            for (var i = 0; i < pSet.right.Count; i++) {
                var obj = pSet.right[i];

                for (var j = 0; j < groups.length; j++) {

                    // if the group with the groupId exists then return
                    if (groups[j].id == obj.groupId)
                        return;

                    //if the group does not exists for groupId in pSet.right object,
                    //then remove this object from pSet.right
                    pSet.right.Remove(obj);
                    i--;
                }
            }
        },

        isPropertySetEmpty: function () {

            var isEmpty = true;

            if (!Ext.isEmpty(pSets.IsAdjusted) || !Ext.isEmpty(pSets.AdjustedDescription) ||
                !Ext.isEmpty(pSets.amType) || !Ext.isEmpty(pSets.amValue) ||
                !Ext.isEmpty(pSets.CIPercent) || !Ext.isEmpty(pSets.CIValue) ||
                !Ext.isEmpty(pSets.Variance) || !Ext.isEmpty(pSets.VarianceValue) ||
                !Ext.isEmpty(pSets.pValue) || !Ext.isEmpty(pSets.amStatisticalTest) ||
                !Ext.isEmpty(pSets.amStatisticalTestValue) || !Ext.isEmpty(pSets.amDegOfFreedom)
            ) {
                isEmpty = false;
            }

            return isEmpty;
        },

        updateAmTypeInPropertySets: function (amType) {

            amType = amType != null ? amType.toString().trim() : "";

            if (amType.indexOf("Arithmetic") > -1) {
                amType = amType.replace("Arithmetic", "").replace("-", "").trim();
            }
            return amType;
        },

        createListOfStatisticalTest: function () {

            var arr = ["Binomial test",
                "Cox Proportional-Hazards Regression",
                "Chi-square Goodness-of-Fit",
                "Cohen's D",
                "Fisher's Exact test",
                "Hedges G",
                "Independent (unpaired), 2 sample t-test",
                "Kruskal Wallis",
                "Log-Rank test",
                "McNemar",
                "One-Sample median",
                "One-sample t-test",
                "One-way ANOVA",
                "Overlapping two-sample t-test",
                "Poisson Regression model",
                "Pairwise Comparisons",
                "Paired t-test",
                "Student t-test",
                "Tukey's Range test (Studentized range)",
                "Two-way ANOVA",
                "Wilcoxon Signed Ranks test",
                "Wilcoxon-Mann Whitney test (Wilcoxon Rank-Sum test)"];
            return arr;

        },




        setUnitLableDefaultValueFromFieldType: function (Outcomes, Phases) {
            var me = this;
            for (var i = 0; i < Outcomes.data.length; i++) {
                var outcome = Outcomes.data[i];
                // for task #1674
                var dpNoteOutc = me.getDataPointByNameMigration(outcome, Extract.Outcomes.SOURCENAMES.OTHERS, "Note");
                if (Ext.isEmpty(dpNoteOutc.Value)) { dpNoteOutc.Value = "Not Reported"; }
                //
                for (var j = 0; j < outcome.OutcomeSets.length; j++) {
                    var outcomeSet = outcome.OutcomeSets[j];
                    // for task #1674
                    var dpNoteOSet = me.getDataPointByNameMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Note");
                    if (Ext.isEmpty(dpNoteOSet.Value) && (Ext.isEmpty(dpNoteOutc.Value) || dpNoteOutc.Value == "Not Reported")) { dpNoteOSet.Value = "Not Reported"; }
                    //
                    var dpFType = me.getDataPointByNameMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                    var dpULabel = me.getDataPointByNameMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.OTHERS, "UnitLabel");
                    if (dpFType.Value.charAt(0) == "%") {
                        dpULabel.Value = "%";
                    }
                    // for task 1433
                    if (Ext.isEmpty(dpULabel.Value)) {
                        var OutcomeGroupValue = outcomeSet.OutcomeGroupValues[0];
                        var Values = [];
                        if (OutcomeGroupValue.Sources.length > 0) {
                            for (var k = 0; k < OutcomeGroupValue.Sources.length; k++) {
                                if (OutcomeGroupValue.Sources[k].sourcename == Extract.Outcomes.SOURCENAMES.FIELDVALUE) {
                                    Values = OutcomeGroupValue.Sources[k].Datapoints[0].Value;
                                    break;
                                }
                            }
                        }
                        if (dpFType.type == "Incidence") {
                            var IncidencePer = "";
                            var IncidencePerTime = "";
                            if (Values.length > 0) {
                                Values.forEach(function (item) {
                                    if (item.Name == "Incidence-Person") {
                                        IncidencePer = item.Value;
                                    }
                                    else if (item.Name == "Incidence-PersonTime") {
                                        IncidencePerTime = item.Value;
                                    }
                                });
                                if (!Ext.isEmpty(IncidencePer)) {
                                    if (IncidencePer == "1" && (IncidencePerTime == "person-years" || IncidencePerTime == "persons years")) {
                                        dpULabel.Value = "PPY";
                                    } else {
                                        if (!Ext.isEmpty(IncidencePerTime)) {
                                            dpULabel.Value = "per " + IncidencePer + " " + IncidencePerTime;
                                        }
                                        else {
                                            dpULabel.Value = "per " + IncidencePer + " persons";
                                        }
                                    }
                                }
                            }
                        }
                        else if (dpFType.type == "Prevalence") {
                            var PrevalencePer = "";
                            if (Values.length > 0) {
                                Values.forEach(function (item) {
                                    if (item.Name == "N/Persons-Person") {
                                        PrevalencePer = item.Value;
                                    }
                                });
                                if (!Ext.isEmpty(PrevalencePer)) {
                                    dpULabel.Value = "per " + PrevalencePer + " persons"
                                }
                            }
                        }
                    }
                    // for task #4815
                    if (dpULabel.Value.indexOf("persons years") > -1) { dpULabel.Value = dpULabel.Value.replace("persons years", "person-years"); }
                    else if (dpULabel.Value.indexOf("persons months") > -1) { dpULabel.Value = dpULabel.Value.replace("persons months", "person-months"); }
                    else if (dpULabel.Value.indexOf("persons weeks") > -1) { dpULabel.Value = dpULabel.Value.replace("persons weeks", "person-weeks"); }
                    else if (dpULabel.Value.indexOf("persons days") > -1) { dpULabel.Value = dpULabel.Value.replace("persons days", "person-days"); }
                    // ##3529 (empy unit label value if fieldType is n/%, # ,Yes/No/NA)
                    var ftype = me.getFieldTypePart(outcomeSet);
                    if (["n/%", "#", "Yes/No/NA", "Fraction"].indexOf(ftype[0]) > -1) {
                        dpULabel.Value = "";
                    }
                    //#3566 remove span from Category Rater Unitlabel if exist
                    var dpCategory = me.getDataPointByNameMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Category");
                    var dpRater = me.getDataPointByNameMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Rater");
                    if (!Ext.isEmpty(dpCategory.Value) && dpCategory.Value.indexOf("<span>") > -1) {
                        dpCategory.Value = dpCategory.Value.replace(/<\/?span[^>]*>/g, "").trim();
                    }
                    if (!Ext.isEmpty(dpRater.Value) && dpRater.Value.indexOf("<span>") > -1) {
                        dpRater.Value = dpRater.Value.replace(/<\/?span[^>]*>/g, "").trim();
                    }
                    if (!Ext.isEmpty(dpULabel.Value) && dpULabel.Value.indexOf("<span>") > -1) {
                        dpULabel.Value = dpULabel.Value.replace(/<\/?span[^>]*>/g, "").trim();
                    }
                    var dpList = me.getSourceOthersMigration(outcomeSet, Extract.Outcomes.SOURCENAMES.SUBGROUPS).Datapoints;
                    for (var k = 0; k < dpList.length; k++) {
                        var dp = dpList[k];
                        if (dp.Name == 'GroupName' && Utils.typeof(dp.Value) == "Array") {
                            if (dp.Value.length > 0) {
                                dp.Value = dp.Value[0];
                            }
                        }
                    }
                    var OutcomeGroupValue = outcomeSet.OutcomeGroupValues;
                    for (var k = 0; k < OutcomeGroupValue.length; k++) {
                        if (dpCategory.Value == "Demographics" || dpCategory.Value == "Medical History" || dpCategory.Value == "Social History") {
                            var arrId = me.getTimepointIdNA(Phases);
                            if (arrId.length > 0) {
                                var tpoint = OutcomeGroupValue[k].timepoint;
                                if (!Ext.isEmpty(tpoint)) {
                                    for (var l = 0; l < arrId.length; l++) {
                                        if (tpoint.id == arrId[l]) {
                                            tpoint.id = me.getTimepointIdBaseline(Phases);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        },

        getTimepointIdBaseline: function (Phases) {
            var ids = [];
            for (var i = 0; i < Phases.data.length; i++) {
                var phase = Phases.data[i];
                if (!Ext.isEmpty(phase.type) && phase.type == "=" && phase.startUnit == "Baseline" && Ext.isEmpty(phase.start)) {
                    ids.push(phase.id);
                }
            }
            if (ids.length == 0) {
                var phase = {
                    id: Utils.getUniqueId(),
                    name: "",
                    start: "",
                    startUnit: "Baseline",
                    description: "",
                    end: "",
                    endUnit: "",
                    source: "timepoint",
                    type: "=",
                    fieldType: "",
                    fieldTypeValue: "",
                    drugName: "",
                    descriptionHigh: ""
                };
                Phases.data.push(phase);
                ids.push(phase.id);
            }
            return ids[0];
        },

        getTimepointIdNA: function (Phases) {
            var ids = [];
            for (var i = 0; i < Phases.data.length; i++) {
                var phase = Phases.data[i];
                if (!Ext.isEmpty(phase.type) && phase.type == "N/A") {
                    ids.push(phase.id);
                }
            }
            return ids;
        },

        getDataPointByNameMigration: function (sourceObj, sourcename, dpName) {
            var me = this;
            var dp = {};
            if (typeof sourceObj != 'undefined') {
                var source = me.getSourceOthersMigration(sourceObj, sourcename);

                if (!source.Datapoints)
                    source.Datapoints = [];

                for (var j = 0; j < source.Datapoints.length; j++) {
                    if (source.Datapoints[j].Name == dpName) {
                        dp = source.Datapoints[j];
                        break;
                    }
                }
                if (Object.keys(dp).length === 0) {
                    var dpVal = '';
                    if (dpName == "notReported") {
                        dpVal = true;
                    } else {
                        dpVal = '';
                    }
                    dp = Extract.Create.DataPoints(Extract.Datapoint.VALUETYPE.MEMO, dpName, dpVal, Extract.Datapoint.STATE.ADDED, 1, 1);
                    source.Datapoints.push(dp);
                }
            }
            return dp;
        },

        getSourceOthersMigration: function (sourceObj, sourcename) {
            var source;
            for (var i = 0; i < sourceObj.Sources.length; i++) {
                if (sourceObj.Sources[i].sourcename == sourcename) {
                    source = sourceObj.Sources[i];
                    break;
                }
            }
            if (source == (undefined || null)) {
                source = { sourcename: sourcename, Datapoints: [] };
                sourceObj.Sources.push(source);
            }
            return source;
        },

        /// <summary>
        ///    To Get Variable , VaribaleRange, Variance, VarianceRange
        /// </summary>
        /// <param name="outcomeSet"> OutcomeSet Object </param>
        /// <returns> Arry of Varialbe, VariableRange, Variance, VarianceRange</returns>
        getFieldTypePart: function (outcomeSet) {
            var strvaribale = '';
            var strvariableRange = '';
            var strvariance = '';
            var strvarianceRange = '';

            var cntSources = outcomeSet.Sources;
            var strftype = '';
            for (var i = 0; i < cntSources.length; i++) {
                if (cntSources[i].sourcename == Extract.Outcomes.SOURCENAMES.OTHERS) {
                    var Datapoints = cntSources[i].Datapoints
                    for (var j = 0; j < Datapoints.length; j++) {
                        if (Datapoints[j].Name == "FieldType") {
                            strftype = Datapoints[j].Value;
                            break;
                        }
                    }
                    break;
                }
            }

            var ftype = strftype.replace("Var", "").trim();
            if (ftype == "#" || ftype == "Total Range" || ftype == "Avg" || ftype == "Mean" || ftype == "Median" || ftype == "Yes/No/NA" || ftype == "Fraction" || ftype == "Ratio" || ftype == "Rate" || ftype == "N/Persons" || ftype == "Incidence") {
                strvaribale = ftype;
            }
            else if (ftype.indexOf(" +/- ") > -1) {
                var fArr = ftype.split(" +/- ");
                if (fArr.length > 0) {
                    if (fArr[0].indexOf("[") > -1) {
                        var tmpV = fArr[0].substring(fArr[0], fArr[0].indexOf("["));
                        strvaribale = tmpV.trim();
                        var tmpVR = fArr[0].substring(fArr[0].indexOf("["), fArr[0].length);
                        strvariableRange = tmpVR.replace("[", "").replace("]", "");
                    }
                    else {
                        if (fArr[0] == "Avg" || fArr[0] == "Mean" || fArr[0] == "Median" || fArr[0] == "n/%" || fArr[0] == "%" || fArr[0] == "Ratio" || ftype == "Rate" || ftype == "N/Persons" || ftype == "Incidence") {
                            strvaribale = fArr[0];
                        }
                    }
                    if (fArr.length > 1) {
                        if (fArr[1].indexOf("[") > -1) {
                            var tmpV = fArr[1].substring(fArr[1], fArr[1].indexOf("["));
                            strvariance = tmpV.trim();
                            var tmpVR = fArr[1].substring(fArr[1].indexOf("["), fArr[1].length);
                            strvarianceRange = tmpVR.replace("[", "").replace("]", "");
                        }
                        else {
                            if (fArr[1] == "SD" || fArr[1] == "SE" || fArr[1].indexOf("Unknown") > -1 || fArr[1] == "Semi IQR" || fArr[1] == "IQR Difference") {
                                strvariance = fArr[1];
                            }
                        }
                    }
                }
            }
            else if (ftype == "n/%" || (ftype.indexOf('n/% [') > -1)) {
                if (ftype.trim() == "n/%") {
                    strvaribale = ftype;
                }
                else {
                    strvaribale = ftype.substring(ftype, 3);
                    strvariableRange = ftype.substring(4, ftype.length).replace("[", "").replace("]", "");
                }
            }
            else if (ftype == "%" || (ftype.indexOf('% [') > -1)) {
                if (ftype.trim().length == 1) {
                    strvaribale = ftype;
                }
                else {
                    strvaribale = ftype.substring(ftype, 1);
                    strvariableRange = ftype.substring(2, ftype.length).replace("[", "").replace("]", "");
                }
            }
            else if (ftype.indexOf(" +/- ") == -1) {
                var cnt = ftype.indexOf("[");
                strvaribale = ftype.substring(0, cnt).trim();
                strvariableRange = ftype.substring(cnt, ftype.length).replace("[", "").replace("]", "");
            }

            return [strvaribale, strvariableRange, strvariance, strvarianceRange];
        },
    },

    Groups: {
        getGroupById: function (groupId) {
            if (Extract.Data.Groups[groupId]) {
                return Extract.Data.Groups[groupId];
            }
            console.error("Invalid GroupId");
        },

    },

    getUsedTimepointIds: function () {
        var timepointIDs = [];
        //var od = ExtractData.Outcomes.Data;
        var od = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Outcomes);
        for (var i = 0; i < od.length; i++) {
            var os = Extract.Helper.getEntityListByArrayId(od[i].OutcomeSets, Extract.EntityTypes.OutcomeSets);
            var resName = od[i].name;
            for (var j = 0; j < os.length; j++) {
                //var ogv = os[j].OutcomeGroupValues;
                //var _oct = Extract.Data.OutcomeSets[os[j]];
                var ogv = Extract.Helper.getEntityListByArrayId(os[j].OutcomeGroupValues, Extract.EntityTypes.OutcomeGroupValues);
                var osid = os[j].id;
                for (var k = 0; k < ogv.length; k++) {
                    //var _ogv = Extract.Data.OutcomeGroupValues[ogv[k]];
                    var tid = ogv[k].timepoint.id;
                    //if (timepointIDs.length > 0) {
                    //    if (timepointIDs.indexOf(tid) == -1) {
                    //        timepointIDs.push(tid);
                    //    }
                    //}
                    //else {
                    //    timepointIDs.push(tid);
                    //}
                    //-- Added by Soheb - Git Issue DocExtract/issues/2601
                    if (timepointIDs.map(function (x) { x.osid }).indexOf(osid) == -1)
                        timepointIDs.push({ tp: tid, rs: resName, osid: osid });
                    //else
                    //    timepointIDs.push({ tp: tid, rs: resName });
                }
            }
        }
        return timepointIDs;
    },

    setTimepointId: function (tid) {

        //var od = ExtractData.Outcomes.Data;
        var od = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Outcomes);
        for (var i = 0; i < od.length; i++) {
            var os = od[i].OutcomeSets;
            for (var j = 0; j < os.length; j++) {
                //var ogv = os[j].OutcomeGroupValues;
                var ogv = Extract.Data.OutcomeSets[os[j]].OutcomeGroupValues;
                for (var k = 0; k < ogv.length; k++) {
                    var _ogv = Extract.Data.OutcomeGroupValues[ogv[k]];
                    if (_ogv.timepoint.id == tid) {
                        _ogv.timepoint.id = 0;
                    }
                }
            }
        }
    },

    CopyData: {
        CopyStudyData: function (fromRefId, fromTaskId, toRefId, toTaskId, callback) {
            // Code for copy data
            // Step 1.  if toTaskid have study in firebase then make it empty 
            // Step 2. If fromtaskid have studydata then just copy into totaskid. 
            Extract.Core.copyData(fromRefId, fromTaskId, toRefId, toTaskId, callback);
        },
        haveStudyData: function (refId, taskId, haveStudyCallback) {
            Extract.Core.getStudyData(refId, taskId, haveStudyCallback);
        },
        haveUndoData: function (refId, taskId, haveStudyCallback) {
            Extract.Core.getUndoData(refId, taskId, haveStudyCallback);
        }
    },
    copyDataAndReset: function (refId, taskId, msg, callback) {

        var extraParam = {};
        extraParam.refId = refId;
        extraParam.taskId = taskId;

        Extract.Core.getStudyData(refId, taskId, Extract.Helper.updateDataInTest, extraParam);

        var dbpath = Utils.getDBPath(refId, taskId);

        //get data from production
        firebase.database().ref(dbpath).once('value').then(function (snapshot) {

            var dataToUpdate = snapshot.val();

            if (dataToUpdate == null || dataToUpdate == "" || dataToUpdate == "{}") {
                console.log("No data found for" + refId + " - " + taskId);
                dataToUpdate = {};
                Ext.MessageBox.show({
                    title: 'Reset Data',
                    width: 380,
                    msg: "Data not found for this reference",
                    buttons: Ext.MessageBox.OK
                });
            }
            else {
                dbpath = Utils.getDBPath(refId, taskId);
                dbpath = dbpath.replace("production", "extracttest");
                //dbpath = dbpath.replace("localhost", "staging");

                //update data in test
                firebase.database().ref(dbpath).update(dataToUpdate).then(function () {

                    dbpath = Utils.getDBPath(refId, taskId);

                    //reset data in production
                    firebase.database().ref(dbpath).remove().then(function () {
                        // Remove data from currupted list
                        var allRefIds = ExtractData.allRefIds;
                        // Remove items
                        if (allRefIds) {
                            var index = allRefIds.indexOf(refId);
                            if (index > -1) {
                                allRefIds.splice(index, 1);
                                if (allRefIds.length > 0) {
                                    firebase.database().ref("/resetStudyData").set(allRefIds)
                                } else {
                                    firebase.database().ref("/resetStudyData").set({ 0: [] });
                                }
                            }
                        }

                        console.log("Data copy and reset successful.");
                        //top.window.location.replace("../ParsedPage/EndUserDashboard.aspx");
                        if (msg) {
                            Ext.MessageBox.show({
                                title: 'Clone & Reset Data',
                                width: 380,
                                msg: msg,
                                buttons: Ext.MessageBox.OK
                            });
                        } else {
                            if (typeof (top.objEndUser) != "undefined") {
                                top.objEndUser.callBackRedirectToHomePage();
                            }

                            top.App.panNewPdfView.loader.load({ url: "about:blank" });
                            top.App.panelEDashboard.layout.setActiveItem(0);
                        }
                    });

                });
            }

        }, function (error) { });
    },
    ResetData: function (refId, taskId, callback) {
        // Reset data
        var extraParam = {};
        extraParam.refId = refId;
        extraParam.taskId = taskId;

        //Extract.Core.getStudyData(refId, taskId, Extract.Helper.updateDataInTest, extraParam);
        // Reset data
        var dbpath = Utils.getDBPath(refId, taskId);
        firebase.database().ref(dbpath).remove().then(function () {
            console.log(" reset successful.");
            //top.window.location.replace("../ParsedPage/EndUserDashboard.aspx");
            top.App.panNewPdfView.loader.load({ url: "about:blank" });
            top.App.panelEDashboard.layout.setActiveItem(0);
        });

    },

    Support: {

        getUnitLabelStudies: function (unitLabelText, count, references, result, extracParam, callback) {
            Extract.Core.Suppport.getUnitLabels(Utils.getEnvironmentVariable(), unitLabelText, count, references, result, function (res) {
                callback(res, extracParam);
            });
        },

        mergeUnitLabels: function (arrUnitLabels, callback, extracParam) {
            Extract.Core.Suppport.mergeUnitLabelUpdateInRange(Utils.getEnvironmentVariable(), arrUnitLabels, 0, function (res) {
                callback(res, extracParam);
            });
        },
    },

    Training: {
        copyStudyFromAnother: function (refId, oldTaskId, newTaskIds, callback, extracParam) {
            Extract.Core.Training.copyStudyFromAnother(Utils.getEnvironmentVariable(), refId, oldTaskId, newTaskIds).then(function (res) {
                callback(res, extracParam);
            });
        }
    }
}

Extract.StudyLevel = {

    SOURCENAMES: {
        STUDY_OBJECTIVE: "Study_Objective",
        STUDY_POWER: "Study_Power",
        STUDY_STATISTICS: 'Study_Statistics',
        STUDY_STATISTICAL_TEST: 'Study_Statistical_Test',
        STUDY_DOCUMENT: 'Study_Document',
        STUDY_TYPE: 'Study_Type',
        STUDY_DESIGN: 'Study_Design',
        //STUDY_DESIGN_AGELINK: 'Study_Design_Agelink',
        STUDY_PHASE: 'Study_Phase',
        STUDY_PHASE_RANDOMIZATION: 'Study_Phase_Randomization',
        STUDY_YEAR: 'Study_Year',
        STUDY_FUNDING: 'Study_Funding',
        STUDY_PROTOCOLBASEDFIELDS: 'Study_ProtocolBasedFields',
        STUDY_INCLUSION_CRITERIA: 'Study_Inclusion_Criteria',
        STUDY_EXCULSION_CRITERIA: 'Study_Exculsion_Criteria',
        STUDY_QUALITATIVE_NOTE: 'Study_Qualitative_Note',
        EARLY_STUDY_TERMINATION: 'Early_Study_Termination',
        STUDY_SETTING: 'Study_Setting',
        //STUDY_SETTING_COUNTRY: 'Study_Setting_Country',
        STUDY_SETTING_LOCATION_TYPE: 'Study_Setting_Location_Type',
        STUDY_SETTING_TYPE: 'Study_Setting_Type',
        STUDY_SETTING_TOTAL_ROWS: 'Study_Setting_Total_Rows',
        //STUDY_SETTING_LOCATION_TYPE_MISC: 'Study_Setting_Location_Type_Misc',
        STUDY_AUTHOR_CONTACT_INFORMATION: 'Study_Author_Contact_Information',
        FREQUENCY_REPORT: 'Frequency_Report',
        FREQUENCY_REPORT_TAGS: 'Frequency_Report_Tags',
        ALL_ARMS_EXTRACTED: 'All_Arms_Extracted',
        FR_LOCATIONS: 'Locations',
        FR_LOCATION_A_DATA: 'Location_A_Data',
        FR_LOCATION_B_DATA: 'Location_B_Data',
        FR_LOCATION_C_DATA: 'Location_C_Data',
        FR_LOCATION_D_DATA: 'Location_D_Data',
        FR_LOCATION_E_DATA: 'Location_E_Data',
        FR_LOCATION_L_DATA: 'Location_L_Data'
    },
}

Extract.Groups = {
    SOURCENAMES: {
        GROUPS: 'Groups', //Groups
        DATAPOINT: 'Datapoint',
        OVERLAPING_POPULATION: 'Overlaping_Population', //Groups
        SUBGROUPS: 'Subgroups', // Groups
        ARM_BLINDING: 'Arm_Blinding', //Groups
        ADDITIONAL_INFORMATION: 'Additional_Information', //Group + InerventionSets
        CONCOMITANT_MEDICATIONS: 'Concomitant_Medications', //Group
        ARM_POPULATION: 'Arm_Population', //Group
        PARTICIPANTS: 'Participants', //Group
        ARM_POPULATION_AGE: 'Arm_Population_Age', //Group
        MALE: 'Male', //Group
        FEMALE: 'Female', //Group
        UNKNOWN: 'Unknown', //Group
        INTERVENTION: 'Intervention', //ISets
        OTHERS: 'Others', // all
        MISC: 'Misc', // Intervention
        DOSAGE: 'Dosage', // Intervention
        SESSION: 'Session', // Intervention
        FREQUENCY: 'Frequency', // Intervention
        QUALIFIER: 'Qualifier', // table related 
        STUDY_PROTOCOLBASEDFIELDS: 'Study_ProtocolBasedFields', // Groups
        AGE_POPULATION: 'Age_Population', // Groups
        GENDER_POPULATION: 'Gender_Population', // Groups
        FIXED_DOSE_COMBINATION: 'Fixed_Dose_Combination', //ISets
        TIMEPOINT: 'Timepoint', // Intervention
    },
}

Extract.Outcomes = {
    SOURCENAMES: {
        SUBGROUPS: 'Subgroups',
        POPULATION: 'Population',
        OTHERS: 'Others',
        FIELDTYPE: 'FieldType',
        FIELDVALUE: 'FieldValue',
        ISRECORDED: 'IsRecorded',
        AUTHOR_ERROR: 'Author_Error',
        OBJECTIVE: 'Objective',
        EXTRACT_TABLE: 'Extract_Table',
        LOCATION_E_DATA: 'Location_E_Data',
        LOCATION_B_DATA: 'Location_B_Data',
        LOCATION_L_DATA: 'Location_L_Data'
    },
}

Extract.Flags = {
    SOURCENAMES: {
        FLAG_STUDY_OBJECTIVE: "Flag_Study_Objective",
        FLAG_STUDY_POWER: "Flag_Study_Power",
        FLAG_STUDY_STATISTICS: 'Flag_Study_Statistics',
        FLAG_STUDY_DOCUMENT: 'Flag_Study_Document',
        FLAG_STUDY_YEAR: 'Flag_Study_Year',
        FLAG_STUDY_TYPE: 'Flag_Study_Type',
        FLAG_STUDY_DESIGN: 'Flag_Study_Design',
        FLAG_STUDY_PHASE: 'Flag_Study_Phase',
        FLAG_STUDY_FUNDING: 'Flag_Study_Funding',
        FLAG_CRITERIA: 'Flag_Criteria',
        FLAG_STUDY_SETTING: 'Flag_Study_Setting',
        FLAG_STUDY_AUTHOR_CONTACT_INFORMATION: 'Flag_Study_Author_Contact_Information',
        FLAG_GROUP: 'Flag_Group',
        FLAG_GROUP_INTERVENTIONS: 'Flag_Group_Interventions',
        FLAG_GROUP_POPULATION: 'Flag_Group_Population',
        FLAG_FREQUENCY_REPORT: 'Flag_Frequency_Report',
        FLAG_STUDY_PROTOCOLBASEDFIELDS: 'Flag_Study_ProtocolBasedFields',
    }
}

Extract.Datapoint = Extract.Datapoint ? Extract.Datapoint : {},

    Extract.Datapoint.VALUETYPE =
    {
        AGE: "Age", AGERANGE: "AgeRange", AVERAGE: "Average", BOOLEAN: "Boolean", COUNTRYLOCATION: "CountryLocation", DATA_POINT_LABELS: "DataPointLabels", DATE_TIME: "DateTime",
        DOSAGE: "Dosage", DOSAGES: "Dosages", DOUBLE: "Double", EVENT: "Event", FUNDING: "Funding", INTEGER: "Integer", INTERVAL: "Interval",
        INTERVENTION_PROVIDER: "InterventionProvider", INTERVENTION_ROUTE: "InterventionRoute", INTERVENTION_SCHEDULE: "InterventionSchedule", MEAN: "Mean", MEANBASE: "MeanBase",
        MEDIAN: "Median", MEMO: "Memo", NUMBER_UNIT: "NumberUnit", OUTCOME_LEVELS: "OutcomeLevels", PARTICIPANT: "Participant", PARTICIPANTS: "Participants", RANGE: "Range",
        SETTINGTYPE: "SettingType", TIME_RANGE: "TimeRange", VERSIONNUMBER: "VersionNumber", YESNONA: "YesNoNa"
    },

    Extract.Datapoint.STATE = { ISSYNC: 0, ADDED: 1, EDITED: 2, DELETED: 3 }

Extract.PropertySets = {
    SOURCENAMES: {
        AUTHOR_ERROR: 'Author_Error',
    }
}

Extract.ExcelImport = {

    createDatapointAddToSource: function (ValueType, Name, Value, state, Row, Column, type, typeId, sourceName) {

        var me = this;

        var dp = Extract.Create.DataPoints(ValueType, Name, Value, state, Row, Column);

        me.addDPToSource(type, typeId, sourceName, dp);
        me.addDPToDatapoints(dp);

        return dp;
    },

    addDPToSource: function (type, typeId, sourceName, obj) {
        var me = this;
        var sourceObj = {};

        if (!Extract.Data[type])
            Extract.Data[type] = {};

        if (type == Extract.EntityTypes.StudyLevel) {

            if (!Extract.Data[type][sourceName]) {
                Extract.Data[type][sourceName] = [];
            }
            sourceObj = Extract.Data[type][sourceName];
        }
        else {
            if (!Extract.Data[type][typeId]["Sources"]) {
                Extract.Data[type][typeId]["Sources"] = {};
            }
            if (!Extract.Data[type][typeId]["Sources"][sourceName]) {
                Extract.Data[type][typeId]["Sources"][sourceName] = [];
            }
            sourceObj = Extract.Data[type][typeId]["Sources"][sourceName];
        }
        if (Utils.typeof(sourceObj) == 'Array') {
            sourceObj.push(obj.id);
        }
    },

    addDPToDatapoints: function (dpObj) {

        if (!Extract.Data.Datapoints) {
            Extract.Data.Datapoints = {};
        }
        Extract.Data.Datapoints[dpObj.id] = dpObj;
    },

    //Groups
    createGroups: function (group) {

        if (typeof (group) != "string")
            return group;

        var groupObj = Extract.Create.Groups(group);

        var type = Extract.EntityTypes.Groups;

        if (!Extract.Data[type])
            Extract.Data[type] = {};

        Extract.Data[type][groupObj.id] = groupObj;

        return groupObj;
    },

    addParticipants: function (sourceObj, Gender, Number, Percentage, id) {
        var me = this;
        if (!sourceObj.Participants)
            sourceObj.Participants = [];

        var objPart = {};
        if (Extract.Helper.getEntityListByArrayId(sourceObj.Participants)) {
            var lstPart = Extract.Helper.getEntityListByArrayId(sourceObj.Participants).filter(function (a) { return a.Gender == Gender });
            if (lstPart.length > 0) {
                objPart = lstPart[0];
            }
        }

        if (Object.keys(objPart).length == 0) {
            objPart = Extract.Create.Participants(Gender, Number, Percentage, "Participants");
            sourceObj.Participants.push(objPart.id);
            //update array in database in groups.participants
            var indexPart = sourceObj.Participants.indexOf(id);

            if (Extract.Data.Datapoints[id] == undefined && indexPart > -1) {
                sourceObj.Participants.splice(indexPart, 1);
            }

            me.addDPToDatapoints(objPart);
        }

        return objPart;
    },

    createInterventionSets: function (name, groupId, interventionSetObj, caseNo) {

        if (typeof (interventionSetObj) == "object")
            return interventionSetObj;

        if (!Extract.Data.Groups[groupId]) {
            console.log("GroupId does not exists : " + groupId);
            return;
        }

        var iSet = Extract.Create.InterventionSets(name, groupId, caseNo);

        Extract.Data.InterventionSets[iSet.id] = iSet;

        if (!Extract.Data.Groups[groupId].InterventionSets)
            Extract.Data.Groups[groupId].InterventionSets = [];

        //update local object
        Extract.Data.Groups[groupId].InterventionSets.push(iSet.id);

        return iSet;
    },

    createInterventions: function (iSetId, phaseId, intervenObj, groupId) {

        if (typeof (intervenObj) == "object")
            return intervenObj;

        if (!Extract.Data.InterventionSets[iSetId]) {
            console.log("InterventionSets does not exists : " + iSetId);
            return;
        }

        var interv = Extract.Create.Interventions(phaseId, iSetId, groupId);

        Extract.Data.Interventions[interv.id] = interv;

        if (!Extract.Data.InterventionSets[iSetId].Interventions)
            Extract.Data.InterventionSets[iSetId].Interventions = [];

        //update local object
        Extract.Data.InterventionSets[iSetId].Interventions.push(interv.id);

        return interv;
    },

    getSourceOthers: function (sourceObj, sourceName, extractData) {

        if (!sourceObj["Sources"] || !sourceObj["Sources"][sourceName]) {
            if (!sourceObj["Sources"]) {
                sourceObj["Sources"] = {};
            }
            sourceObj["Sources"][sourceName] = [];
        }

        var dpIdList = sourceObj.Sources[sourceName];
        return Extract.Helper.getSourceObjectFromSourceName(sourceName, dpIdList, "", extractData);
    },

    //Outcomes
    createOutcome: function (outcomeName) {

        var outcome = Extract.Create.Outcomes(outcomeName);

        if (!Extract.Data[Extract.EntityTypes.Outcomes][outcome.id])
            Extract.Data[Extract.EntityTypes.Outcomes][outcome.id] = outcome;

        return outcome;
    },

    createOutcomeSet: function (outcomeId) {

        var outSet = Extract.Create.OutcomeSets();

        if (!Extract.Data.Outcomes[outcomeId].OutcomeSets)
            Extract.Data.Outcomes[outcomeId].OutcomeSets = [];

        var length = Extract.Data.Outcomes[outcomeId].OutcomeSets.length;

        //Update local object
        Extract.Data.Outcomes[outcomeId].OutcomeSets.push(outSet.id);

        if (!Extract.Data[Extract.EntityTypes.OutcomeSets][outSet.id])
            Extract.Data[Extract.EntityTypes.OutcomeSets][outSet.id] = outSet;

        return outSet;
    },

    createOutcomeGroupValues: function (outcomeSetId, isDeleted, groupId) {

        var me = this;
        var ogv = Extract.Create.OutcomeGroupValues();

        if (isDeleted && isDeleted == true)
            ogv.isDeleted = isDeleted;

        if (groupId)
            ogv.groupId = groupId;

        if (!Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues)
            Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues = [];

        var length = Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues.length;

        //Update local object
        Extract.Data.OutcomeSets[outcomeSetId].OutcomeGroupValues.push(ogv.id);

        if (!Extract.Data[Extract.EntityTypes.OutcomeGroupValues][ogv.id])
            Extract.Data[Extract.EntityTypes.OutcomeGroupValues][ogv.id] = ogv;

        var ogvIndex = me.getOgvIndex(Extract.Data.OutcomeSets[outcomeSetId]);
        ogv.index = ogvIndex;

        return ogv;
    },

    getOgvIndex: function (outcomeSet) {

        var index = 0;
        var OutcGroupValues = Extract.Helper.getEntityListByArrayId(outcomeSet.OutcomeGroupValues, Extract.EntityTypes.OutcomeGroupValues);

        for (var i = 0; i < OutcGroupValues.length; i++) {

            var obj = OutcGroupValues[i];

            if (obj.index && index < obj.index) {
                index = obj.index;
            }
        }
        return index + 1;
    },

    getOutcomeGroupValuesByGroupId: function (outcomeSet, groupId) {
        var gp = {};

        for (var i = 0; i < outcomeSet.OutcomeGroupValues.length; i++) {
            var ogv = Extract.Helper.getEntity(Extract.EntityTypes.OutcomeGroupValues, outcomeSet.OutcomeGroupValues[i]);
            if (ogv.groupId == groupId && Ext.isEmpty(ogv.isDeleted)) {
                gp = ogv;
                break;
            }
        }
        return gp;
    },

    //Clone OutcomeSets
    cloneOutcomeSets: function (outcomeId, outcomeSetId) {
        var me = this;

        var oldOutcomeSet = Object.assign({}, Extract.Data.OutcomeSets[outcomeSetId]);
        var oSource = oldOutcomeSet.Sources;

        if (oldOutcomeSet.isDeleted)
            return;

        var outcomeSet = me.createOutcomeSet(outcomeId);

        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.OutcomeSets, outcomeSet.id, oSource);

        //Clone OutcomeGroupValues
        for (var i = 0; i < oldOutcomeSet.OutcomeGroupValues.length; i++) {
            var ogvId = oldOutcomeSet.OutcomeGroupValues[i];
            me.cloneOutcomeGroupValues(outcomeSet.id, ogvId);
        }
        return outcomeSet;
    },

    cloneSource: function (type, typeId, source) {
        var me = this;

        if (type == Extract.EntityTypes.OutcomeGroupValues) {
            var groupId = Extract.Data[type][typeId].groupId;
        }

        for (key in source) {

            var dpList = Extract.Helper.getEntityListByArrayId(source[key], "");
            //me.emptySourceArray(type, typeId, key);

            for (var i = 0; i < dpList.length; i++) {

                var oldDp = Ext.decode(Ext.encode(dpList[i]));

                if (type == Extract.EntityTypes.Outcomes && (oldDp.Name == "Acronym" || oldDp.Name == "Note" || oldDp.Name == "QualitativeNote")) {
                    oldDp.Value = "";
                }

                if (type == Extract.EntityTypes.OutcomeSets) {

                    if (oldDp.Name == "UnitLabel") {
                        var fldtype = $.grep(dpList, function (dt) {
                            return dt.Name == "FieldType";
                        });
                        if (fldtype.length > 0) {
                            if (fldtype[0].type) {
                                if (fldtype[0].type == "Incidence" || fldtype[0].type == "Prevalence") {
                                    oldDp.Value = "";
                                }
                            }
                        }
                    }
                    if (oldDp.Name == "Note" || oldDp.Name == "QualitativeNote") {
                        oldDp.Value = "";
                    }
                }

                if (type == Extract.EntityTypes.OutcomeGroupValues) {

                    if (key == Extract.Outcomes.SOURCENAMES.POPULATION) {

                        if (oldDp.Name == "name")
                            oldDp.Value = Extract.ExcelImport.getDefaultPopulationName(groupId); /// create new function for this
                        else if (oldDp.Name == "value")
                            oldDp.Value = Extract.ExcelImport.getDefaultPopulationValue(groupId); /// create new function for this
                    }
                    else if (key == Extract.Outcomes.SOURCENAMES.FIELDVALUE && oldDp.Name == "FieldValue") {
                        oldDp.Value = "";
                    }
                }
                var dp = me.createDatapointAddToSource(oldDp.ValueType, oldDp.Name, oldDp.Value, oldDp.state, oldDp.Row, oldDp.Column, type, typeId, key);

                if (type == Extract.EntityTypes.OutcomeSets) {
                    if (oldDp.Name == "FieldType" && !Ext.isEmpty(oldDp.type)) {
                        dp.type = oldDp.type;
                    }
                    me.addHighlightByclone(oldDp.id, dp.id);
                }
            }
        }
    },

    addHighlightByclone: function (entityId, newEntityId) {

        if (Extract.Data.Highlights != null && Extract.Data.Highlights != undefined && Extract.Data.Highlights[entityId]) {

            var newObj = {};
            var highlightObj = {};

            for (var key in Extract.Data.Highlights[entityId]) {

                highlightObj = Ext.decode(Ext.encode(Extract.Data.Highlights[entityId][key]));
                highlightObj.highlightid = new Date().getTime();
                newObj[highlightObj.highlightid] = highlightObj;
            }

            if (!Extract.Data.Highlights)
                Extract.Data.Highlights = {};

            Extract.Data.Highlights[newEntityId] = newObj;
        }
    },

    cloneOutcomeGroupValues: function (outcomeSetId, ogvId) {

        var me = this;

        var oldOutcomeGroup = Object.assign({}, Extract.Data.OutcomeGroupValues[ogvId]);
        var oSource = oldOutcomeGroup.Sources;

        var outcomeGroup = me.createOutcomeGroupValues(outcomeSetId, oldOutcomeGroup.isDeleted, oldOutcomeGroup.groupId);

        outcomeGroup.timepoint = Object.assign({}, oldOutcomeGroup.timepoint);
        //Clone source and add to DB
        me.cloneSource(Extract.EntityTypes.OutcomeGroupValues, outcomeGroup.id, oSource);
        return outcomeGroup;
    },

    //Phases
    createPhaseAddToSource: function (name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh) {

        var me = this;

        var phase = Extract.Create.Phases(name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh);

        me.addToPhases(phase);

        return phase;
    },

    addToPhases: function (phase) {

        if (!Extract.Data.Phases) {
            Extract.Data.Phases = {};
        }
        Extract.Data.Phases[phase.id] = phase;
    },

    phaseExist: function (name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh) {

        var me = this;
        var existingPhase = "";
        var phases = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Phases);

        for (let i = 0; i < phases.length; i++) {
            var phase = phases[i];
            if (phase.description == description && phase.description == description && phase.descriptionHigh == descriptionHigh && phase.drugName == drugName && phase.end == end && phase.endUnit == endUnit && phase.fieldType == fieldType && phase.fieldTypeValue == fieldTypeValue && phase.name == name && phase.start == start && phase.startUnit == startUnit && phase.type == type) {
                existingPhase = phase;
                break;
            }
        }
        return existingPhase;
    },

    getDataPointByName: function (type, typeId, sourceObj, sourceName, dpName, row, col, value) {

        var me = this;
        var dp = {};
        var dpList = [];

        if (!sourceObj["Sources"]) {
            sourceObj["Sources"] = {};
        }

        if (sourceObj.Sources.hasOwnProperty(sourceName)) {
            dpList = Extract.Helper.getEntityListByArrayId(sourceObj.Sources[sourceName]);
        }

        for (var i = 0; i < dpList.length; i++) {

            if (!Ext.isEmpty(row) && !Ext.isEmpty(col)) {
                if (dpList[i].Name == dpName && dpList[i].Row == row && dpList[i].Column == col) {
                    dp = dpList[i];
                    break;
                }
            }
            else if (dpList[i].Name == dpName) {
                dp = dpList[i];
                break;
            }
        }

        if (Ext.isEmpty(row) && Ext.isEmpty(col)) {
            row = 1
            col = 1;
        }

        dp;

        if (Object.keys(dp).length === 0) {
            var dpVal = '';
            if (dpName == "notReported") {
                dpVal = true;
            } else {
                dpVal = '';
            }
            if (Ext.isEmpty(dpVal) && !Ext.isEmpty(value)) {
                dpVal = value;
            }
            dp = me.createDatapointAddToSource(Extract.Datapoint.VALUETYPE.MEMO, dpName,
                dpVal, Extract.Datapoint.STATE.ADDED, row, col, type, typeId, sourceName);
        }
        return dp;
    },

    getEntity: function (type, id, data) {

        if (data) {
            if (data[type] && data[type][id])
                return data[type][id];
        }

        if (Extract.Data[type])
            return Extract.Data[type][id];

        return undefined;
    },

    createFieldValue: function (name, value, source, dpId, type, fieldToUpdate) {

        if (!Extract.Data.FieldValues)
            Extract.Data.FieldValues = {};

        var fieldValue = Extract.Create.FieldValues(name, value, source);

        Extract.Data.FieldValues[fieldValue.id] = fieldValue;

        if (!Extract.Data[type][dpId])
            Extract.Data[type][dpId] = {};

        if (Ext.isEmpty(Extract.Data[type][dpId][fieldToUpdate])) {
            if (fieldToUpdate) {
                Extract.Data[type][dpId][fieldToUpdate] = [];
            } else {
                Extract.Data[type][dpId].Value = [];
            }
        }
        //Update local object
        Extract.Data[type][dpId][fieldToUpdate].push(fieldValue.id);

        return fieldValue;
    },
     getEntityAsArray: function (entityType) {
        var array = $.map(Extract.Data[entityType], function (value, index) {
            if (value.isDeleted != true)
                return [value];
        });

        if (array.length > 0 && array[0].hasOwnProperty('index')) {
            array.sort(function (obj1, obj2) {
                return obj1.index - obj2.index;
            });
        }
        return array;
    },
     /// <summary>
     ///     To get Population Name
     /// </summary>
     /// <param name="groupId"> OutcomeGroupValue Id </param>
     /// <returns> defaultName (selected OutcomeGroupValues Population)</returns>
     getDefaultPopulationName: function (groupId) {
         var defaultName = '';
         var Groups = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Groups);
         if (Groups.length > 0) {
             var cntgrp = Groups.length;
             for (var g = 0; g < cntgrp; g++) {
                 if (Groups[g].id == groupId) {
                     var Sources = Object.keys(Groups[g].Sources);
                     var cntSource = Sources.length;
                     for (var j = 0; j < cntSource; j++) {
                         if (Sources[j] == Extract.Groups.SOURCENAMES.ARM_POPULATION) {
                             var lstDP = Extract.Helper.getEntityListByArrayId(Groups[g].Sources[Sources[j]]);

                             var cntRow = Utils.getRowwiseDPCount(lstDP);
                             var dpList = Utils.rowwiseDPList(lstDP);

                             for (var i = 0; i < dpList.length; i++) {
                                 var dp = dpList[i];
                                 var dpNm = $.grep(dp, function (e) { return e.Name == 'n Type' });
                                 var dpVl = $.grep(dp, function (e) { return e.Name == 'n Value' });
                                 var dpDef = $.grep(dp, function (e) { return e.Name == 'Default' });
                                 if (dpDef.length > 0) {
                                     if (dpDef[0].Value == true) {
                                         for (var k = 0; k < dpNm.length; k++) {
                                             if (!Ext.isEmpty(dpNm[k].Value)) {
                                                 defaultName = dpNm[k].Value;
                                                 break;
                                             }
                                         }
                                         //defaultValue = dpVl[0].Value;                                                
                                         break;
                                     }
                                 }
                             }
                             break;
                         }
                     }
                     break;
                 }
             }
         }
         return defaultName;
     },

     /// <summary>
     ///     To get Population Value
     /// </summary>
     /// <param name="groupId"> OutcomeGroupValue Id </param>
     /// <returns> defaultName (selected OutcomeGroupValues Population Value)</returns>
     getDefaultPopulationValue: function (groupId) {
         var defaultValue = '';
         var Groups = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Groups);
         if (Groups.length > 0) {
             var cntgrp = Groups.length;
             for (var g = 0; g < cntgrp; g++) {
                 if (Groups[g].id == groupId) {
                     var Sources = Object.keys(Groups[g].Sources);
                     var cntSource = Sources.length;
                     for (var j = 0; j < cntSource; j++) {

                         if (Sources[j] == Extract.Groups.SOURCENAMES.ARM_POPULATION) {

                             var lstDP = Extract.Helper.getEntityListByArrayId(Groups[g].Sources[Sources[j]]);
                             var cntRow = Utils.getRowwiseDPCount(lstDP);
                             var dpList = Utils.rowwiseDPList(lstDP);

                             for (var i = 0; i < dpList.length; i++) {
                                 var dp = dpList[i];
                                 var dpNm = $.grep(dp, function (e) { return e.Name == 'n Type' });
                                 var dpVl = $.grep(dp, function (e) { return e.Name == 'n Value' });
                                 var dpDef = $.grep(dp, function (e) { return e.Name == 'Default' });
                                 if (dpDef.length > 0) {
                                     if (dpDef[0].Value == true) {
                                         // defaultName = dpNm[0].Value;
                                         defaultValue = dpVl[0].Value;
                                         break;
                                     }
                                 }
                             }
                             break;
                         }
                     }
                     break;
                 }
             }
         }
         return defaultValue;

     },
     deleteOutcomeSet: function (outSetId) {
         var me = this;
         for (var i = 0; i < Extract.Data.OutcomeSets[outSetId].OutcomeGroupValues.length; i++) {

             var outGroupId = Extract.Data.OutcomeSets[outSetId].OutcomeGroupValues[i];
             me.deleteOutcomeGroup(outGroupId, Extract.Data.OutcomeGroupValues[outGroupId]);
         }
         //Outcomeset => Sources
         for (var key in Extract.Data.OutcomeSets[outSetId].Sources) {
             me.deleteSourceDatapoints(Extract.Data.OutcomeSets[outSetId].Sources[key]);
         }

         //Delete Outconeset
         Extract.Data.OutcomeSets[outSetId].isDeleted = true;         
     },
     deleteOutcomeGroup: function (outGroupId) {

         //Outcomegroup=> Sources
         for (var key in Extract.Data.OutcomeGroupValues[outGroupId].Sources) {
             Extract.Helper.deleteSourceDatapoints(Extract.Data.OutcomeGroupValues[outGroupId].Sources[key]);
         }
         //Delete outcomegroup        
         Extract.Data.OutcomeGroupValues[outGroupId].isDeleted = true;
     },
     deleteSourceDatapoints: function (source) {
         for (var j = 0; j < source.length; j++) {
             var dpId = source[j];
             if (Extract.Data.Datapoints[dpId]) {                 
                 Extract.Data.Datapoints[dpId].isDeleted = true;
             }
         }
     }
}
