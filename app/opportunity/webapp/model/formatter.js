

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
        case "Bal":
          return "./images/Bal.jpeg";
        case "Biswajit":
          return "./images/Biswajit.jpeg";
        case "Byader":
          return "./images/Byader.jpeg";
        case "Eswara":
          return "./images/Eswara.jpeg";
        case "Giulia":
          return "./images/Giulia.jpeg";
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
        case "Ollie":
          return "./images/Ollie.jpeg";
        case "Omar":
          return "./images/Omar.jpeg";
        case "Peter":
          return "./images/Peter.jpeg";
        case "Philip":
          return "./images/Philip.jpeg";
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
        case "Sravanthi":
          return "./images/Sravanthi.jpeg";
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

      switch (topic) {
        case "Automation / AI":
        case "LMS":
          return 8;
        case "Analytics":
        case "Data":
        case "Datasphere":
        case "MDG":
          return 5;
        case "Clean Core":
        case "Extension":
        case "iCCM":
        case "CSD":
          return 6;
        case "Enablement":
        case "Governance":
          return 1;
        case "Integration":
          return 4;
        default:
          return 8;
      }
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

    genieLevelFormatter: function (sLevel) {
      if (sLevel === 'Advanced') {
        return 'Error';
      } else if (sLevel === 'Intermediate') {
        return 'Warning';
      } else if (sLevel === 'Beginner') {
        return 'Success';
      }

    },

    piorityStatusFormatter: function (sPriority) {
      if (sPriority === 'High') {
        return 'Indication02';
      } else if (sPriority === 'Medium') {
        return 'Indication03';
      } else if (sPriority === 'Low') {
        return 'Indication04';
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
    },

    chartColorFormatter: function (sValue) {
      if (sValue == 0) return "Neutral";
      else if (sValue <= 30) return "Error";
      else if (sValue > 30 && sValue <= 60) return "Critical";
      else return "Good";

    },

    getFlagMethod: function (sCountry) {
      if (sCountry) sCountry = sCountry.toUpperCase();
      switch (sCountry) {
        case "FRANCE":
          return "🇫🇷";
        case "DENMARK":
          return "🇩🇰";
        case "NETHERLANDS":
          return "🇳🇱";
        case "SWEDEN":
          return "🇸🇪";
        case "UK":
          return "🇬🇧";
        case "IRELAND":
          return "🇮🇪";
        case "SPAIN":
          return "🇪🇸";
        case "ITALY":
          return "🇮🇹";
        case "GERMANY":
          return "🇩🇪";
        case "ISRAEL":
          return "🇮🇱";
        case "SOUTH AFRICA":
          return "🇿🇦";
        case "SAUDI ARABIA":
          return "🇸🇦";
        case "UAE":
          return "🇦🇪";
        case "BELGIUM":
          return "🇧🇪";
        case "PORTUGAL":
          return "🇵🇹";
        case "FINLAND":
          return "🇫🇮";
        case "NORWAY":
          return "🇳🇴";
        case "EGYPT":
          return "🇪🇬";
        case "TURKEY":
          return "🇹🇷";
        case "INDIA":
          return "🇮🇳";
        default:
          return;
      }
    },

    genieTypeFormatter: function (sType) {
      switch (sType) {
        case "Customer":
          return "sap-icon://da-2";
        case "Internal":
          return "sap-icon://education";
        case "Partner":
          return "sap-icon://decision";
        default:
          return "sap-icon://idea-wall";;
      }

    },
    genieColorFormatter: function (sType) {
      switch (sType) {
        case "Customer":
          return "Accent6";
        case "Internal":
          return "Accent8";
        case "Partner":
          return "Accent1";
        default:
          return "Accent5";;
      }

    },

    taskCountFormatter: function(sValue){
      if(sValue.length > 0){
        return sValue.length; 
      } else return; 
    },

    taskCounterVisible:function(sValue){
      if(sValue.length > 0){
        return true; 
      } else return false; 
    },


  };
});
