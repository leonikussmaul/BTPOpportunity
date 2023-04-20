 

sap.ui.define([], function () {
    "use strict";

    return {
        favoriteIconFormatter: function (isFavourite) {
            var sIcon = "sap-icon://unfavorite";
            if (isFavourite === true) {
                sIcon = "sap-icon://favorite";
            }
            return sIcon;
        },

        mapStatusToProgress: function(status) {
            switch (status) {
              case "Opportunity":
                return 20;
              case "Lead":
                return 70;
              case "Completed":
                return 100;
              default:
                return 0;
            }
        },
        mapStatusToPercent: function(status) {
            switch (status) {
              case "Opportunity":
                return 20;
              case "Lead":
                return 70;
              case "Completed":
                return 100;
              default:
                return 0;
            }
        },

        addKUnit: function(value) {
          if(value)
          return value + "k" + " €";
        },

        opportunityInCRMSelected: function(sOpportunityInCRM) {
          if(sOpportunityInCRM === "Yes")
          return true; 
          else return false; 
      }

        

        
    };
});
