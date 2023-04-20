sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'opportunity/tracker/test/integration/FirstJourney',
		'opportunity/tracker/test/integration/pages/opportunityHeaderList',
		'opportunity/tracker/test/integration/pages/opportunityHeaderObjectPage',
		'opportunity/tracker/test/integration/pages/opportunityNotesObjectPage'
    ],
    function(JourneyRunner, opaJourney, opportunityHeaderList, opportunityHeaderObjectPage, opportunityNotesObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('opportunity/tracker') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheopportunityHeaderList: opportunityHeaderList,
					onTheopportunityHeaderObjectPage: opportunityHeaderObjectPage,
					onTheopportunityNotesObjectPage: opportunityNotesObjectPage
                }
            },
            opaJourney.run
        );
    }
);