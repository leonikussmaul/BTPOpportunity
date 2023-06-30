


using OpportunityService as service from '../../srv/opportunities';

// https://sap.github.io/odata-vocabularies/vocabularies/UI.xml
annotate service.opportunityHeader with {
    // @Semantics.aggregate: true
    account                   @Common.Label        : 'Account'
                              @Common.FieldControl : #Mandatory;
    marketUnit                @Common.Label        : 'Market Unit'
                              @Common.FieldControl : #Mandatory;
    clientContactPerson       @Common.Label        : 'Client Contact';
    opportunityClosedQuarter  @Common.Label        : 'Q. Closed';
    opportunityCreatedQuarter @Common.Label        : 'Q. Created';
    opportunityID             @Common.Label        : 'Opportunity ID';
    opportunityInCRM          @Common.Label        : 'Value in CRM';
    opportunityValue          @Common.Label        : 'Value';
    primaryContact            @Common.Label        : 'Owner';
    source                    @Common.Label        : 'Source';
    ssa                       @Common.Label        : 'SSA';
    status                    @Common.Label        : 'Status';
    topic                     @Common.Label        : 'Topic';
    priority                  @Common.Label        : 'Priority';
    opportunityStartDate      @Common.Label        : 'Start Date';
    opportunityDueDate        @Common.Label        : 'Due Date';
    progress                  @Common.Label        : 'Progress';
    isFavorite                @Common.Label        : 'Favorite';
    noteDate                  @Common.Label        : 'Note Date';
    noteText                  @Common.Label        : 'Note Text';

};

annotate service.opportunityHeaderCopy with {
    // @Semantics.aggregate: true
    account                   @Common.Label        : 'Account'
                              @Common.FieldControl : #Mandatory;
    marketUnit                @Common.Label        : 'Market Unit'
                              @Common.FieldControl : #Mandatory;
    clientContactPerson       @Common.Label        : 'Client Contact';
    opportunityClosedQuarter  @Common.Label        : 'Q. Closed';
    opportunityCreatedQuarter @Common.Label        : 'Q. Created';
    opportunityID             @Common.Label        : 'Opportunity ID';
    opportunityInCRM          @Common.Label        : 'Value in CRM';
    opportunityValue          @Common.Label        : 'Value';
    primaryContact            @Common.Label        : 'Owner';
    source                    @Common.Label        : 'Source';
    ssa                       @Common.Label        : 'SSA';
    status                    @Common.Label        : 'Status';
    topic                     @Common.Label        : 'Topic';
    priority                  @Common.Label        : 'Priority';
    opportunityStartDate      @Common.Label        : 'Start Date';
    opportunityDueDate        @Common.Label        : 'Due Date';
    progress                  @Common.Label        : 'Progress';
    isFavorite                @Common.Label        : 'Favorite';
    noteDate                  @Common.Label        : 'Note Date';
    noteText                  @Common.Label        : 'Note Text';

};


// tasks and actions
annotate service.opportunityActionItems with {
    actionTask     @Common.Label        : 'Description'
                   @Common.FieldControl : #Mandatory;
    actionTitle    @Common.Label        : 'Task'
                   @Common.FieldControl : #Mandatory;
    actionProgress @Common.Label        : 'Progress';
    actionTopic    @Common.Label        : 'Topic';
    actionOwner    @Common.Label        : 'Owner';
    actionDueDate  @Common.Label        : 'Due Date';
    actionPriority @Common.Label        : 'Priority';
    actionCustomer @Common.Label        : 'Account';

};

// subtasks
annotate service.opportunitySubTasks with {
    subTask          @Common.Label        : 'Sub-Task'
                     @Common.FieldControl : #Mandatory;
    subTaskCompleted @Common.Label        : 'Completed';
    subTaskDueDate   @Common.Label        : 'Due Date';
    subTaskOwner     @Common.Label        : 'Owner';
};


annotate service.opportunityDeliverables with {
    deliverable      @Common.Label : 'Deliverable';
    primaryContact   @Common.Label : 'Owner';
    deliverableDate  @Common.Label : 'Date';
    status           @Common.Label : 'Status';
    shortDescription @Common.Label : 'Short Desc.';
    completed        @Common.Label : 'Completed';
    completedOn      @Common.Label : 'Completed On';
};

annotate service.opportunityHeaderCopy with @(
    // Header-level annotations
    Aggregation.ApplySupported           : {
        PropertyRestrictions   : true,
        Transformations        : [
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
        AggregatableProperties : [{
            $Type    : 'Aggregation.AggregatablePropertyType',
            Property : opportunityValue
        },
        {
             $Type    : 'Aggregation.AggregatablePropertyType',
            Property : progress
        }],
        GroupableProperties    : [
            marketUnit,
            status,
            topic,
            account,
            opportunityInCRM,
            opportunityCreatedQuarter,
            opportunityClosedQuarter,
            clientContactPerson,
            priority,
            progress
            
        ]
    },


    Aggregation.CustomAggregate #opportunityValue : 'Edm.Int32',
    Aggregation.CustomAggregate #progress : 'Edm.Int32',

    UI : {Chart : {
        Title       : 'Default',
        Description : 'Default chart',
        ChartType  : #Column,
        Dimensions : [marketUnit,account],
        Measures   : [opportunityValue],
        DimensionAttributes : [{
            $Type     : 'UI.ChartDimensionAttributeType',
            Dimension : marketUnit,
            Role      : #Series
        }]
    }}) 

{
    // Element-level annotations
    marketUnit    @(
        title               : '{i18n>marketUnit}',
        Analytics.Dimension : true,
        Role                : #Series
    );
    topic     @(
        title               : '{i18n>topic}',
        Analytics.Dimension : true
    );
    account     @(
        title               : '{i18n>account}',
        Analytics.Dimension : true
    );
    status  @(
        title               : '{i18n>status}',
        Analytics.Dimension : true
    );
    priority  @(
        title               : '{i18n>priority}',
        Analytics.Dimension : true
    );
    opportunityValue         @(
        title               : '{i18n>opportunityValue}',
        Analytics.Measure   : true,
        Aggregation.default : #SUM,
    );
      progress         @(
        title               : '{i18n>progress}',
        Analytics.Measure   : true,
        Aggregation.default : #SUM,
    );
    clientContactPerson @(
        title               : '{i18n>clientContactPerson}',
        Analytics.Dimension : true
    );
     opportunityClosedQuarter         @(
        title               : '{i18n>opportunityClosedQuarter}',
        Analytics.Dimension : true
    );
     opportunityCreatedQuarter         @(
        title               : '{i18n>opportunityCreatedQuarter}',
        Analytics.Dimension : true
    );
    opportunityInCRM         @(
        title               : '{i18n>opportunityInCRM}',
        Analytics.Dimension : true
    );
   
}


// status
// topic
// priority
// progress