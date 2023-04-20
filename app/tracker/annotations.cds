using OpportunityService as service from '../../srv/opportunities';

annotate service.opportunityHeader with @(
    UI.LineItem : [
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
);
annotate service.opportunityHeader with @(
    UI.FieldGroup #GeneratedGroup1 : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunityid}',
                Value : opportunityID,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Serviceplay}',
                Value : servicePlay,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Source}',
                Value : source,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Clientcontactperson}',
                Value : clientContactPerson,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Ssa2}',
                Value : ssa,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Account1}',
                Value : account,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Marketunit}',
                Value : marketUnit,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Topic}',
                Value : topic,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Status}',
                Value : status,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Primarycontact}',
                Value : primaryContact,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunitydate}',
                Value : opportunityDate,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunitycreatedquarter}',
                Value : opportunityCreatedQuarter,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunityclosedquarter}',
                Value : opportunityClosedQuarter,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunityvalue}',
                Value : opportunityValue,
            },
            {
                $Type : 'UI.DataField',
                Label : '{i18n>Opportunityincrm}',
                Value : opportunityInCRM,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : '{i18n>GeneralInformation}',
            Target : '@UI.FieldGroup#GeneratedGroup1',
        },
    ]
);
annotate service.opportunityHeader with @(
    UI.SelectionFields : [
        marketUnit,
        topic,
        status,
        primaryContact,
        opportunityClosedQuarter,
    ]
);
annotate service.opportunityHeader with {
    account @Common.Label : '{i18n>Account}'
};
annotate service.opportunityHeader with {
    clientContactPerson @Common.Label : '{i18n>ClientContact}'
};
annotate service.opportunityHeader with {
    marketUnit @Common.Label : 'Market Unit'
};
annotate service.opportunityHeader with {
    opportunityClosedQuarter @Common.Label : 'Q. Closed'
};
annotate service.opportunityHeader with {
    opportunityCreatedQuarter @Common.Label : '{i18n>Opportunitycreatedquarter}'
};
annotate service.opportunityHeader with {
    opportunityDate @Common.Label : '{i18n>Opportunitydate}'
};
annotate service.opportunityHeader with {
    opportunityID @Common.Label : '{i18n>Opportunityid}'
};
annotate service.opportunityHeader with {
    opportunityInCRM @Common.Label : '{i18n>Opportunityincrm}'
};
annotate service.opportunityHeader with {
    opportunityValue @Common.Label : '{i18n>Opportunityvalue}'
};
annotate service.opportunityHeader with {
    primaryContact @Common.Label : 'Owner'
};
annotate service.opportunityHeader with {
    servicePlay @Common.Label : '{i18n>Serviceplay}'
};
annotate service.opportunityHeader with {
    source @Common.Label : '{i18n>Source}'
};
annotate service.opportunityHeader with {
    ssa @Common.Label : '{i18n>Ssa1}'
};
annotate service.opportunityHeader with {
    status @Common.Label : 'Status'
};
annotate service.opportunityHeader with {
    topic @Common.Label : 'Topic'
};
annotate service.opportunityHeader with {
    account @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'opportunityHeader',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : account,
                    ValueListProperty : 'account',
                },
            ],
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.opportunityHeader with {
    clientContactPerson @(Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'opportunityHeader',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : clientContactPerson,
                    ValueListProperty : 'clientContactPerson',
                },
            ],
        },
        Common.ValueListWithFixedValues : true
)};
annotate service.opportunityHeader with {
    clientContactPerson @Common.FieldControl : #Optional
};
annotate service.opportunityHeader with @(
    Communication.Contact #contact : {
        $Type : 'Communication.ContactType',
        fn : primaryContact,
    }
);
annotate service.opportunityHeader with @(
    UI.DataPoint #opportunityValue : {
        Value : opportunityValue,
        Visualization : #Progress,
        TargetValue : 100,
    }
);
annotate service.opportunityHeader with @(
    UI.HeaderInfo : {
        Title : {
            $Type : 'UI.DataField',
            Value : account,
        },
        TypeName : '',
        TypeNamePlural : '',
        Description : {
            $Type : 'UI.DataField',
            Value : status,
        },
        Initials : marketUnit,
    }
);
