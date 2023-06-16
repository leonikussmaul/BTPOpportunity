using {sapbtp.opportunities} from '../db/opportunities';

@path : '/Opportunity'
//@requires : 'authenticated-user'
service OpportunityService {

    entity opportunityHeader           as projection on opportunities.opportunityHeader;
    entity opportunityTopics           as projection on opportunities.opportunityTopics;
    entity opportunityTopicsVH         as projection on opportunities.opportunityTopicsVH;
    entity opportunityActionItems      as projection on opportunities.opportunityActionItems;
    entity opportunityDeliverables     as projection on opportunities.opportunityDeliverables;
    entity opportunityDeliverablesVH   as projection on opportunities.opportunityDeliverablesVH;
    entity opportunityPrimaryContactVH as projection on opportunities.opportunityPrimaryContactVH;
    entity opportunityQuartersVH       as projection on opportunities.opportunityQuartersVH;
    entity opportunityStatusVH         as projection on opportunities.opportunityStatusVH;
    entity opportunityMarketUnitVH     as projection on opportunities.opportunityMarketUnitVH;
    entity opportunityPriorityVH       as projection on opportunities.opportunityPriorityVH;
    entity opportunitySSAVH            as projection on opportunities.opportunitySSAVH;
    entity opportunitySubTasks         as projection on opportunities.opportunitySubTasks;
    entity opportunitySubTaskStatus    as projection on opportunities.opportunitySubTaskStatus;
    entity opportunityComments         as projection on opportunities.opportunityComments;
    entity teamMembers                 as projection on opportunities.teamMembers;
    entity teamProjects                as projection on opportunities.teamProjects;
    entity teamSkills                  as projection on opportunities.teamSkills;
    entity teamTools                   as projection on opportunities.teamTools;


}
