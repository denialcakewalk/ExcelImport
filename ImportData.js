﻿const Cases = {
    CaseNo: {
        Therapy_Drug: ["case1", "case3"],
        Therapy_CancerIntervention: ["case1", "case2", "case3"],
        Therapy_Radiotherapy: ["case1", "case8"],
        Therapy_BiologicalVaccine: ["case1", "case9"],
        Therapy_LifestyleModification: ["case1", "case18"],
        Therapy_DietarySupplement: ["case1", "case19"],
        Therapy_Other: ["case1", "case20"],
        Therapy_Device: ["case1", "case7"],
        Therapy_ProcedureSurgery: ["case1", "case11"],
        Therapy_BehavioralInformationalMaterial: ["case4", "case5"],
        Therapy_BehavioralSessionMeeting: ["case4", "case6"]

    }
}

class ImportData {

    constructor() {
        this.processedData = [];
    }

    getAllReferenceId(sheetNo) {
        let referenceIdList = [];
        for (let i = 0; i < result[sheetNo].y.length; i++) {
            let refID = result[sheetNo].y[i].RefID;
            if (referenceIdList.indexOf(refID) == -1) {
                referenceIdList.push(refID);
            }
        }
        return referenceIdList;
    }


    processExcel() {       
        //Step 2 Process Groups
        this.processGroups();        
        Utils.updatedExcelDataToFirebase(this.processedData)
        return this.processedData;
    }

    //#region Process Study Level
    processStudyLevel() {
        //#region Study Objective
        this.createDatapointAddToSource("Objective", "Study Aim", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_OBJECTIVE);
        this.createDatapointAddToSource("Objective Description", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_OBJECTIVE);
        this.createDatapointAddToSource("Trial Outcome", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_OBJECTIVE);
        //#endregion

        //#region Study Power
        this.createDatapointAddToSource("Outcome Name", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("Power Description", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("Beta / Power (%)", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("Sample Size (#)", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("Per Group/Study", "", 1, 5, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("To determine Effect Size", "", 1, 6, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        this.createDatapointAddToSource("Outcome Name/Type", "", 1, 7, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_POWER);
        //#endregion

        //#region Study Document
        this.createDatapointAddToSource("Outcome Name", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_DOCUMENT);
        //#endregion


        //#region Study Year
        this.createDatapointAddToSource("", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_YEAR);
        //#endregion


        //#region Study Type
        this.createDatapointAddToSource("Study Type", "Therapy", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Study Subtype", "Drug", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Intervention Type", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Burden Type", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Is study on cancer interventions?", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Other Subtype", "", 1, 5, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        this.createDatapointAddToSource("Intervention Subtype", "", 1, 7, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_TYPE);
        //#endregion

        //#region Study Design
        this.createDatapointAddToSource("Study Design", "Randomized Controlled Trial", 1, 1, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Clinical Trial Number", "", 1, 5, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Clinical Trial Phase", "", 1, 6, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Allocation Method", "", 1, 7, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Randomization Method", "", 1, 8, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Cluster No", "", 1, 9, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Cluster Definition", "", 1, 10, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Blinding Method", "", 1, 11, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Blinding Different per Arm?", "", 1, 12, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Representative Sample", "", 1, 12, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Original Population", "", 1, 13, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Does the publication pool results across studies?", "", 1, 14, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("How many studies are included?", "", 1, 15, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Is the inclusion/exclusion criteria of the studies different?", "", 1, 17, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Stratification Type", "", 50, 2, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Nested?", "", 50, 3, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Study ID (Link)", "", 50, 4, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        this.createDatapointAddToSource("Blinding Definition", "", 1, 21, Extract.EntityTypes.StudyLevel, "", "StudyDesign_1");
        //#endregion

        //#region Study Early study termination
        this.createDatapointAddToSource("Early Study Termination", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.EARLY_STUDY_TERMINATION);
        //#endregion

        //#region Study Funding
        this.createDatapointAddToSource("Funding Type", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_FUNDING);
        this.createDatapointAddToSource("Institution Type", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_FUNDING);
        this.createDatapointAddToSource("Funding Institution Name", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_FUNDING);
        //#endregion

        //#region Study inclusion criteria
        this.createDatapointAddToSource("Inclusion Criteria", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_INCLUSION_CRITERIA);
        //#endregion

        //#region Study Exclusion criteria
        this.createDatapointAddToSource("Exclusion Criteria", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_EXCULSION_CRITERIA);
        //#endregion

        //#region Study Qualitative Note
        this.createDatapointAddToSource("Qualitative Note", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_QUALITATIVE_NOTE);
        //#endregion

        //#region Study protocolbasedfields
        this.createDatapointAddToSource("Protocol Based Name", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_PROTOCOLBASEDFIELDS);
        this.createDatapointAddToSource("Protocol Based Description", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_PROTOCOLBASEDFIELDS);
        //#endregion

        //#region All Arms
        this.createDatapointAddToSource("All arms extracted?", "Yes", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.ALL_ARMS_EXTRACTED);
        //#endregion

        //#region Study Phase
        Extract.ExcelImport.createPhaseAddToSource('Treatment Period', '', '', '', '', 'phase', 'Not Reported', '', '', '', '', '', '');
        //#endregion

        //#region Setting
        this.createDatapointAddToSource("Recruitment Location", "", 1, 10, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        this.createDatapointAddToSource("Recruitment Method", "", 1, 11, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        this.createDatapointAddToSource("Sampling Location", "", 1, 12, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        this.createDatapointAddToSource("Sampling Method", "", 1, 13, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        this.createDatapointAddToSource("Acronym/Source Population", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        this.createDatapointAddToSource("Patient Database/Registry Source", "", 1, 9, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING);
        //#endregion

        //#region Setting Type
        this.createDatapointAddToSource("Setting Type", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TYPE);
        this.createDatapointAddToSource("Setting Name", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TYPE);
        this.createDatapointAddToSource("N/% or Avg", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TYPE);
        this.createDatapointAddToSource("Misc", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TYPE);
        //#endregion

        //#region Setting total rows
        this.createDatapointAddToSource("Location/Setting", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TOTAL_ROWS);
        this.createDatapointAddToSource("Total #", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TOTAL_ROWS);
        this.createDatapointAddToSource("N/% or Avg", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TOTAL_ROWS);
        this.createDatapointAddToSource("Misc", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_SETTING_TOTAL_ROWS);
        //#endregion

        //#region author contact Information
        this.createDatapointAddToSource("Contact Name", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_AUTHOR_CONTACT_INFORMATION);
        this.createDatapointAddToSource("Contact Email", "", 1, 2, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_AUTHOR_CONTACT_INFORMATION);
        this.createDatapointAddToSource("Contact Phone", "", 1, 3, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_AUTHOR_CONTACT_INFORMATION);
        this.createDatapointAddToSource("Contact Address", "", 1, 4, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.STUDY_AUTHOR_CONTACT_INFORMATION);
        //#endregion

        //#region Frequcy Report tags
        this.createDatapointAddToSource("", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.FREQUENCY_REPORT_TAGS);
        //#endregion

        //#region Frequcy Report 
        this.createDatapointAddToSource("", "", 1, 1, Extract.EntityTypes.StudyLevel, "", Extract.StudyLevel.SOURCENAMES.FREQUENCY_REPORT);
        //#endregion

    }
    //#endregion

    processGroups() {
        //Get All unique reference Id in Group sheet
        let refIds = this.getAllReferenceId(0);
        let groupSheet = result[0];
        //Group all referenceid rows by ref id

        let data = {};
        for (let i = 0; i < refIds.length; i++) {
            data[refIds[i]] = []
            for (let j = 0; j < groupSheet.y.length; j++) {
                if (groupSheet.y[j].RefID == refIds[i]) {
                    data[refIds[i]].push(groupSheet.y[j]);
                }
            }
        }

        console.log("Import started...");
        //Now Process each refid
        for (let i = 0; i < refIds.length; i++) {
            if (true || (refIds[i] == "2273898")) { // || refIds[i] == "926565" , "2281657"
                this.processStudyLevel();
                let rows = data[refIds[i]];
                //let grp = Extract.ExcelImport.createGroups("Total Population");
                //grp.GroupType = "Total";
                this.createTotalPopulationGroup();
                for (let j = 0; j < rows.length; j++) {
                    //Soheb process here.                
                    //console.log(rows[j]);

                    this.createGroup(rows[j]);
                }

                this.processOutcomes(refIds[i]);
                let obj = {};
                obj["refid"] = refIds[i];
                obj["taskid"] = Utils.getTaskIdByRefId(refIds[i]);
                this.deleteEmptyOutcomeSets();
                obj["jsonData"] = Extract.Data;
                this.processedData.push(JSON.parse(JSON.stringify(obj)));
                for (let obj in Extract.Data) {
                    Extract.Data[obj] = {};
                }

            }
        }

        console.log("Import finished successfully");
    }

    createDatapointAddToSource(dpName, dpValue, rowNo, columnNo, sourceType, sourceId, sourceName) {
        if (dpName == undefined || dpName == null || dpName == "") {
            dpName = "";
        }
        if (dpValue == undefined || dpValue == null || dpValue == "") {
            dpValue = "";
        }
        return Extract.ExcelImport.createDatapointAddToSource(Extract.Datapoint.VALUETYPE.MEMO, dpName,
            dpValue, Extract.Datapoint.STATE.ADDED, rowNo, columnNo, sourceType, sourceId,
            sourceName);
    }

    //#region Group Level

    createTotalPopulationGroup() {
        
        let grp = Extract.ExcelImport.createGroups("Total Population");
        grp.GroupType = "Total";

        this.createPopulation(grp.id, {});
        this.createAgePopulation(grp.id, {});
        this.createGenderPopulation(grp.id, {});
        //this.createDatapointAddToSource("Population Type", "Participant", 0, 4, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("n Type", "Randomized", 0, 1, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("n Value", "na", 0, 2, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("Default", true, 0, 3, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);

        //this.createDatapointAddToSource("Population Type", "Participant", 1, 4, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("n Type", "na", 1, 1, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("n Value", "na", 1, 2, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        //this.createDatapointAddToSource("Default", false, 1, 3, Extract.EntityTypes.Groups, grp.id, Extract.Groups.SOURCENAMES.ARM_POPULATION);


    }

    createGroup(grpRow) {
        let grpNm = grpRow["Group Name & Display Name"];
        let acrSrcPop = grpRow["Acronym/Source Population"];

        //#region Update Study Level's Setting field
        let lstFld = Extract.Helper.getEntityListByArrayId(Extract.Data.StudyLevel.Study_Setting).filter(a => { return a.Name == "Acronym/Source Population" });
        if (lstFld.length > 0) {
            lstFld[0].Value = acrSrcPop;
        }
        //#endregion


        let grpObj = Extract.ExcelImport.createGroups(grpNm);
        grpObj.GroupType = "Single";
        grpObj.Type = "Intervention";

        this.createParticipants(grpObj, grpRow);
        this.createAdditionalInfo(grpObj.id, grpRow);

        this.createPopulation(grpObj.id, grpRow);
        this.createAgePopulationFieldType(grpObj.id, grpRow);
        this.createAgePopulation(grpObj.id, grpRow);
        this.createGenderPopulation(grpObj.id, grpRow);

        this.createInterventionSet(grpObj.id, grpRow);
    }

    createParticipants(grpObj, grpRow) {
        let mlNum = grpRow['Male |#'];
        if (!mlNum) {
            mlNum = "";
        }
        let mlPer = grpRow['Male |%'];
        if (!mlPer) {
            mlPer = "";
        }

        Extract.ExcelImport.addParticipants(grpObj, "Male", mlNum, mlPer, "");

        let fmlNum = grpRow['Female |#'];        
        if (!fmlNum) {
            fmlNum = "";
        }
        let fmlPer = grpRow['Female |%'];
        if (!fmlPer) {
            fmlPer = "";
        }
        Extract.ExcelImport.addParticipants(grpObj, "Female", fmlNum, fmlPer, "");

        let unkNum = grpRow['Unknown |#'];
        if (!unkNum) {
            unkNum = "";
        }
        let unkPer = grpRow['Unknown |%'];
        if (!unkPer) {
            unkPer = "";
        }
        Extract.ExcelImport.addParticipants(grpObj, "Unknown", unkNum, unkPer, "");
    }

    createAdditionalInfo(grpId, grpRow) {
        let addInfo = grpRow['Group Additional Information'];
        //let src = Extract.ExcelImport.getSourceOthers(Extract.Data.Groups[grpId], Extract.Groups.SOURCENAMES.ADDITIONAL_INFORMATION);
        //if (src.Datapoints.length == 0) {
        //Extract.ExcelImport.createDatapointAddToSource(Extract.Datapoint.VALUETYPE.MEMO, "Additional Information",
        //    addInfo, Extract.Datapoint.STATE.ADDED, 1, 3, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ADDITIONAL_INFORMATION);
        //}
        this.createDatapointAddToSource("Additional Information", addInfo, 1, 3, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ADDITIONAL_INFORMATION);
    }

    createPopulation(grpId, grpRow) {
        let popRand = grpRow['Population|Randomized'];
        if (popRand == undefined || popRand == null || popRand == "") {
            popRand = "na";
        }
        let popCF = grpRow['Population|Completed/Finished'];

        if (popCF == undefined || popCF == null || popCF == "") {
            popCF = "na";
        }
        //let src = Extract.ExcelImport.getSourceOthers(Extract.Data.Groups[grpId], Extract.Groups.SOURCENAMES.ARM_POPULATION);

        this.createDatapointAddToSource("Population Type", "Participant", 0, 4, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        this.createDatapointAddToSource("n Type", "Randomized", 0, 1, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        this.createDatapointAddToSource("n Value", popRand, 0, 2, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        this.createDatapointAddToSource("Default", true, 0, 3, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);

        this.createDatapointAddToSource("Population Type", "Participant", 1, 4, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);        
        this.createDatapointAddToSource("n Type", (popCF == "na" ? "na" : "Completed/Finished"), 1, 1, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        this.createDatapointAddToSource("n Value", popCF, 1, 2, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
        this.createDatapointAddToSource("Default", false, 1, 3, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);

    }

    createAgePopulationFieldType(grpId, grpRow) {
        let ageFTVariable = grpRow['Age|Field Type; Variable'];
        let ageFTVariableValue = grpRow['Value'];
        let ageFTVariableRange = grpRow['Variable Range'];
        let ageFTValueSDSE = grpRow['Value SD/SE'];
        let ageFTValueRangeIQR = grpRow['Value Range/IQR'];

        if (ageFTVariable != undefined && ageFTVariable != null) {
            let fldTypeValue = [];
            if (ageFTVariableRange != undefined && ageFTVariableRange != null) {
                ageFTVariableRange = ageFTVariableRange.trim();
                if (ageFTVariableRange == "Range") {
                    ageFTVariableRange = "Total Range";
                }
            } else {
                ageFTVariableRange = "";
            }

            fldTypeValue.push({ name: ageFTVariable, value: ageFTVariableValue });

            let fldTypeString = ageFTVariable;
            if (fldTypeString != undefined && fldTypeString != "") {
                if (ageFTVariableRange == "Total Range" || ageFTVariableRange == "IQR") {
                    fldTypeString += ` [${ageFTVariableRange}]`;
                    fldTypeValue.push({ name: `${ageFTVariable}-${ageFTVariableRange}`, value: ageFTValueRangeIQR });
                }

                //if (ageFTVariableRange == "IQR") {
                //fldTypeString += ` [(${ageFTVariableRange})]`;
                //}

                if (ageFTVariableRange == "SD" || ageFTVariableRange == "SE") {
                    fldTypeString += ` +/- ${ageFTVariableRange}`;
                    fldTypeValue.push({ name: `${ageFTVariable}-${ageFTVariableRange}`, value: ageFTValueSDSE });
                }

                //if (ageFTVariableRange == "SE") {
                //    fldTypeString += " +/- SE";
                //}


                this.createDatapointAddToSource("Age Field Type", fldTypeString, 1, 1, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION_AGE);
                let dp = this.createDatapointAddToSource("Age Field Value", "", 1, 2, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION_AGE);
                for (var i = 0; i < fldTypeValue.length; i++) {
                    //name, value, source, dpId, type, fieldToUpdate
                    Extract.ExcelImport.createFieldValue(fldTypeValue[i].name, fldTypeValue[i].value, "GroupAgeFieldValue", dp.id, Extract.EntityTypes.Datapoints, "Value");
                }
                this.createDatapointAddToSource("Unit", "", 1, 3, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION_AGE);

            }
        }
    }

    createAgePopulation(grpId, grpRow) {
        let popRand = grpRow['Population|Randomized'];
        if (popRand == undefined || popRand == null || popRand == "") {
            popRand = "na";
        }
        this.createDatapointAddToSource("n Type", "Randomized", 1, 1, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.AGE_POPULATION);
        this.createDatapointAddToSource("n Value", popRand, 1, 2, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.AGE_POPULATION);
    }

    createGenderPopulation(grpId, grpRow) {
        let popRand = grpRow['Population|Randomized'];
        if (popRand == undefined || popRand == null || popRand == "") {
            popRand = "na";
        }
        this.createDatapointAddToSource("n Type", "Randomized", 1, 1, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.GENDER_POPULATION);
        this.createDatapointAddToSource("n Value", popRand, 1, 2, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.GENDER_POPULATION);
    }

    //#endregion

    //#region Intervention Set
    createInterventionSet(grpId, grpRow) {
        let intNm = grpRow['Intervention Name'];
        let lstIntNm = intNm.split(/(?:\+|\/)+/); //intNm.split('/');
        let intDU = grpRow['Intervention Dose Unit'];
        let intDV = grpRow['Intervention Dose Value'];
        let intFU = grpRow['Intervention Frequency Unit'];
        let intFV = grpRow['Intervention Frequency Value'];
        let lstIntDV = [];
        if (intDV) {
            lstIntDV = intDV.split('/');
        }
        for (let i = 0; i < lstIntNm.length; i++) {
            let iSet = Extract.ExcelImport.createInterventionSets(lstIntNm[i].trim(), grpId, "", Cases.CaseNo.Therapy_Drug);
            this.createInterventionSetLevelFields(iSet.id, lstIntNm[i].trim(), false, grpRow);
            let phId = "";
            if (Extract.Helper.getEntityAsArray(Extract.EntityTypes.Phases).length > 0) {
                phId = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Phases)[0].id;
            }
            let int = this.createIntervention(grpId, iSet.id, phId);
            this.createInterventionLevelFields(int.id);
            let dfv = (lstIntDV.length > i) ? lstIntDV[i] : "";
            this.createDosage(int.id, intDU, dfv);
            this.createFrequency(int.id, intFU, intFV);
            this.createTimepoint(int.id);
        }

        let intNmBkbn = grpRow['Backbone Intervention Name'];
        if (intNmBkbn) {
            let lstNmBkbn = intNmBkbn.split(/(?:\+|\/)+/); //intNmBkbn.split('+');
            let intBDU = grpRow['Backbone Dose Unit'];
            let intBDV = grpRow['Backbone Dose Value'];
            let intBFU = grpRow['Backbone Frequency Unit'];
            let intBFV = grpRow['Backbone Frequency Value'];
            let lstIntBDV = [];
            if (intBDV) {
                lstIntBDV = intBDV.split('+');
            }
            for (let i = 0; i < lstNmBkbn.length; i++) {
                let iSet = Extract.ExcelImport.createInterventionSets(lstNmBkbn[i], grpId, "", Cases.CaseNo.Therapy_Drug);
                this.createInterventionSetLevelFields(iSet.id, lstNmBkbn[i], true, grpRow);
                let phId = "";
                if (Extract.Helper.getEntityAsArray(Extract.EntityTypes.Phases).length > 0) {
                    phId = Extract.Helper.getEntityAsArray(Extract.EntityTypes.Phases)[0].id;
                }
                let int = this.createIntervention(grpId, iSet.id, phId);
                this.createInterventionLevelFields(int.id);
                let dfv = (lstIntBDV.length > i) ? lstIntBDV[i] : "";
                this.createDosage(int.id, intBDU, dfv);
                this.createFrequency(int.id, intBFU, intBFV);
                this.createTimepoint(int.id);
            }
        }
    }

    createInterventionSetLevelFields(iSetId, intName, isBackboneIntervention, grpRow) {
        this.createDatapointAddToSource("Treatment Tag", (isBackboneIntervention ? "Backbone Intervention" : "Intervention"), 1, 20, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createDatapointAddToSource("Intervention Name", intName, 1, 1, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createDatapointAddToSource("Manufacturer", "", 1, 12, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createDatapointAddToSource("Brand", "", 1, 19, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createFixedDose(iSetId, grpRow);
    }

    createFixedDose(iSetId, grpRow) {
        this.createDatapointAddToSource("Fixed Dose", "No", 1, 21, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Combination Name", "", 1, 22, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);

        this.createDatapointAddToSource("Fixed Dose Intervention", "", 1, 23, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Concentration", "", 1, 24, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Unit", "", 1, 25, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Intervention", "", 2, 23, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Concentration", "", 2, 24, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
        this.createDatapointAddToSource("Fixed Dose Unit", "", 2, 25, Extract.EntityTypes.InterventionSets, iSetId, Extract.Groups.SOURCENAMES.FIXED_DOSE_COMBINATION);
    }

    //#endregion

    //#region Intervention
    createIntervention(grpId, iSetId, phaseId) {
        return Extract.ExcelImport.createInterventions(iSetId, phaseId, "", grpId);
    }

    createInterventionLevelFields(intId) {
        this.createDatapointAddToSource("Schedule", "", 1, 10, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createDatapointAddToSource("Route", "", 1, 11, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.OTHERS);
        this.createDatapointAddToSource("Provider", "", 1, 12, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.OTHERS);
    }

    createDosage(intId, dosageUnit, fieldValue) {
        if (dosageUnit == undefined) {
            dosageUnit = "";
        }

        let dsgFldtyp = "";
        if (fieldValue) {
            dsgFldtyp = "Fixed";
        }
        
        this.createDatapointAddToSource("Protocol", "Protocol", 1, 1, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Dosage Type", "Standard", 1, 9, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Dosage Field Type", dsgFldtyp, 1, 2, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        let dp = this.createDatapointAddToSource("Dosage Field Value", "", 1, 3, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        if (fieldValue) {
            //name, value, source, dpId, type, fieldToUpdate
            Extract.ExcelImport.createFieldValue('Fixed', fieldValue, "GroupDosageFieldValue", dp.id, Extract.EntityTypes.Datapoints, "Value");
        }
        this.createDatapointAddToSource("Dosage Unit", dosageUnit, 1, 4, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Concentration", "", 1, 12, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Concentration Unit", "", 1, 13, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Time Value", "", 1, 7, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Time", "", 1, 8, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
        this.createDatapointAddToSource("Timepoint Information", "", 1, 11, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.DOSAGE);
    }

    createFrequency(intId, freqUnit, freqValue) {
        this.createDatapointAddToSource(freqUnit, freqValue, 1, 5, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.FREQUENCY);
    }

    createTimepoint(intId) {
        this.createDatapointAddToSource("", "", 1, 1, Extract.EntityTypes.Interventions, intId, Extract.Groups.SOURCENAMES.TIMEPOINT);
    }

    //#endregion

    //#region Outcome
    getGorupbyGroupName(groupName) {
        let gp = {};
        let groups = Extract.Data.Groups;
        for (let groupKey in groups) {
            if (groups[groupKey].hasOwnProperty("name") && groups[groupKey]["name"].trim() == groupName.trim()) {
                gp = groups[groupKey];
                return gp;
            }
        }
        return gp
    }
    processOutcomes(refId) {
        var me = this;
        var isOutcomeSheet = true;   // for outcome sheet true and for Baselinecharacteristic false
        //Get All unique reference Id in Group sheet
        let refIds = this.getAllReferenceId(2);
        var outcome_osets = {};
        var outcomeNames = {};
        var obj_outcome_outcomeset = {};

        for (var i = 0; i < 2; i++) {
            var outcomeSheetNo = 2;
            isOutcomeSheet = true;
            let outcomeSheet = result[2];
            if (i == 0) {
                outcomeSheet = result[1];
                isOutcomeSheet = false;
                outcomeSheetNo = 1;
            }           
            
            let data = {};

            if (refId != undefined) {
                data[refId] = []
                for (let j = 0; j < outcomeSheet.y.length; j++) {
                    if (outcomeSheet.y[j].RefID == refId) {
                        data[refId].push(outcomeSheet.y[j]);
                    }
                }
            }

            //Now Process each refid
            //for (let i = 0; i < refIds.length; i++) {
            if (refId != undefined) {
                let rows = data[refId];               
               
                //Create Outcomes and outcomeSets
                if (outcomeSheetNo == 1 && false) {
                    //Get header part for create outcome and iteration data. 
                    var headerData = $.grep(outcomeSheet.y, function (e) { return e.FieldName != 'Data'; });
                    for (var headerRow = 0; headerRow < headerData.length; headerRow++) {
                        // Get Outcome data 
                        switch (headerData[headerRow].FieldName) {
                            case "ResultName":
                                let tempdata = headerData[headerRow];
                                for (var key in tempdata) {
                                    if (tempdata[key] != "ResultName") {
                                        if (key.indexOf('_Population') > 0) {
                                            // allow to add outcome becuase it is not exist for this reference 
                                            var oid = me.getoutcomeidbyName(outcomeNames, tempdata[key]);
                                            var ocome = Extract.ExcelImport.getEntity(Extract.EntityTypes.Outcomes, oid);
                                            var osetid = me.getoutcomesetidbyoutcomeName(outcomeNames, outcome_osets, tempdata[key], key, obj_outcome_outcomeset);
                                            var outSet = Extract.ExcelImport.getEntity(Extract.EntityTypes.OutcomeSets, osetid);
                                            // get iteration column number static 
                                            let COL_NUMBER = key.split('_');
                                            if (COL_NUMBER.length > 0) {
                                                // Return string value 
                                                var negPos = me.getOutcomeHeaderDatabyFieldName(headerData, "NegPos", COL_NUMBER[0]);
                                                var category = me.getOutcomeHeaderDatabyFieldName(headerData, "Category", COL_NUMBER[0]);
                                                var qualifier = me.getOutcomeHeaderDatabyFieldName(headerData, "Qualifier", COL_NUMBER[0]);
                                                var quantifier = me.getOutcomeHeaderDatabyFieldName(headerData, "Quantifier", COL_NUMBER[0]);

                                                var dpNegPos = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "NegPos");
                                                dpNegPos.Value = negPos.substring(0, 3);

                                                

                                                
                                                var dpCategory = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Category");
                                                dpCategory.Value = category;

                                                var dpQualifier = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Qualifier");
                                                dpQualifier.Value = qualifier;
                                                let tmpQuantifier = quantifier.split(' ');
                                                for (let k = 0; k < tmpQuantifier.length; k++) {
                                                    if (k == 0 && ["<", ">", "=", "≤", "≥"].indexOf(tmpQuantifier[0]) > -1) {
                                                        var dpEquality = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Equality");
                                                        dpEquality.Value = tmpQuantifier[0];
                                                    }
                                                    if (k == 1 && tmpQuantifier[1] != "") {
                                                        var dpNumber = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Number");
                                                        dpNumber.Value = tmpQuantifier[1];
                                                    }
                                                    if (k == 2 && tmpQuantifier[2] != "") {
                                                        var dpQUlabel = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "QUnitLabel");
                                                        dpQUlabel.Value = tmpQuantifier[2];
                                                    }

                                                }

                                            }
                                        }
                                    }
                                }
                                break;
                        }
                    }

                }
                var arrClonedOset = ['0'];
                var objClonedOgv = {};
                let prevTimtpoint = "";
                let newTimepoint = "";
                var hasTimepoint = false;
                for (let j = 0; j < rows.length; j++) {
                    // Manipulate result data.

                    var rowData = rows[j];
                    var rowKey = rowData.GroupNo;
                    var timepoint = rowData["Timepoint"] ? rowData["Timepoint"] : 0 ;
                    // just create it with for both don't think too much for now.... if not exist for that reference 
                    // check if this timepoint is avilable or not.if exist use this otherwise create new one
                    let timepoint_mean = "";
                    let timepoint_standard = "";

                    if (timepoint || true) {
                        newTimepoint = timepoint;
                        if (outcomeSheetNo == 1) {
                            newTimepoint = rowKey;
                        }
                        if (newTimepoint != prevTimtpoint ) {
                            var OtimepointKey = "T" + timepoint + rowKey + "-";
                            prevTimtpoint = newTimepoint
                            //# region header 
                            // Get header part for create outcome and iteration data. 
                            var headerData = $.grep(outcomeSheet.y, function (e) { return e.FieldName != 'Data'; });
                            for (var headerRow = 0; headerRow < headerData.length; headerRow++) {
                                // Get Outcome data 
                                switch (headerData[headerRow].FieldName) {
                                    case "ResultName":
                                        let tempdata = headerData[headerRow];
                                        for (var key in tempdata) {
                                            if (tempdata[key] != "ResultName") {
                                                if (key.indexOf('_Population') > 0 || ((key.indexOf('_n') > 0 || key.indexOf('_FieldType') > 0)  && outcomeSheetNo == 1 ) ) {
                                                    // allow to add outcome becuase it is not exist for this reference 
                                                    var oid = me.getoutcomeidbyName(outcomeNames, tempdata[key]);
                                                    var ocome = Extract.ExcelImport.getEntity(Extract.EntityTypes.Outcomes, oid);
                                                    var osetid = me.getoutcomesetidbyoutcomeName(outcomeNames, outcome_osets, tempdata[key], OtimepointKey + key, obj_outcome_outcomeset);
                                                    var outSet = Extract.ExcelImport.getEntity(Extract.EntityTypes.OutcomeSets, osetid);
                                                    // get iteration column number static 
                                                    let COL_NUMBER = key.split('_');
                                                    if (COL_NUMBER.length > 0) {
                                                        // Return string value 
                                                        var negPos = me.getOutcomeHeaderDatabyFieldName(headerData, "NegPos", COL_NUMBER[0]);
                                                        var category = me.getOutcomeHeaderDatabyFieldName(headerData, "Category", COL_NUMBER[0]);
                                                        var qualifier = me.getOutcomeHeaderDatabyFieldName(headerData, "Qualifier", COL_NUMBER[0]);
                                                        var quantifier = me.getOutcomeHeaderDatabyFieldName(headerData, "Quantifier", COL_NUMBER[0]);

                                                        var dpNegPos = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "NegPos");
                                                        dpNegPos.Value = negPos.substring(0, 3);

                                                        // udpate category for outcome 
                                                        
                                                        var dpCategory = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.Outcomes, oid, ocome, Extract.Outcomes.SOURCENAMES.OTHERS, "Category");
                                                        if (Ext.isEmpty(dpCategory.Value))
                                                        {
                                                            dpCategory.Value = category;
                                                        }
                                                        

                                                        var dpCategory = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Category");
                                                        dpCategory.Value = category;

                                                        var dpQualifier = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Qualifier");
                                                        dpQualifier.Value = qualifier;
                                                        let tmpQuantifier = quantifier.split(' ');
                                                        for (let k = 0; k < tmpQuantifier.length; k++) {
                                                            if (k == 0 && ["<", ">", "=", "≤", "≥"].indexOf(tmpQuantifier[0]) > -1) {
                                                                var dpEquality = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Equality");
                                                                dpEquality.Value = tmpQuantifier[0];
                                                            }
                                                            if (k == 1 && tmpQuantifier[1] != "") {
                                                                var dpNumber = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "Number");
                                                                dpNumber.Value = tmpQuantifier[1];
                                                            }
                                                            if (k == 2 && tmpQuantifier[2] != "") {
                                                                var dpQUlabel = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, outSet.id, outSet, Extract.Outcomes.SOURCENAMES.OTHERS, "QUnitLabel");
                                                                dpQUlabel.Value = tmpQuantifier[2];
                                                            }

                                                        }

                                                    }
                                                }
                                            }
                                        }
                                        break;
                                }
                            }
                            //# end region header 


                        }
                    }

                    if (isOutcomeSheet) {
                        if (!Extract.Data["Phases"]) {
                            Extract.Data["Phases"] = {};
                        }
                        

                        if (timepoint != 0) {
                            var tempTimepointMean = Extract.ExcelImport.phaseExist("", timepoint, "Week(s)", "", "", "timepoint", "=", "", "", "", "", "", "");
                            if (tempTimepointMean == "") {
                                timepoint_mean = Extract.ExcelImport.createPhaseAddToSource("", timepoint, "Week(s)", "", "", "timepoint", "=", "", "", "", "", "", "");
                            }
                            else {
                                timepoint_mean = tempTimepointMean;
                            }

                            var tempTimepointStandard = Extract.ExcelImport.phaseExist("", "", "Baseline", timepoint, "Week(s)", "timepoint", "Total", "", "", "", "", "", "");
                            if (tempTimepointStandard == "") {
                                timepoint_standard = Extract.ExcelImport.createPhaseAddToSource("", "", "Baseline", timepoint, "Week(s)", "timepoint", "Total", "", "", "", "", "", "");
                            } else {
                                timepoint_standard = tempTimepointStandard;
                            }
                        }
                    } else {
                        if (true || timepoint) {
                            var tempTimepointStandard = Extract.ExcelImport.phaseExist("", "", "Baseline", "", "", "timepoint", "=", "", "", "", "", "", "");
                            if (tempTimepointStandard == "") {
                                timepoint_standard = Extract.ExcelImport.createPhaseAddToSource("", "", "Baseline", "", "", "timepoint", "=", "", "", "", "", "", "");
                            } else {
                                timepoint_standard = tempTimepointStandard;
                            }
                        }
                    }
                    var group = this.getGorupbyGroupName(rowData["GroupName"], refId);
                    var groupId = group.id;
                    if (groupId) {
                        for (let Tcolkey in obj_outcome_outcomeset) { // Make it upper becuae we need to create duplicate iteration when MOA have two data.                        
                            if (Tcolkey.indexOf("T" + timepoint + rowKey) > -1) {
                                var o_oset = obj_outcome_outcomeset[Tcolkey]; // 1st will be oid  and 2nd will be osetid
                                var oid = '';
                                var osetid = '';
                                var colkey = Tcolkey.split('-')[1]; //Tcolkey.replace("T" + timepoint + rowKey, "");
                                if (o_oset.length == 2) {
                                    oid = o_oset[0];
                                    osetid = o_oset[1];

                                    var oc = Extract.ExcelImport.getEntity(Extract.EntityTypes.Outcomes, oid);
                                    var oset = Extract.ExcelImport.getEntity(Extract.EntityTypes.OutcomeSets, osetid);
                                    var ogv = Extract.ExcelImport.getOutcomeGroupValuesByGroupId(oset, groupId);
                                    if (groupId) {
                                        var dpfvalue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "FieldValue");
                                    }
                                }
                                var field_Type = "";
                                var field_Value = "";

                                var fieldTypeHeader = me.getOutcomeHeaderDatabyFieldName(headerData, "FieldType", colkey);
                                if (fieldTypeHeader == "Standard/Binary") {
                                    field_Type = "Standard";
                                    field_Value = "n/%";

                                    var dpFType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                                    dpFType.Value = field_Value;
                                    dpFType.type = field_Type;
                                }
                                else {
                                    field_Type = fieldTypeHeader;
                                    var ft = field_Type.split("/");
                                    if (ft.length > 1) {
                                        var dpFType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                                        dpFType.Value = ft[1].trim();
                                        dpFType.type = ft[0].trim();
                                    } else {
                                        var dpFType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                                        if (field_Type && ["standard", "change", "% change", "time since", "time to", "duration", "incidence", "prevalence"].indexOf(field_Type.toLowerCase()) > -1) { 
                                            dpFType.type = field_Type;
                                        } else {
                                            dpFType.Value = field_Type;
                                        }
                                    }

                                }
                                var needtoCloneforMOA = false;
                                var iterationCreatedForMOA = false;
                                var countMOA = 0;
                                var N_PP_val = "";
                                var n_PP_val = "";
                                var Per_PP_val = "";
                                // Get fieldValue for clone 

                                //update ogv timepoint (if fielldtype== standard then use timepoint standard else timepointMean
                                if (timepoint_standard && timepoint_standard["id"] && ogv["timepoint"]) {
                                    ogv.timepoint.id = timepoint_standard.id;
                                }
                                var udpatedFiedlType = false;
                                for (let key in rowData) {
                                    // for (let osetRow = 0; osetRow < length; osetRow++) {

                                    if (key.startsWith(colkey)) {
                                        let val = rowData[key];
                                        if (key == colkey + '_Population_ITT' || key == colkey + '_Population') {
                                            // udpate population value
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            //var dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                                            //dpValue.Value = val;
                                            //var defaultName = this.getDefaultPopulationName(ogv.groupId, val.trim());
                                            //if (!Ext.isEmpty(defaultName)) {
                                            //    var dpName = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "name");
                                            //    dpName.Value = defaultName;
                                            //}
                                        } else if (key == colkey + '_Population_PP') {
                                            N_PP_val = val;
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            var dpMOA = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "MethodAnalysis");
                                            if (dpMOA.Value != "ITT") {
                                                dpMOA.Value = "PP";
                                            }
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            // udpate population vaue for PP
                                        } else if (key == colkey + '_MOA_ITT') {
                                            // udpate MOA vlaue for ITT
                                            //Update MOA with ITT value
                                            //if (val != "") {
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                                var dpMOA = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "MethodAnalysis");
                                                dpMOA.Value = "ITT";
                                            //}
                                            countMOA++;
                                        } else if (key == colkey + '_MOA_PP') {
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            if (val != "") {
                                                var dpMOA = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "MethodAnalysis");
                                                dpMOA.Value = "PP";
                                                //if (dpMOA.Value != "ITT") {
                                                //    dpMOA.Value = "PP";
                                                //} 
                                            }
                                            countMOA++;
                                            if (countMOA == 0) {
                                                // udpate MOA value for PP
                                                
                                            } else {
                                                needtoCloneforMOA = true;
                                            }
                                        } else if (key == colkey + '_n_ITT' || key == colkey + '_n') {
                                            if (dpfvalue) {
                                                Extract.ExcelImport.createFieldValue("n", val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                            }
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            // udpate n value for ITT
                                        } else if (key == colkey + '_Per_ITT' || key == colkey + '_Per') {
                                            if (dpfvalue) {
                                                Extract.ExcelImport.createFieldValue("%", val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                            }
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            // udpate per value for ITT
                                        } else if (key == colkey + '_n_PP') {
                                            // udpate n value for pp
                                            n_PP_val = val;
                                        } else if (key == colkey + '_FieldType') {
                                            // udpate field Type
                                            var dpFType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                                            if (val && ["standard", "change", "% change", "time since", "time to", "duration", "incidence", "prevalence"].indexOf(val.toLowerCase()) > -1) {
                                                val = val.trim();
                                                dpFType.type = val;
                                            } else {
                                                val = val.trim();
                                                dpFType.Value = val;
                                            }
                                            this.updateParticipants(ogv, rowData, key, colkey);
                                            
                                        } else if (!udpatedFiedlType && (key == colkey + '_Range_Variable_Variance')) {
                                            udpatedFiedlType = true; // Update for fieldType 
                                            val = "";
                                            //if (rowData[colkey + '_Mean']) {
                                            //    val += rowData[colkey + '_Mean'];
                                            //}
                                            var variableRange = rowData[colkey + '_Range_Variable_Variance'];
                                            variableRange = variableRange.split('/');
                                            if (rowData[colkey + '_Range_Variable_Variance']) {
                                                if (variableRange.length > 0) {
                                                    for (var variableRow = 0; variableRow < variableRange.length; variableRow++) {
                                                        let ftypeval = variableRange[variableRow];
                                                        ftypeval = ftypeval.trim();
                                                        if (['SD', 'SE'].indexOf(ftypeval) == -1) {
                                                            if (ftypeval == "95%CI") {
                                                                ftypeval = "95 % CI";
                                                            } else if (ftypeval.toLowerCase() == "range") {
                                                                ftypeval = "Total Range";
                                                            }
                                                            if (ftypeval && ["standard", "change", "% change", "time since", "time to", "duration", "incidence", "prevalence"].indexOf(ftypeval.toLowerCase()) == -1) {
                                                                if (val.indexOf('SD') > -1 || val.indexOf('SE') > -1) {
                                                                    val = " [" + ftypeval + "]" + val;
                                                                } else {
                                                                    if (ftypeval == "IQR") {
                                                                        val += " [(" + ftypeval + ")]";
                                                                    } else {
                                                                        val += " [" + ftypeval + "]";
                                                                    }
                                                                }
                                                                
                                                                //if (val.indexOf('SD') > -1 || val.indexOf('SE') > -1) {
                                                                //    val += " [" + ftypeval + "]";
                                                                //} else {
                                                                //    val += " [(" + ftypeval + ")]";
                                                                //}
                                                            }

                                                        } else {
                                                            val += " +/- (" + ftypeval + ")";
                                                        }
                                                    }

                                                }

                                                
                                            }
                                            var dpFType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "FieldType");
                                                                                        
                                            dpFType.Value += val;
                                            console.log(dpFType.Value);
                                            var ftypeval2 = dpFType.Value;
                                            // udpate field Type
                                            // Updated field value as well 
                                            if (variableRange.length > 0) {
                                                for (var variableRow = 0; variableRow < variableRange.length; variableRow++) {
                                                    let ftype = variableRange[variableRow];
                                                    let lowVal = rowData[colkey + '_Range_Low'];
                                                    let highVal = rowData[colkey + '_Range_High'];
                                                    let lowHigh = "";
                                                    if (lowVal && highVal && lowVal != "" && highVal != "" ) {
                                                        lowHigh = lowVal + '-' + highVal;
                                                    } else if (lowVal && lowVal != "") {
                                                        lowHigh = lowVal;
                                                    } else if (highVal && highVal != "") {
                                                        lowHigh = highVal;
                                                    }
                                                    if (ftype == "95%CI") {
                                                        if (ftypeval2.indexOf("Mean") > -1) {
                                                            ftype = "Mean-CI";
                                                        } else if (ftypeval2.indexOf("Median") > -1) {
                                                            ftype = "Median-CI";
                                                        }
                                                        // Update value with low high 
                                                    } else if (ftype == "IQR") {
                                                        if (ftypeval2.indexOf("Mean") > -1) {
                                                            ftype = "Mean-IQR";
                                                        } else if (ftypeval2.indexOf("Median") > -1) {
                                                            ftype = "Median-IQR";
                                                        }
                                                    }
                                                    //else if (ftype.toLowerCase() == "range" && (variableRange.length > 1 && variableRange[0])) {
                                                    //    if (ftypeval2.indexOf("Mean") > -1) {
                                                    //        ftype = variableRange[0] + "-TotalRange";
                                                    //    } else if (ftypeval2.indexOf("Median") > -1) {
                                                    //        ftype = variableRange[0] + "-TotalRange";
                                                    //    }
                                                    //}
                                                    else if (ftype.toLowerCase() == "range") {
                                                        let FieldType1 = rowData[colkey + '_FieldType'];
                                                        if (ftypeval2.indexOf("Mean") > -1) {
                                                            ftype = "Mean-TotalRange";
                                                        } else if (ftypeval2.indexOf("Median") > -1) {
                                                            ftype = "Median-TotalRange";
                                                        }
                                                    }

                                                    if (ftype.indexOf('-') > -1 && lowHigh != "") {
                                                        Extract.ExcelImport.createFieldValue(ftype, lowHigh, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                                    } else {
                                                        val = rowData[colkey + '_SD_SE'];
                                                        if (val && val != "") {
                                                            console.log(val);
                                                            val = this.roundtoDecimal(val, 2);
                                                            console.log(val);
                                                            Extract.ExcelImport.createFieldValue(ftype, val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                                        }
                                                    }
                                                    
                                                }
                                            }

                                        } else if (key == colkey + '_Mean') {
                                            // udpate only mean or median
                                            let ftype = rowData[colkey + '_FieldType'];
                                            if (field_Type.indexOf("Mean") > -1 || field_Type.indexOf("Median") > -1 || ( ftype && (ftype.indexOf("Mean") > -1 || ftype.indexOf("Median") > -1))) {
                                                var typeTemp = "";
                                                if (field_Type.indexOf("Mean") > -1 || (ftype && ftype.indexOf("Mean") > -1)) {
                                                    typeTemp = "Mean";
                                                } else if (field_Type.indexOf("Median") > -1 || (ftype && ftype.indexOf("Median") > -1)) {
                                                    typeTemp = "Median";
                                                }
                                                val = this.convertoParenthesis(val);
                                                Extract.ExcelImport.createFieldValue(typeTemp, val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                            }
                                        }

                                        else if (key == colkey + '_Unit') {
                                            // udpate Unit
                                            var dpUnit = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "UnitLabel");
                                            dpUnit.Value = val;
                                        }
                                        else if (key == colkey + '_Per_PP') {
                                            // udpate per value for pp
                                            Per_PP_val = val;
                                        }
                                        else if (key.startsWith(colkey + '_AuthorDefinition')) {

                                            if (rowData[colkey + '_AuthorDefinition_1']) {
                                                if (val) {
                                                    val += rowData[colkey + '_AuthorDefinition_1'];
                                                }
                                            }
                                            if (rowData[colkey + '_AuthorDefinition_2']) {
                                                if (val) {
                                                    val += rowData[colkey + '_AuthorDefinition_2'];
                                                }
                                            }
                                            // udpate Authoer Defination value
                                            var dpNote = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, oset.id, oset, Extract.Outcomes.SOURCENAMES.OTHERS, "Note");
                                            dpNote.Value = val;
                                        }
                                    }
                                }
                                if (needtoCloneforMOA && true) {
                                    iterationCreatedForMOA = false;
                                    for (var indexRow = 0; indexRow < arrClonedOset.length; indexRow++) {
                                        if (arrClonedOset[indexRow] == Tcolkey) {
                                            iterationCreatedForMOA = true;
                                            break;
                                        }

                                    }

                                    if (!iterationCreatedForMOA) {
                                        // Clone data using oid and osetid and update value for n , N and per
                                        let osetCloned = Extract.ExcelImport.cloneOutcomeSets(oid, osetid);
                                        let ogvCloned = Extract.ExcelImport.getOutcomeGroupValuesByGroupId(osetCloned, groupId);
                                        ogvCloned
                                        // update MOA for PP instead of ITT
                                        let dpMOA = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeSets, osetCloned.id, osetCloned, Extract.Outcomes.SOURCENAMES.OTHERS, "MethodAnalysis");
                                        dpMOA.Value = "PP";
                                        // N_PP_val
                                        let dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogvCloned.id, ogvCloned, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                                        dpValue.Value = N_PP_val;

                                        let dpfvalue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogvCloned.id, ogvCloned, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "FieldValue");
                                        // n_PP_val
                                        Extract.ExcelImport.createFieldValue("n", n_PP_val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                        // Per_PP_val
                                        Extract.ExcelImport.createFieldValue("%", Per_PP_val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');

                                        arrClonedOset.push(Tcolkey);
                                        objClonedOgv[Tcolkey] = JSON.parse(JSON.stringify(osetCloned));
                                    } else {
                                        if (objClonedOgv[Tcolkey]) {
                                            let clonedOGV = Extract.ExcelImport.getOutcomeGroupValuesByGroupId(objClonedOgv[Tcolkey], groupId);
                                            let dpfvalue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, clonedOGV.id, clonedOGV, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "FieldValue");
                                            dpfvalue.Value = [];
                                            // N_PP_val
                                            let dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, clonedOGV.id, clonedOGV, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                                            dpValue.Value = N_PP_val;
                                            // n_PP_val
                                            Extract.ExcelImport.createFieldValue("n", n_PP_val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                            // Per_PP_val
                                            Extract.ExcelImport.createFieldValue("%", Per_PP_val, "OutcomeGroupFieldValue", dpfvalue.id, Extract.EntityTypes.Datapoints, 'Value');
                                        }

                                    }

                                }
                            }
                        }
                    }

                }
            }

            //}
        }
    }
    // Function for mapping with outcome and outcome sets. 
    outcomeOutcomeSetMapping(outcomeoset, oid, osetid) {
        if (outcomeoset[oid]) {
            outcomeoset[oid].push(osetid); // Push oset 
        } else {
            outcomeoset[oid] = []; // create empty array
            outcomeoset[oid].push(osetid); // Push oset 
        }
    }
    getoutcomeidbyName(outcomeNames, oName) {
        if (oName) {
            oName = oName.trim();
        }
        let temp_oid = "";
        if (outcomeNames[oName]) {
            temp_oid = outcomeNames[oName]; // return 
        } else {
            let outcome = Extract.ExcelImport.createOutcome(oName);
            outcomeNames[oName] = outcome.id;
            temp_oid = outcome.id;
        }
        return temp_oid;
    }
    getoutcomesetidbyoutcomeName(outcomeNames, outcome_osets, oName, key, obj_outcome_outcomeset) {
        var me = this;
        let COL_NUMBER = key.split('_');
        let temp_osetid = "";
        let temp_oid = me.getoutcomeidbyName(outcomeNames, oName);
        //createdOutcomes.push(tempdata[key]);
        //createdOutcomesids.push(oid);
        ///osetids.push(osetid);
        if (COL_NUMBER.length > 0) {
            if (obj_outcome_outcomeset[COL_NUMBER[0]]) {
                obj_outcome_outcomeset[COL_NUMBER[0]] = [temp_oid, temp_osetid]; // 1st is oid and second is osetid
            } else {
                obj_outcome_outcomeset[COL_NUMBER[0]] = []
                let outcomeSet = Extract.ExcelImport.createOutcomeSet(temp_oid);
                temp_osetid = outcomeSet.id;
                obj_outcome_outcomeset[COL_NUMBER[0]] = [temp_oid, temp_osetid]; // 1st is oid and second is osetid

                var groups = Extract.ExcelImport.getEntityAsArray('Groups');

                for (let i = 0; i < groups.length; i++) {
                    var ogv = Extract.ExcelImport.createOutcomeGroupValues(temp_osetid, false, groups[i].id); // create Outcome Group Values
                    var dpName = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "name");
                    var dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                    var dpPopulationType = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "Population Type");
                    var fieldValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "FieldValue");
                    var notReported = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "notReported");
                }
            }
        }
        me.outcomeOutcomeSetMapping(outcome_osets, temp_oid, temp_osetid);
        return temp_osetid;
    }
    getOutcomeHeaderDatabyFieldName(headerData, fieldName, colkey) {
        // if have colKey then return string value else return object with full data. 
        let value = "";
        let data = $.grep(headerData, function (e) { return e.FieldName == fieldName })
        if (data.length > 0) {
            var obj = data[0];
            if (colkey) {
                for (let key in obj) {
                    if (key.startsWith(colkey + "_")) {
                        value = obj[key];
                        break;
                    }
                }
            }
        }
        return value;
    }
    deleteEmptyOutcomeSets() {        
        var me = this;
        for (var key in Extract.Data.Outcomes) {
            for (var i = 0; i < Extract.Data.Outcomes[key].OutcomeSets.length; i++) {
                var oSet = Extract.Data.OutcomeSets[Extract.Data.Outcomes[key].OutcomeSets[i]];
                if (me.isEmptyOutcomeSet(oSet)) {
                    Extract.ExcelImport.deleteOutcomeSet(oSet.id);
                }
            }
        }
    }
    isEmptyOutcomeSet(oSet) {
        var isEmpty = true;
        for (var i = 0; i < oSet.OutcomeGroupValues.length; i++) {
            debugger
            var ogv = Extract.ExcelImport.getEntity(Extract.EntityTypes.OutcomeGroupValues, oSet.OutcomeGroupValues[i]);
            if (ogv) {                
                var Values = [];
                // Update total population with "randamized" and na 
                var group = Extract.ExcelImport.getEntity("Groups", ogv.groupId);
                //this.createDatapointAddToSource("Population Type", "Participant", 0, 4, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
                
                if (group && group.name == "Total Population") {
                    let firstTimepoint = this.getFirstTimepint(oSet);
                    if (!Ext.isEmpty(firstTimepoint)) {
                        ogv["timepoint"] = firstTimepoint
                    }

                    //ogv.timepoint.id = timepoint_standard.id;
                    // if not exist Population then create else update it 
                    let dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                    if (dpValue) {
                        if (Ext.isEmpty(dpValue.Value)) {
                            dpValue.Value = 'na';
                        }
                    }

                    var dpName = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "name");
                    if (!Ext.isEmpty(dpName)) {
                        dpName.Value = "Randomized";
                    }
                } else {
                    // Update for other population 
                    var dp = this.getDefaultPopulation(ogv.groupId);
                    var defaultName = "Participants";
                    var defaultVal = "na";
                    var isupdateName = false;
                    if (dp) {
                        var dpNm = $.grep(dp, function (e) { return e.Name == 'n Type' });
                        var dpVl = $.grep(dp, function (e) { return e.Name == 'n Value' });
                        var dpDef = $.grep(dp, function (e) { return e.Name == 'Default' });
                        
                        for (var k = 0; k < dpNm.length; k++) {
                            if (!Ext.isEmpty(dpNm[k].Value)) {
                                defaultName = dpNm[k].Value;
                                break;
                            }
                        }
                        for (var k = 0; k < dpVl.length; k++) {
                            if (!Ext.isEmpty(dpVl[k].Value)) {
                                defaultVal = dpVl[k].Value;

                                break;
                            }
                        }
                        //defaultValue = dpVl[0].Value;                                                
                    }
                    let dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
                    if (dpValue) {
                        if (Ext.isEmpty(dpValue.Value)) {
                            isupdateName = true;
                            dpValue.Value = defaultVal;
                        }
                    }
                    var dpName = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "name");
                    if ((!Ext.isEmpty(dpName) && Ext.isEmpty(dpName.Value)) || isupdateName) {
                        dpName.Value = defaultName;
                    }
                }

                var dpfvalue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.FIELDVALUE, "FieldValue");
                if (!Ext.isEmpty(dpfvalue) && !Ext.isEmpty(dpfvalue.Value)) {
                    Values = Extract.Helper.getEntityListByArrayId(dpfvalue.Value, Extract.EntityTypes.FieldValues);
                }
                for (var j = 0; j < Values.length; j++) {
                    if (!Ext.isEmpty(Values[j].Value)) {
                        isEmpty = false
                    }
                }
            }
        }
        return isEmpty;
    }
    getFirstTimepint(oSet) {
        for (let groupRow = 0; groupRow < oSet.OutcomeGroupValues.length; groupRow++) {
            let ogv = Extract.ExcelImport.getEntity(Extract.EntityTypes.OutcomeGroupValues, oSet.OutcomeGroupValues[groupRow]);
            if (ogv) {
                let group = Extract.ExcelImport.getEntity("Groups", ogv.groupId);
                //this.createDatapointAddToSource("Population Type", "Participant", 0, 4, Extract.EntityTypes.Groups, grpId, Extract.Groups.SOURCENAMES.ARM_POPULATION);
                if (group && group.name != "Total Population") {
                    return ogv.timepoint;
                }
            }
        }
    }
    updateParticipants(ogv, rowData, key, colkey) {
        var val = "";
        if (key == colkey + '_Population_ITT' || key == colkey + '_Population' || key == colkey + '_Population_PP') {
            val = rowData[key];
        }
        var dpValue = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "value");
        if (!Ext.isEmpty(val)) {
            dpValue.Value = val;
        }
        var defaultName = "";
        if (!Ext.isEmpty(val)) {
            defaultName = this.getDefaultPopulationName(ogv.groupId, val.trim());
        }
        defaultName = defaultName.trim();
        var dpName = Extract.ExcelImport.getDataPointByName(Extract.EntityTypes.OutcomeGroupValues, ogv.id, ogv, Extract.Outcomes.SOURCENAMES.POPULATION, "name");
        if (!Ext.isEmpty(defaultName)) {
            dpName.Value = defaultName;
        }
        else {
            dpName.Value = "Participants";
        }
    }
    convertoParenthesis(val) {
        if (val) {
            val = val.toString().trim();
            if (val.substring(0, 1) == "-") {
                val = "(" + val.substring(1) + ")";
            }
        }
        return val;
    }
    roundtoDecimal(val, decimalpoint) {
        if (!Ext.isEmpty(val)) {
            var per = parseFloat(val);
            var fractionlength = per.toString().indexOf('.') > -1 ? per.toString().split(".")[1].length : 0;
            if (fractionlength > 0) {
                if (fractionlength > 1) {
                    fractionlength = 2;
                }
                per = fractionlength >= 0 ? per.toFixed(fractionlength) : per;
                return per;
                 
            } 
        }
        return val;
    }
    getDefaultPopulationName(groupId, val) {
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
                                if (dpVl.length > 0) {
                                    if (dpVl[0].Value == val) {
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
    }
    getDefaultPopulation (groupId) {
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
                                                return dp;
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
    }
    //#endregion
}