using OpportunityService as service from '../../srv/opportunities';


annotate service.opportunityHeader with {
    account @Common.Label : 'Account'
            @Common.FieldControl : #Mandatory
};
annotate service.opportunityHeader with {
    clientContactPerson @Common.Label : 'Client Contact'
};
annotate service.opportunityHeader with {
    marketUnit @Common.Label : 'Market Unit'
                @Common.FieldControl : #Mandatory
};
annotate service.opportunityHeader with {
    opportunityClosedQuarter @Common.Label : 'Q. Closed'
};
annotate service.opportunityHeader with {
    opportunityCreatedQuarter @Common.Label : 'Q. Created'
};

annotate service.opportunityHeader with {
    opportunityID @Common.Label : 'Opportunity ID'
};
annotate service.opportunityHeader with {
    opportunityInCRM @Common.Label : 'Value in CRM'
};
annotate service.opportunityHeader with {
    opportunityValue @Common.Label : 'Value'
};
annotate service.opportunityHeader with {
    primaryContact @Common.Label : 'Owner'
};
annotate service.opportunityHeader with {
    source @Common.Label : 'Source'
};
annotate service.opportunityHeader with {
    ssa @Common.Label : 'SSA'
};
annotate service.opportunityHeader with {
    status @Common.Label : 'Status'
};
annotate service.opportunityHeader with {
    topic @Common.Label : 'Topic'
};
annotate service.opportunityHeader with {
    priority @Common.Label : 'Priority'
};
annotate service.opportunityHeader with {
    opportunityStartDate @Common.Label : 'Start Date'
};
annotate service.opportunityHeader with {
    opportunityDueDate @Common.Label : 'Due Date'
};
annotate service.opportunityHeader with {
    progress @Common.Label : 'Progress'
};
annotate service.opportunityHeader with {
    isFavorite @Common.Label : 'Favorite'
};
annotate service.opportunityHeader with {
    noteDate @Common.Label : 'Note Date'
};
annotate service.opportunityHeader with {
    noteText @Common.Label : 'Note Text'
};

// tasks and actions
annotate service.opportunityActionItems with {
    actionProgress @Common.Label : 'Progress'
};
annotate service.opportunityActionItems with {
    actionTopic @Common.Label : 'Topic'
};
annotate service.opportunityActionItems with {
    actionTask @Common.Label : 'Task'
};
annotate service.opportunityActionItems with {
    actionOwner @Common.Label : 'Owner'
};
annotate service.opportunityActionItems with {
    actionDueDate @Common.Label : 'Due Date'
};
annotate service.opportunityActionItems with {
    actionPriority @Common.Label : 'Priority'
};
annotate service.opportunityActionItems with {
    actionCustomer @Common.Label : 'Account'
};


// subtasks
annotate service.opportunitySubTasks with {
    subTaskCompleted @Common.Label : 'Completed'
};

annotate service.opportunitySubTasks with {
    subTaskDueDate @Common.Label : 'Due Date'
};

annotate service.opportunitySubTasks with {
    subTaskOwner @Common.Label : 'Owner'
};

annotate service.opportunitySubTasks with {
    subTask @Common.Label : 'Sub-Task'
};

