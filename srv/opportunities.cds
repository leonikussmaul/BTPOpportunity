using {sapbtp.opportunities} from '../db/opportunities';

@path     : '/Opportunity'
@requires : 'authenticated-user'
service OpportunityService {
    @cds.redirection.target : true
    entity opportunityHeader           as projection on opportunities.opportunityHeader;

    entity opportunityHeaderCopy       as projection on opportunities.opportunityHeader;
    entity opportunityTopics           as projection on opportunities.opportunityTopics;
    entity opportunityTopicsVH         as projection on opportunities.opportunityTopicsVH;
    entity opportunityLinks             as projection on opportunities.opportunityLinks;
    entity opportunityTasksLinks             as projection on opportunities.opportunityTasksLinks;
    entity opportunityMaturity         as projection on opportunities.opportunityMaturity;
     @cds.redirection.target : true
    entity opportunityMaturityCopy     as projection on opportunities.opportunityMaturity;
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
    entity opportunityTasksComments    as projection on opportunities.opportunityTasksComments;
    entity teamMembers                 as projection on opportunities.teamMembers;
    entity teamProjects                as projection on opportunities.teamProjects;
    entity teamVacations               as projection on opportunities.teamVacations;
    entity teamTools                   as projection on opportunities.teamTools;
    entity projectComments             as projection on opportunities.projectComments;
    entity skills                      as projection on opportunities.skills;
    entity projectStatusVH             as projection on opportunities.projectStatusVH;
    entity teamForecast        as projection on opportunities.teamForecast;
     @cds.redirection.target : true
    entity teamForecastCopy       as projection on opportunities.teamForecast;
    entity teamForecastMonthVH         as projection on opportunities.teamForecastMonthVH;
//entity CurrentUser                 as projection on opportunities.CurrentUser;


}
