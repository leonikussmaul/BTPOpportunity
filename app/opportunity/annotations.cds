using OpportunityService as service from '../../srv/opportunities';

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


// annotate  {
//   @Analytics.AggregatedProperty #min: {
//     Name                : 'minPricing',
//     AggregationMethod   : 'min',
//     AggregatableProperty: 'opportunityValue',
//     ![@Common.Label]    : 'Minimum Net Amount'
//   }
//   @Analytics.AggregatedProperty #max: {
//     Name                : 'maxPricing',
//     AggregationMethod   : 'max',
//     AggregatableProperty: 'opportunityValue',
//     ![@Common.Label]    : 'Maximum Net Amount'
//   }
//   @Analytics.AggregatedProperty #avg: {
//     Name                : 'avgPricing',
//     AggregationMethod   : 'average',
//     AggregatableProperty: 'opportunityValue',
//     ![@Common.Label]    : 'Average Net Amount'
//   }
//   @Analytics.AggregatedProperty #sum: {
//     Name                : 'totalPricing',
//     AggregationMethod   : 'sum',
//     AggregatableProperty: 'opportunityValue',
//     ![@Common.Label]    : 'Total Net Amount'
//   }

//   @Aggregation.ApplySupported       : {
//     Transformations         : [
//       'aggregate',
//       'topcount',
//       'bottomcount',
//       'identity',
//       'concat',
//       'groupby',
//       'filter',
//       'expand',
//       'top',
//       'skip',
//       'orderby',
//       'search'
//     ],
//     CustomAggregationMethods: ['Custom.concat'],
//     Rollup                  : #None,
//     PropertyRestrictions    : true,
//     GroupableProperties     : [
//       opportunityValue
//     ],
//     AggregatableProperties  : [{Property: opportunityValue}]
//   }


//   annotate service.opportunityHeader with @UI.Chart #ChartQualifier: {
//     $Type              : 'UI.ChartDefinitionType',
//     Title              : 'Chart Title',
//     Description        : 'Chart Description',
//     ChartType          : #Column,
//     DynamicMeasures    : ['@Analytics.AggregatedProperty#sum'],
//     Dimensions         : [account, marketUnit],
//     MeasureAttributes  : [{
//       $Type         : 'UI.ChartMeasureAttributeType',
//       DynamicMeasure: '@Analytics.AggregatedProperty#sum',
//       Role          : #Axis1
//     }],
//     DimensionAttributes: [{
//       $Type    : 'UI.ChartDimensionAttributeType',
//       Dimension: opportunityValue,
//       Role     : #Category
//     }]
//   };
// }
