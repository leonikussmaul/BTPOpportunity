

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

    mapStatusToProgress: function (status) {
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
    mapStatusToPercent: function (status) {
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

    addKUnit: function (value) {
      if (value)
        return value + "k" + " €";
    },

    opportunityInCRMSelected: function (sOpportunityInCRM) {
      if (sOpportunityInCRM === "Yes")
        return true;
      else return false;
    },

    topicColorSchemeFormatter: function (topic) {
      if (topic === 'Clean Core') {
        return 6;
      } else if (topic === 'Extension') {
        return 9;
      } else if (topic === 'Data') {
        return 5;
      } else if (topic === 'Analytics') {
        return 4;
      } else if (topic === 'Integration') {
        return 7;
      } else if (topic === 'Automation / AI') {
        return 8;
      } else return 3;

    },

    formatRowHighlight: function (priority) {
      if (priority === 'High') {
        return 'Error';
      } else if (priority === 'Medium') {
        return 'Warning';
      } else if (priority === 'Low') {
        return 'Success';
      }

    },

    addKAfterNumber: function (opportunityValue) {
      var sValue = opportunityValue + "k";
      return sValue;

    },

    formatStatusColor: function (sStatus) {
      switch (sStatus) {
        case "Opportunity":
          return "Information";
        case "Lead":
          return "Warning";
        case "Completed":
          return "Success";
        case "Paused":
          return "None";
        default:
          return "None";
      }
    },

    formatStatusIcon: function (sStatus) {
      switch (sStatus) {
        case "Opportunity":
          return "sap-icon://overlay";
        case "Lead":
          return "sap-icon://flag";
        case "Completed":
          return "sap-icon://checklist-item-2";
        case "Paused":
          return "sap-icon://pause";
        default:
          return;
      }

    },

    formatInitialsColor: function (sMarketUnit) {
      if (sMarketUnit === 'Belux' || sMarketUnit === 'BeLux') {
        return 'Accent3';
      } else if (sMarketUnit === 'France') {
        return 'Accent6';
      } else if (sMarketUnit === 'Netherlands') {
        return 'Accent8';
      } else if (sMarketUnit === 'Nordics') {
        return 'Accent7';
      } else if (sMarketUnit === 'UKI') {
        return 'Accent9';
      } else return 'Accent2';
    },

    formatInitials: function (sMarketUnit) {
      if (sMarketUnit === 'Belux' || sMarketUnit === 'BeLux') {
        return 'BLX';
      } else if (sMarketUnit === 'France') {
        return 'FR';
      } else if (sMarketUnit === 'Netherlands') {
        return 'NL';
      } else if (sMarketUnit === 'Nordics') {
        return 'NOR';
      } else if (sMarketUnit === 'UKI') {
        return 'UKI';
      } else return 'NA';
    },

    numberStateFormatter: function (sValue) {
      if (sValue <= 100) {
        return 'Warning';
      } else if (sValue > 100) {
        return 'Success';
      } else if (sValue < 20) {
        return 'Information';
      }

    },

    progressPercentage: function (sValue) {

      return sValue + '%';
    },

    progressStatus: function (sValue) {
      if (sValue < 25) {
        return 'Error';
      } else if (sValue >= 25 && sValue < 75) {
        return 'Warning';
      } else if (sValue >= 75) {
        return 'Success';
      }

    },
    piorityFormatter: function (sPriority) {
      if (sPriority === 'High') {
        return 'Error';
      } else if (sPriority === 'Medium') {
        return 'Warning';
      } else if (sPriority === 'Low') {
        return 'Success';
      }

    },

    toggleButtonPressed: function (aItems, oToggle) {
      var isMatch = aItems.some(oItem => {
        if(oItem.topic){
          return oItem.topic.toUpperCase() === oToggle.toUpperCase();
        }else if(oItem.deliverable){
          return oItem.deliverable.toUpperCase() === oToggle.toUpperCase();
        }
      });
      if (isMatch) return true;
      else return false;
    },

    toggleButtonEnabled: function (aItems, oToggle) {
      var isMatch = aItems.some(oItem => {
        if(oItem.topic){
          return oItem.topic.toUpperCase() === oToggle.toUpperCase();
        }else if(oItem.deliverable){
          return oItem.deliverable.toUpperCase() === oToggle.toUpperCase();
        }
      });
      if (isMatch) return true;
      else return false;
    },

    priortityButton: function(sPriority){
      if (sPriority === 'High') {
        return 'Reject';
      } else if (sPriority === 'Medium') {
        return 'Attention';
      } else if (sPriority === 'Low') {
        return 'Accept';
      }

  },

  favoriteIconFormatter: function (isFavorite) {
    var sIcon = "sap-icon://unfavorite";
    if (isFavorite === true) {
        sIcon = "sap-icon://favorite";
    }
    return sIcon;
},



    //priority
    //sap-icon://expand-group low
    //sap-icon://collapse-group high
    //sap-icon://collapse medium







  };
});
