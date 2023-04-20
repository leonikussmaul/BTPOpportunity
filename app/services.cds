
using from './tracker/annotations';

using from './opportunity/annotations';

annotate OpportunityService.opportunityHeader with @(
    UI.LineItem : {
        $value : [
            {
                $Type : 'UI.DataField',
                Value : marketUnit,
                Label : 'Market Unit',
            },
            {
                $Type : 'UI.DataField',
                Value : account,
                Label : 'Account',
            },
            {
                $Type : 'UI.DataField',
                Value : topic,
                Label : 'Topic',
            },
            {
                $Type : 'UI.DataField',
                Value : status,
                Label : 'Status',
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target : '@Communication.Contact#contact',
                Label : 'Contact',
            },
            {
                $Type : 'UI.DataField',
                Label : 'SSA / SAE',
                Value : ssa,
            },
            {
                $Type : 'UI.DataField',
                Value : opportunityClosedQuarter,
                Label : 'Q. Closed',
            },
            {
                $Type : 'UI.DataFieldForAnnotation',
                Target : '@UI.DataPoint#opportunityValue',
                Label : 'Value',
            },
        ]
    }
);
