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
        valueMonth                : String(10);
        valueYear                 : String(10);
        opportunityInCRM          : String(3);
        noteText                  : String(5000);
        noteDate                  : Date;
        actionItems               : Composition of many opportunityActionItems
                                        on actionItems.opptID = $self;
        topics                    : Composition of many opportunityTopics
                                        on topics.opptID = $self;
        deliverables              : Composition of many opportunityDeliverables
                                        on deliverables.opptID = $self;
        comments                  : Composition of many opportunityComments
                                        on comments.opptID = $self;
};

@cds.autoexpose
entity opportunityActionItems {
    key ID                   : UUID;
        opptID               : Association to opportunityHeader;
        actionDueDate        : Date;
        actionCustomer       : String(255);
        actionTitle          : String(255);
        actionTask           : String(5000);
        actionOwner          : String(20);
        actionProgress       : Integer;
        actionTopic          : String(255);
        actionPriority       : String(10);
        actionPriorityNumber : Integer;
        subTasks             : Composition of many opportunitySubTasks
                                   on subTasks.opptID = $self;
        comments             : Composition of many opportunityTasksComments
                                   on comments.opptID = $self;
};

@cds.autoexpose
entity opportunitySubTasks {
    key ID               : UUID;
        opptID           : Association to opportunityActionItems;
        subTask          : String(5000);
        subTaskDueDate   : Date;
        subTaskOwner     : String(20);
        subTaskCompleted : Boolean;
        subTaskOrder     : Integer;
        subTaskStatus    : String(50);
};

@cds.autoexpose
entity opportunityTopics {
    key ID      : UUID;
        opptID  : Association to opportunityHeader;
        topic   : String(255);
        score   : Integer;
        comment : String(5000);
};

@cds.autoexpose
entity opportunityComments {
    key ID       : UUID;
        opptID   : Association to opportunityHeader;
        comment  : String(5000);
        postedBy : String(20);
        postedOn : DateTime;
        imageSrc : String(255);
};

@cds.autoexpose
entity opportunityTasksComments {
    key ID       : UUID;
        opptID   : Association to opportunityActionItems;
        comment  : String(5000);
        postedBy : String(20);
        postedOn : DateTime;
        imageSrc : String(255);
};


@cds.autoexpose
entity opportunityTopicsVH {
    key ID    : UUID;
        topic : String(255);
};

@cds.autoexpose
entity opportunityDeliverables {
    key ID               : UUID;
        opptID           : Association to opportunityHeader;
        deliverable      : String(255);
        deliverableDate  : Date;
        status           : String(20);
        completed        : Boolean;
        completedOn      : Date;
        shortDescription : String(5000);
        primaryContact   : String(50);
};

@cds.autoexpose
entity opportunityDeliverablesVH {
    key ID              : UUID;
        deliverable     : String(255);
        deliverableDate : Date;
};

@cds.autoexpose
entity opportunityPrimaryContactVH {
    key ID             : UUID;
        primaryContact : String(255);
};

@cds.autoexpose
entity opportunityQuartersVH {
    key ID                 : UUID;
        opportunityQuarter : String(10);
        opportunityYear    : Integer;
};

@cds.autoexpose
entity opportunityStatusVH {
    key ID     : UUID;
        status : String(20);
};

@cds.autoexpose
entity opportunityMarketUnitVH {
    key ID         : UUID;
        marketUnit : String(15);
};

@cds.autoexpose
entity opportunityPriorityVH {
    key ID       : UUID;
        priority : String(10);
};

@cds.autoexpose
entity opportunitySSAVH {
    key ID  : UUID;
        SSA : String(50);
};

@cds.autoexpose
entity opportunitySubTaskStatus {
    key ID            : UUID;
        subTaskStatus : String(50);
};

@cds.autoexpose
entity teamMembers {
    key inumber     : String(10);
        firstName   : String(50);
        lastName    : String(50);
        initials    : String(5);
        photoSrc    : String(255);
        email       : String(255);
        location    : String(55);
        role        : String(55);
        joined      : Date;
        manager     : String(55);
        mainArea    : String(55);
        description : String(5000);
        utilization : Integer;
        skills      : Composition of many skills
                          on skills.userID = $self;
        tools       : Composition of many teamTools
                          on tools.userID = $self;
        projects    : Composition of many teamProjects
                          on projects.userID = $self;
        forecast    : Composition of many teamForecast
                          on forecast.userID = $self;

};

@cds.autoexpose
entity skills {
    key skillID   : UUID;
        userID    : Association to teamMembers;
        skill     : String(255);
        level     : String(20);
        sap       : Boolean;
        projectID : Association to teamProjects;
};

@cds.autoexpose
entity teamForecast {
    key forecastID : UUID;
        userID     : Association to teamMembers;
        month      : String(20);
        year       : Integer;
        forecast   : Integer;
        actual     : Integer;
        average    : Integer;
};

@cds.autoexpose
entity teamTools {
    key toolID    : UUID;
        userID    : Association to teamMembers;
        tool      : String(255);
        level     : String(20);
        sap       : Boolean;
        projectID : Association to teamProjects;
};

@cds.autoexpose
entity teamProjects {
    key projectID        : UUID;
        userID           : Association to teamMembers;
        primaryContact   : String(50);
        projectContact   : String(70);
        priority         : String(20);
        account          : String(255);
        marketUnit       : String(255);
        topic            : String(255);
        status           : String(50);
        projectStartDate : Date;
        projectEndDate   : Date;
        progress         : Integer;
        descriptionText  : String(5000);
        descriptionDate  : Date;
        percentage       : Integer;
        goLive           : Date;
        lastUpdated      : DateTime;
        comments         : Composition of many projectComments
                               on comments.user = $self;
        skills           : Composition of many skills
                               on skills.projectID = $self;
        tools            : Composition of many teamTools
                               on tools.projectID = $self;
};


@cds.autoexpose
entity projectComments {
    key commentID : UUID;
        user      : Association to teamProjects;
        comment   : String(5000);
        postedBy  : String(20);
        postedOn  : DateTime;
        imageSrc  : String(255);
};

@cds.autoexpose
entity projectStatusVH {
    key ID     : UUID;
        status : String(20);
};
