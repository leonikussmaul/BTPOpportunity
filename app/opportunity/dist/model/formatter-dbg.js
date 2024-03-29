

sap.ui.define(["sap/ui/core/library", "sap/ui/core/date/UI5Date"], function (coreLibrary, UI5Date) {
  "use strict";

  return {
    favoriteIconFormatter: function (isFavourite) {
      var sIcon = "sap-icon://unfavorite";
      if (isFavourite === true) {
        sIcon = "sap-icon://favorite";
      }
      return sIcon;
    },

    formatterTeamPictures: function (sPerson) {

      switch (sPerson) {
        case "Abhay":
          return "./images/Abhay.jpeg";
        case "Ami":
          return "./images/Ami.jpeg";
        case "Amit":
          return "./images/Amit.jpeg";
        case "Arpit":
          return "./images/Arpit.jpeg";
        case "Bas":
          return "./images/Bas.jpeg";
        case "Biswajit":
          return "./images/Biswajit.jpeg";
        case "Elinor":
          return "./images/Elinor.jpeg";
        case "Eswara":
          return "./images/Eswara.jpeg";
        case "Gurpreet":
          return "./images/Gurpreet.jpeg";
        case "Karthik":
          return "./images/Karthik.jpeg";
        case "Leoni":
          return "./images/Leoni.jpeg";
        case "Liliana":
          return "./images/Liliana.jpeg";
        case "Matt":
          return "./images/Matt.jpeg";
        case "Nesimi":
          return "./images/Nesimi.jpeg";
        case "Omar":
          return "./images/Omar.jpeg";
        case "Peter":
          return "./images/Peter.jpeg";
        case "Rajat":
          return "./images/Rajat.jpeg";
        case "Ravi":
          return "./images/Ravi.jpeg";
        case "Rudolf":
          return "./images/Rudolf.jpeg";
        case "Sarah":
          return "./images/Sarah.jpeg";
        case "Shubham":
          return "./images/Shubham.jpeg";
        case "Sneha":
          return "./images/Sneha.jpeg";
        case "Stefan":
          return "./images/Stefan.jpeg";
        case "Sunil":
          return "./images/Sunil.jpeg";
        case "Vijay":
          return "./images/Vijay.jpeg";

        default:
          return;
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
      } else if (topic === 'Governance') {
        return 3;
      } else if (topic === 'CSD') {
        return 1;
      } else if (topic === 'iCCM') {
        return 2;
      } else return;

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
        case "Delivery":
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
        case "Delivery":
          return "sap-icon://activate";
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
      } else if (sMarketUnit === 'Global') {
        return 'Accent5';
      } else if (sMarketUnit === 'Internal / Others') {
        return 'Accent1';
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
      } else if (sMarketUnit === 'Global') {
        return 'GLO';
      } else if (sMarketUnit === 'Internal / Others') {
        return 'INT';
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

      if (sValue) return sValue + '%';
      else return;
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

    projectInvolvement: function (sValue) {
      if (sValue < 10) {
        return 'Error';
      } else if (sValue >= 10 && sValue < 50) {
        return 'Warning';
      } else if (sValue >= 50) {
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
        if (oItem.topic) {
          return oItem.topic.toUpperCase() === oToggle.toUpperCase();
        } else if (oItem.deliverable) {
          return oItem.deliverable.toUpperCase() === oToggle.toUpperCase();
        }
      });
      if (isMatch) return true;
      else return false;
    },

    toggleButtonEnabled: function (aItems, oToggle, editMode) {

      if (editMode) {
        return true;
      } else {

        var isMatch = aItems.some(oItem => {
          if (oItem.topic) {
            return oItem.topic.toUpperCase() === oToggle.toUpperCase();
          } else if (oItem.deliverable) {
            return oItem.deliverable.toUpperCase() === oToggle.toUpperCase();
          }
        });
        if (isMatch) return true;
        else return false;
      }
    },

    priortityButton: function (sPriority) {
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

    formatDueDate: function (sDueDate) {

      var sTodayDate = new Date();
      if (sDueDate < sTodayDate) return "Error";
      else if (sDueDate === sTodayDate) return "Warning";

    },


    formatIconDueDate: function (sDueDate) {
      var dueDate = new Date(sDueDate);
      var todayDate = new Date();
      var oneWeek = 7 * 24 * 60 * 60 * 1000;

      if (todayDate.getTime() > dueDate.getTime() + oneWeek) {
        return "sap-icon://alert";
      }
      else {
        return "";
      }
    },

    processFlowFormatter: function (sStatus) {
      switch (sStatus) {
        case "Paused":
          return "None";
        case "In Progress":
          return "Information";
        case "Completed":
          return "Success";
        case "Not Started":
          return "Warning";
        case "Blocked":
          return "Error";
        default:
          return "None";
      }
    },

    processFlowBtnFormatter: function (sStatus) {
      switch (sStatus) {
        case "Paused":
          return "Negative";
        case "In Progress":
          return "Negative";
        case "Completed":
          return "Accept";
        case "Not Started":
          return "Attention";
        case "Blocked":
          return "Critical";
        default:
          return "Negative";
      }
    },

    formatSubTaskIcon: function (sStatus) {
      switch (sStatus) {
        case "In Progress":
          return "sap-icon://goal";
        case "Completed":
          return "sap-icon://message-success";
        case "Not Started":
          return "sap-icon://lateness";
        case "Blocked":
          return "sap-icon://error";
        case "Paused":
          return "sap-icon://pause";
        default:
          return "sap-icon://information";
      }

    },

    formatSubTaskIconColor: function (sStatus) {
      switch (sStatus) {
        case "Paused":
          return coreLibrary.IconColor.Neutral;
        case "In Progress":
          return "#0a6ed1";
        case "Completed":
          return coreLibrary.IconColor.Positive;
        case "Not Started":
          return coreLibrary.IconColor.Critical;
        case "Blocked":
          return coreLibrary.IconColor.Negative;
        default:
          return coreLibrary.IconColor.Tile;
      }
    },

    formatAccentStatus: function (sStatus) {
      switch (sStatus) {
        case "Paused":
          return "Accent10";
        case "In Progress":
          return "Accent6";
        case "Completed":
          return "Accent8";
        case "Not Started":
          return "Accent1";
        case "Blocked":
          return "Accent2";
        default:
          return "Accent10";
      }
    },

    calendarDate: function (date) {
      var yr = new Date(date).getFullYear();
      var mnt = new Date(date).getMonth();
      var day = new Date(date).getDate();
      return new Date(yr, mnt, day, "00", "00");
    },
    calendarEndDate: function (date) {
      var yr = new Date(date).getFullYear();
      var mnt = new Date(date).getMonth();
      var day = new Date(date).getDate();
      return new Date(yr, mnt, day, "23", "59");
    },

    calendarStatusFormatter: function (sStatus) {
      switch (sStatus) {
        case "Sent for Proposal":
          return "Type10";
        case "RFP":
          return "Type05";
        case "On-Going":
          return "Type01";
        case "Go-Live":
          return "Type08";
        case "Past":
          return "Type09";
        //blue Type06 -> vacation
        //pink Type05
        //Type07 Turquiose
        //Type08 Green
        //Type09 Grey
        //Type10 Purple

        default:
          return "Type11";
      }
    },

    initialsFormatter: function (sFirstName, sLastName) {
      if (sFirstName && sLastName) {
        var sInitials = sFirstName.substring(0, 1) + sLastName.substring(0, 1);
        return sInitials;

      }
    }


  };
});
