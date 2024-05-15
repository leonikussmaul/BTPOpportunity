sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/core/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,  JSONModel,  formatter, CoreLibrary) {
        "use strict";
        var _counter;

        return Controller.extend("opportunity.opportunity.controller.MainReport", {
            formatter: formatter,
            onInit: function () {

                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        
                _counter = 0;

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");


            },


      onBeforeRouteMatched: function (oEvent) {
        var oModel = this.getOwnerComponent().getModel("global");

        var sLayout = oEvent.getParameters().arguments.layout;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(0);
          sLayout = oNextUIState.layout;
        }

        // Update the layout of the FlexibleColumnLayout
        if (sLayout) {
          oModel.setProperty("/layout", sLayout);
        }
        _counter++;
      },

      onRouteMatched: function (oEvent) {
          var sRouteName = oEvent.getParameter("name"),
            oArguments = oEvent.getParameter("arguments");
          this.currentRouteName = sRouteName;
  
          this._updateUIElements();
          this.ID = oArguments.opportunityID;
        },
  
        onStateChanged: function (oEvent) {
          var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
            sLayout = oEvent.getParameter("layout");
  
          this._updateUIElements();
  
          // Replace the URL with the new layout if a navigation arrow was used
          if (bIsNavigationArrow) {
            this.oRouter.navTo(this.currentRouteName, { layout: sLayout, opportunityID: this.ID }, true);
          }
        },
        _updateUIElements: function () {
          var oModel = this.getOwnerComponent().getModel("global");
  
          var oUIState = this.getOwnerComponent().getHelper().getCurrentUIState();
          oUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
          // if (oUIState.layout == "OneColumn" && _counter == 0 && this.currentRouteName !== "List") {
          //   if (oUIState.layout == "OneColumn" && _counter == 0 && this.currentRouteName == "activityDetail") oUIState = this.getOwnerComponent().getHelper().getNextUIState(2);
          //   else oUIState = this.getOwnerComponent().getHelper().getNextUIState(1);
          // }
          oModel.setData(oUIState);
        },
  
        handleBackButtonPressed: function () {
          window.history.go(-1);
        },
        onExit: function () {
          this.oRouter.detachRouteMatched(this.onRouteMatched, this);
          this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
        }
  

  });
});
