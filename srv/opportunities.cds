using {sapbtp.opportunities} from '../db/opportunities';

@path     : '/Opportunity'
// @requires : 'authenticated-user'
service OpportunityService {

    entity opportunityHeader    as projection on opportunities.opportunityHeader;
    entity opportunityTopics     as projection on opportunities.opportunityTopics;
    entity opportunityTopicsVH     as projection on opportunities.opportunityTopicsVH;
    entity opportunityActionItems as projection on opportunities.opportunityActionItems;
    entity opportunityDeliverables as projection on opportunities.opportunityDeliverables;
    entity opportunityDeliverablesVH as projection on opportunities.opportunityDeliverablesVH;
    entity opportunityPrimaryContactVH as projection on opportunities.opportunityPrimaryContactVH;
    entity opportunityQuarterVH as projection on opportunities.opportunityQuarterVH;
    entity opportunityStatusVH as projection on opportunities.opportunityStatusVH;
    entity opportunityMarketUnitVH as projection on opportunities.opportunityMarketUnitVH;

}