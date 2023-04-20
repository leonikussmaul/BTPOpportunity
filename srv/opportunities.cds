using {sapbtp.opportunities} from '../db/opportunities';

@path     : '/Opportunity'
// @requires : 'authenticated-user'
service OpportunityService {

    entity opportunityHeader    as projection on opportunities.opportunityHeader;
    entity opportunityContacts  as projection on opportunities.opportunityContacts;
    entity opportunityNotes     as projection on opportunities.opportunityNotes;
    entity opportunityNextSteps as projection on opportunities.opportunityNextSteps;
}
