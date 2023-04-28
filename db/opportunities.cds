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
        opportunityCreatedQuarter : String(2);
        opportunityClosedQuarter  : String(2);
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
        actionTitle     : String(255);
        actionTask      : String(800);
        actionOwner     : String(20);
        actionProgress  : Integer;
        actionTopic     : String(255);
        actionPriority  : String(10);
};

@cds.autoexpose
entity opportunityTopics {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        topic  : String(20);
};

@cds.autoexpose
entity opportunityDeliverables {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        deliverable  : String(20);
        deliverableDate  : Date; 
};

