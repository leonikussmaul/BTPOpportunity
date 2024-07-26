using OpportunityService as service from '../../srv/opportunities';

// https://sap.github.io/odata-vocabularies/vocabularies/UI.xml
annotate service.opportunityHeader with {
    // @Semantics.aggregate: true
    account                   @Common.Label       : 'Account'
                              @Common.FieldControl: #Mandatory;
    marketUnit                @Common.Label       : 'Market Unit'
                              @Common.FieldControl: #Mandatory;
    clientContactPerson       @Common.Label       : 'Client Contact';
    opportunityClosedQuarter  @Common.Label       : 'Q. Closed';
    opportunityCreatedQuarter @Common.Label       : 'Q. Created';
    opportunityID             @Common.Label       : 'Opportunity ID';
    opportunityInCRM          @Common.Label       : 'Value in CRM';
    opportunityValue          @Common.Label       : 'Value';
    primaryContact            @Common.Label       : 'Owner';
    source                    @Common.Label       : 'Source';
    ssa                       @Common.Label       : 'SSA';
    status                    @Common.Label       : 'Status';
    topic                     @Common.Label       : 'Topic';
    priority                  @Common.Label       : 'Priority';
    opportunityStartDate      @Common.Label       : 'Start Date';
    opportunityDueDate        @Common.Label       : 'Due Date';
    progress                  @Common.Label       : 'Progress';
    isFavorite                @Common.Label       : 'Favorite';
    noteDate                  @Common.Label       : 'Note Date';
    noteText                  @Common.Label       : 'Note Text';
    adoption                  @Common.Label       : 'Adoption';
    consumption               @Common.Label       : 'Consumption';

};

annotate service.opportunityHeaderCopy with {
    // @Semantics.aggregate: true
    account                   @Common.Label       : 'Account'
                              @Common.FieldControl: #Mandatory;
    marketUnit                @Common.Label       : 'Market Unit'
                              @Common.FieldControl: #Mandatory;
    clientContactPerson       @Common.Label       : 'Client Contact';
    opportunityClosedQuarter  @Common.Label       : 'Q. Closed';
    opportunityCreatedQuarter @Common.Label       : 'Q. Created';
    opportunityID             @Common.Label       : 'Opportunity ID';
    opportunityInCRM          @Common.Label       : 'Value in CRM';
    opportunityValue          @Common.Label       : 'Value';
    primaryContact            @Common.Label       : 'Owner';
    source                    @Common.Label       : 'Source';
    ssa                       @Common.Label       : 'SSA';
    status                    @Common.Label       : 'Status';
    topic                     @Common.Label       : 'Topic';
    priority                  @Common.Label       : 'Priority';
    opportunityStartDate      @Common.Label       : 'Start Date';
    opportunityDueDate        @Common.Label       : 'Due Date';
    progress                  @Common.Label       : 'Progress';
    isFavorite                @Common.Label       : 'Favorite';
    noteDate                  @Common.Label       : 'Note Date';
    noteText                  @Common.Label       : 'Note Text';
    adoption                  @Common.Label       : 'Adoption';
    consumption               @Common.Label       : 'Consumption';

};


// tasks and actions
annotate service.opportunityActionItems with {
    actionTask     @Common.Label       : 'Description'
                   @Common.FieldControl: #Mandatory;
    actionTitle    @Common.Label       : 'Task'
                   @Common.FieldControl: #Mandatory;
    actionProgress @Common.Label       : 'Progress';
    actionTopic    @Common.Label       : 'Topic';
    actionOwner    @Common.Label       : 'Owner';
    actionDueDate  @Common.Label       : 'Due Date';
    actionPriority @Common.Label       : 'Priority';
    actionCustomer @Common.Label       : 'Account';

};

// maturity
annotate service.opportunityMaturityCopy with {
    topic    @Common.Label: 'Topic';
    maturity @Common.Label: 'Maturity';
    comment  @Common.Label: 'Comment';

};

// subtasks
annotate service.opportunitySubTasks with {
    subTask          @Common.Label       : 'Sub-Task'
                     @Common.FieldControl: #Mandatory;
    subTaskCompleted @Common.Label       : 'Completed';
    subTaskDueDate   @Common.Label       : 'Due Date';
    subTaskOwner     @Common.Label       : 'Owner';
};


annotate service.opportunityDeliverables with {
    deliverable      @Common.Label: 'Deliverable';
    primaryContact   @Common.Label: 'Owner';
    deliverableDate  @Common.Label: 'Date';
    status           @Common.Label: 'Status';
    shortDescription @Common.Label: 'Short Desc.';
    completed        @Common.Label: 'Completed';
    completedOn      @Common.Label: 'Completed On';
};


annotate service.GenieAIInternal with {
    name              @Common.Label: 'Name';
    internal          @Common.Label: 'Internal';
    email             @Common.Label: 'Email';
    role              @Common.Label: 'Role';
    functionalArea    @Common.Label: 'Functional Area';
    orgArea           @Common.Label: 'Org Area';
    source            @Common.Label: 'Source';
    city              @Common.Label: 'City';
    country           @Common.Label: 'Country';
    region            @Common.Label: 'Region';
    month             @Common.Label: 'Month';
    workshopStartDate @Common.Label: 'Start Date';
    workshopEndDate   @Common.Label: 'End Date';
    notes             @Common.Label: 'Notes';
    level             @Common.Label: 'Level';
    status            @Common.Label: 'Status';
    isFavorite        @Common.Label: 'Favorite';
};

annotate service.GenieAICustomer with {
    name              @Common.Label: 'Name';
    internal          @Common.Label: 'Internal';
    email             @Common.Label: 'Email';
    source            @Common.Label: 'Source';
    city              @Common.Label: 'City';
    country           @Common.Label: 'Country';
    region            @Common.Label: 'Region';
    month             @Common.Label: 'Month';
    workshopStartDate @Common.Label: 'Start Date';
    workshopEndDate   @Common.Label: 'End Date';
    notes             @Common.Label: 'Notes';
    level             @Common.Label: 'Level';
    status            @Common.Label: 'Status';
    isFavorite        @Common.Label: 'Favorite';
};

annotate service.GenieAIPartner with {
    name              @Common.Label: 'Name';
    internal          @Common.Label: 'Internal';
    email             @Common.Label: 'Email';
    source            @Common.Label: 'Source';
    city              @Common.Label: 'City';
    country           @Common.Label: 'Country';
    region            @Common.Label: 'Region';
    month             @Common.Label: 'Month';
    workshopStartDate @Common.Label: 'Start Date';
    workshopEndDate   @Common.Label: 'End Date';
    notes             @Common.Label: 'Notes';
    level             @Common.Label: 'Level';
    status            @Common.Label: 'Status';
    isFavorite        @Common.Label: 'Favorite';
};

annotate service.GenieAIWorkshops with {
    name              @Common.Label: 'Name';
    city              @Common.Label: 'City';
    country           @Common.Label: 'Country';
    month             @Common.Label: 'Month';
    workshopStartDate @Common.Label: 'Start Date';
    workshopEndDate   @Common.Label: 'End Date';
    notes             @Common.Label: 'Notes';
    level             @Common.Label: 'Level';
    status            @Common.Label: 'Status';
    number            @Common.Label: 'Number';
    participants            @Common.Label: 'Participants';
    workshopType            @Common.Label: 'Type';
};

annotate service.opportunityHeaderCopy with @(
    // Header-level annotations
    Aggregation.ApplySupported                   : {
        PropertyRestrictions  : true,
        Transformations       : [
            'aggregate',
            'topcount',
            'bottomcount',
            'identity',
            'concat',
            'groupby',
            'filter',
            'expand',
            'top',
            'skip',
            'orderby',
            'search'
        ],
        AggregatableProperties: [
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: opportunityValue
            },
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: progress
            },
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: adoption
            },
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: consumption
            }
        ],
        GroupableProperties   : [
            marketUnit,
            status,
            topic,
            account,
            opportunityInCRM,
            opportunityCreatedQuarter,
            opportunityClosedQuarter,
            clientContactPerson,
            priority,
            progress,
            adoption,
            consumption

        ]
    },


    Aggregation.CustomAggregate #opportunityValue: 'Edm.Int32',
    Aggregation.CustomAggregate #progress        : 'Edm.Int32',
    Aggregation.CustomAggregate #adoption        : 'Edm.Int32',
    Aggregation.CustomAggregate #consumption     : 'Edm.Int32',

    UI                                           : {Chart: {
        Title              : 'Default',
        Description        : 'Default chart',
        ChartType          : #Column,
        Dimensions         : [
            marketUnit,
            account
        ],
        Measures           : [opportunityValue],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: marketUnit,
            Role     : #Series
        }]
    }}
)

{
    // Element-level annotations
    marketUnit                @(
        title              : '{i18n>marketUnit}',
        Analytics.Dimension: true,
        Role               : #Series
    );
    topic                     @(
        title              : '{i18n>topic}',
        Analytics.Dimension: true
    );
    account                   @(
        title              : '{i18n>account}',
        Analytics.Dimension: true
    );
    status                    @(
        title              : '{i18n>status}',
        Analytics.Dimension: true
    );
    priority                  @(
        title              : '{i18n>priority}',
        Analytics.Dimension: true
    );
    opportunityValue          @(
        title              : '{i18n>opportunityValue}',
        Analytics.Measure  : true,
        Aggregation.default: #SUM,
    );
    adoption                  @(
        title              : '{i18n>adoption}',
        Analytics.Measure  : true,
        Aggregation.default: #AVG,
    );
    consumption               @(
        title              : '{i18n>consumption}',
        Analytics.Measure  : true,
        Aggregation.default: #AVG,
    );
    progress                  @(
        title              : '{i18n>progress}',
        Analytics.Measure  : true,
        Aggregation.default: #SUM,
    );
    clientContactPerson       @(
        title              : '{i18n>clientContactPerson}',
        Analytics.Dimension: true
    );
    opportunityClosedQuarter  @(
        title              : '{i18n>opportunityClosedQuarter}',
        Analytics.Dimension: true
    );
    opportunityCreatedQuarter @(
        title              : '{i18n>opportunityCreatedQuarter}',
        Analytics.Dimension: true
    );
    opportunityInCRM          @(
        title              : '{i18n>opportunityInCRM}',
        Analytics.Dimension: true
    );

}

annotate service.teamForecastCopy with @(
    // Header-level annotations
    Aggregation.ApplySupported           : {
        PropertyRestrictions  : true,
        Transformations       : [
            'aggregate',
            'topcount',
            'bottomcount',
            'identity',
            'concat',
            'groupby',
            'filter',
            'expand',
            'top',
            'skip',
            'orderby',
            'search'
        ],
        AggregatableProperties: [
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: forecast
            },
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: actual
            }
        ],
        GroupableProperties   : [
            forecast,
            actual,
            average,
            year,
            month,
            userID_inumber,
            order

        ]
    },


    Aggregation.CustomAggregate #forecast: 'Edm.Int32',
    Aggregation.CustomAggregate #actual  : 'Edm.Int32',

    UI                                   : {Chart: {
        Title              : 'Default',
        Description        : 'Default chart',
        ChartType          : #Combination,
        Dimensions         : [
            order,
            month
        ],
        Measures           : [
            actual,
            forecast
        ],
        DimensionAttributes: [
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: order,
                Role     : #Category
            },
            {
                $Type    : 'UI.ChartDimensionAttributeType',
                Dimension: month,
                Role     : #Category
            }
        ]
    }}
)

{
    // Element-level annotations
    month    @(
        title              : '{i18n>month}',
        Analytics.Dimension: true,
        Role               : #Category
    );
    year     @(
        title              : '{i18n>year}',
        Analytics.Dimension: true
    );
    order    @(
        title              : '{i18n>order}',
        Analytics.Dimension: true,
        Role               : #Category
    );
    actual   @(
        title              : '{i18n>actual}',
        Analytics.Measure  : true,
        Aggregation.default: #AVG,
    );
    forecast @(
        title              : '{i18n>forecast}',
        Analytics.Measure  : true,
        Aggregation.default: #AVG,
    );


}

//maturity

annotate service.opportunityMaturityCopy with @(
    // Header-level annotations
    Aggregation.ApplySupported           : {
        PropertyRestrictions  : true,
        Transformations       : [
            'aggregate',
            'topcount',
            'bottomcount',
            'identity',
            'concat',
            'groupby',
            'filter',
            'expand',
            'top',
            'skip',
            'orderby',
            'search'
        ],
        AggregatableProperties: [
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: maturity
            },
            {
                $Type   : 'Aggregation.AggregatablePropertyType',
                Property: topic
            }
        ],
        GroupableProperties   : [
            maturity,
            topic

        ]
    },


    Aggregation.CustomAggregate #maturity: 'Edm.Int32',

    UI                                   : {Chart: {
        Title              : 'Default',
        Description        : 'Default chart',
        ChartType          : #Combination,
        Dimensions         : [topic],
        Measures           : [maturity],
        DimensionAttributes: [{
            $Type    : 'UI.ChartDimensionAttributeType',
            Dimension: topic,
            Role     : #Series
        }]
    }}
)

{
    // Element-level annotations
    topic    @(
        title              : '{i18n>topic}',
        Analytics.Dimension: true,
        Role               : #Series
    );

    maturity @(
        title              : '{i18n>maturity}',
        Analytics.Measure  : true,
        Aggregation.default: #AVG
    );

}
