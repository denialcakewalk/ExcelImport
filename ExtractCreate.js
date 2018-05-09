
var Extract = Extract ? Extract : {}

Extract.Create = {

    DataPoints: function (ValueType, Name, Value, state, Row, Column) {

        var obj = {};
        obj.id = Utils.getUniqueId();
        obj.ValueType = ValueType;
        obj.Name = Name;
        obj.Value = Value;
        obj.state = state;
        obj.Row = Row;
        obj.Column = Column;
        obj.QC = {};
        obj.OtherInfo = {};
        return obj;
    },
    DataPointsFRDummy: function (Id, ValueType, Name, Value, state, Row, Column) {

        var obj = {};
        obj.id = Id ? Id : Utils.getUniqueId();
        obj.ValueType = ValueType;
        obj.Name = Name;
        obj.Value = Value;
        obj.state = state;
        obj.Row = Row;
        obj.Column = Column;
        obj.QC = {};
        obj.OtherInfo = {};
        return obj;
    },
    Phases: function (name, start, startUnit, end, endUnit, source, type, fieldType, fieldTypeValue, drugName, TimepointType, description, descriptionHigh) {
        var me = this;
        var phase = {};

        if (source == "dateInterval") {
            phase = {
                id: Utils.getUniqueId(),
                source: source,
                type: "",
                fromMonth: "",
                fromDay: "",
                fromYear: "",
                toMonth: "",
                toDay: "",
                toYear: ""
            };
        }
        else {
            phase.description = description;
            phase.descriptionHigh = descriptionHigh;
            phase.drugName = drugName;
            phase.end = end;
            phase.endUnit = endUnit;
            phase.fieldType = fieldType;
            phase.fieldTypeValue = fieldTypeValue;
            phase.id = Utils.getUniqueId();
            phase.name = name;
            phase.source = source;
            phase.start = start;
            phase.startUnit = startUnit;
            phase.type = type;
        }
        phase.index = me.GetIndex(Extract.EntityTypes.Phases)
        return phase;
    },

    FieldValues: function (name, value, source) {

        var fieldValue = {
            id: Utils.getUniqueId(),
            Name: name,
            Value: value,
            SourceName: source
        };

        return fieldValue;
    },

    PropertySets: function () {

        propertySet =
            {
                id: Utils.getUniqueId(),
                armId: "",
                type: "",
                isAdded: false,
                pValue: 0,
                amType: "",
                amValue: "",
                amUnit: "",
                CIPercent: "",
                CIValue: "",
                SEValue: "",
                pSDValue: "",
                amStatisticalTest: "",
                amStatisticalTestValue: "",
                amDegOfFreedom: "",
                coVariation: "",
                IsAdjusted: false,
                AdjustedDescription: "",
                amPersonCount: "",
                Variance: "",
                VarianceValue: "",
                left: [],
                right: [],
                Sources: []

            };

        return propertySet;
    },

    Outcomes: function (outcomename) {

        var me = this;

        var outcome = {};

        outcome = {
            name: outcomename,
            id: Utils.getUniqueId(),
            Sources: {},
            OutcomeSets: [],
            index: me.GetIndex(Extract.EntityTypes.Outcomes)
        };

        return outcome;
    },

    OutcomeSets: function () {
        var outcomeSet = {};

        outcomeSet =
            {
                id: Utils.getUniqueId(),
                OutcomeGroupValues: [],
                Sources: {}
            };
        //outcome.OutcomeSets.push(outcomeSet);

        return outcomeSet;
    },

    OutcomeGroupValues: function () {
        var outcomeGroupValue = {};

        outcomeGroupValue = {
            id: Utils.getUniqueId(),
            groupId: 1,
            timepoint: { id: 1, dateIntervalId:0 ,timeIntervalId:0 ,type: "common"},
            Values: [],
            Sources: {}
        };
        //outcomeSet.OutcomeGroupValues.push(outcomeGroupValue);

        return outcomeGroupValue;
    },

    InterventionSets: function (name, groupId, caseNo) {
        
        var interventionSet = {
            Sources: {},
            name: name,
            id: Utils.getUniqueId(),
            groupId: groupId,
            caseNo: caseNo,
            Interventions: []
        }

        return interventionSet;
    },

    Interventions: function (phaseid, intervSetId, grpId) {
        
        var intervention = {
            groupId: grpId,
            phaseid: phaseid,
            intervSetId: intervSetId,
            id: Utils.getUniqueId(),
            Sources: {}
        };

        return intervention;
    },
  
    Highlights: function (dpId) {

        var obj = {
            Coordinates: [],
            highlightid: new Date().getTime(),
            isStrikeThrough: false,
            mainElementID: "",
            propType: "",
            refId: "",
            selectedText: "",
            textColor: "",
            textComment: "",
        }
        return obj;
    },

    Groups: function (group) {
        
        var me = this;
        var groupObj = {};

        groupObj = {
            id: Utils.getUniqueId(),
            name: group,
            Sources: {},
            Participants: [],
            Type: 'Arm',
            InterventionSets: [],
            GroupType: '',
            displayName: group,
            index: me.GetIndex(Extract.EntityTypes.Groups)
            //BrandName: ''
        }
        return groupObj;
    },

    Notes: function (TaskId, TaskDetailId, ReferenceId, Notes, CreatedBy, CreatedByName, CreatedOn, ToEmails, UserNames, IsEmailSent) {
        var obj = {};
        obj.id = Utils.getUniqueId();
        obj.TaskId = TaskId;
        obj.TaskDetailId = TaskDetailId;
        obj.ReferenceId = ReferenceId;
        obj.Notes = Notes;
        obj.CreatedBy = CreatedBy;
        obj.CreatedByName = CreatedByName;
        obj.CreatedOn = CreatedOn;
        obj.ToEmails = ToEmails;
        obj.UserNames = UserNames;
        obj.IsEmailSent = IsEmailSent;
        return obj;
    },

    Participants: function (Gender, Number, Percentage, sourceName) {
        var participant = {
            Gender: Gender,
            Number: Number,
            Percentage: Percentage,
            id: Utils.getUniqueId(),
            SourceName: sourceName
        }
        return participant;
    },

    GetIndex: function (type) {

        var index = 0;

        if (!Extract.Data[type]) {
            return index;
        }

        var objList = Extract.Data[type];
        
        for(var key in objList)
        {
            var obj = objList[key];
            
            if (obj.index && index < obj.index) {
                index = obj.index;
            }
        }
        return index + 1;
    }

}