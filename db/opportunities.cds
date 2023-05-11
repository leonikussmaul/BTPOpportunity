namespace sapbtp.opportunities;

@cds.autoexpose
entity opportunityHeader {
    key opportunityID             : Integer;
        source                    : String(20);
        priority                  : String(20);
        clientContactPerson       : String(255);
        ssa                       : String(255);
        account                   : String(255);
        marketUnit                : String(255);
        topic                     : String(255);
        status                    : String(50);
        primaryContact            : String(255);
        opportunityStartDate      : Date;
        opportunityDueDate        : Date;
        progress                  : Integer;
        isFavorite                : Boolean;
        opportunityCreatedQuarter : String(10);
        opportunityClosedQuarter  : String(10);
        opportunityValue          : Integer;
        opportunityInCRM          : String(3);
        noteText                  : String(800);
        noteDate                  : Date;
        actionItems               : Composition of many opportunityActionItems
                                        on actionItems.opptID = $self;
        topics                    : Composition of many opportunityTopics
                                        on topics.opptID = $self;
        deliverables              : Composition of many opportunityDeliverables
                                        on deliverables.opptID = $self;
};

@cds.autoexpose
entity opportunityActionItems {
    key ID              : UUID;
        opptID          : Association to opportunityHeader;
        actionDueDate   : Date;
        actionCustomer     : String(255);
        actionTitle     : String(255);
        actionTask      : String(800);
        actionOwner     : String(20);
        actionProgress  : Integer;
        actionTopic     : String(255);
        actionPriority  : String(10);
        actionPriorityNumber: Integer; 
        subTasks               : Composition of many opportunitySubTasks
                                        on subTasks.opptID = $self;
                                
};

@cds.autoexpose
entity opportunitySubTasks {
    key ID     : UUID;
        opptID : Association to opportunityActionItems;
        subTask  : String(800);
        subTaskDueDate: Date;
        subTaskOwner:  String(20);
        subTaskCompleted: Boolean; 
        subTaskOrder: Integer; 
        subTaskStatus: String(50); 
};

@cds.autoexpose
entity opportunityTopics {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        topic  : String(255);
};

@cds.autoexpose
entity opportunityTopicsVH {
    key ID     : UUID;
        topic  : String(255);
};

@cds.autoexpose
entity opportunityDeliverables {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        deliverable  : String(255);
        deliverableDate  : Date; 
};

@cds.autoexpose
entity opportunityDeliverablesVH {
    key ID     : UUID;
        deliverable  : String(255);
        deliverableDate  : Date; 
};

@cds.autoexpose
entity opportunityPrimaryContactVH {
    key ID     : UUID;
        primaryContact  : String(255);
};

@cds.autoexpose
entity opportunityQuartersVH {
    key ID     : UUID;
        opportunityQuarter  : String(10);
        opportunityYear  : Integer;
};

@cds.autoexpose
entity opportunityStatusVH {
    key ID     : UUID;
        status  : String(20);
};

@cds.autoexpose
entity opportunityMarketUnitVH {
    key ID     : UUID;
        marketUnit  : String(15);
};

@cds.autoexpose
entity opportunityPriorityVH {
    key ID     : UUID;
        priority  : String(10);
};

@cds.autoexpose
entity opportunitySSAVH {
    key ID     : UUID;
        SSA  : String(50);
};

@cds.autoexpose
entity opportunitySubTaskStatus {
    key ID     : UUID;
        subTaskStatus  : String(50);
};


