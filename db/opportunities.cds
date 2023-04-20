namespace sapbtp.opportunities;

@cds.autoexpose
entity opportunityHeader {
    key opportunityID             : Integer;
        servicePlay               : String(10);
        source                    : String(20);
        clientContactPerson       : String(255);
        ssa                       : String(255);
        account                   : String(255);
        marketUnit                : String(255);
        topic                     : String(255);
        status                    : String(50);
        primaryContact            : String(255);
        opportunityDate           : Date;
        opportunityCreatedQuarter : String(2);
        opportunityClosedQuarter  : String(2);
        opportunityValue          : Integer;
        opportunityInCRM          : String(3);
        notes                     : Composition of many opportunityNotes
                                        on notes.opptID = $self;
};

@cds.autoexpose
entity opportunityNotes {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        date   : Date;
        text   : String(800);
};

@cds.autoexpose
entity opportunityNextSteps {
    key ID     : UUID;
        opptID : Association to opportunityHeader;
        date   : Date;
        text   : String(800);

};

@cds.autoexpose
entity opportunityContacts {
    key ID      : UUID;
        opptID  : Association to opportunityHeader;
        contact : String(255);
};
