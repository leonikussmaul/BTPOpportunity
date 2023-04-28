using {sapbtp.opportunities} from '../db/opportunities';

@path     : '/Opportunity'
// @requires : 'authenticated-user'
service OpportunityService {

    entity opportunityHeader    as projection on opportunities.opportunityHeader;
    entity opportunityTopics     as projection on opportunities.opportunityTopics;
    entity opportunityActionItems as projection on opportunities.opportunityActionItems;
    entity opportunityDeliverables as projection on opportunities.opportunityDeliverables;
}
