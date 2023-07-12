

sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/core/UIComponent",
	"sap/base/Log",
  "sap/ui/core/library"
], function (Controller, UIComponent, Log, CoreLibrary) {
	"use strict";
  var ValueState = CoreLibrary.ValueState,
  oValueState = {
      valueState: ValueState.None,
      valueStateText: ""
  };

	return Controller.extend("opportunity.opportunity.controller.App", {

		onInit: function () {
			Log.setLevel(Log.Level.INFO);

			var oRouter = this.getRouter();

			oRouter.attachBypassed(function (oEvent) {
				var sHash = oEvent.getParameter("hash");
				Log.info("Sorry, but the hash '" + sHash + "' is invalid.", "The resource was not found.");
			});

      this.getView().setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");
		},


    getRouter: function () {
      return UIComponent.getRouterFor(this);
    },

    onNavBack: function () {
      var oHistory, sPreviousHash;
      oHistory = History.getInstance();
      sPreviousHash = oHistory.getPreviousHash();
      if (sPreviousHash !== undefined) {
        window.history.go(-1);
      } else {
        this.getRouter().navTo("Overview", {}, true /*no history*/);
      }
    },


             /* ------------------------------------------------------------------------------------------------------------
            VALUE STATE
            --------------------------------------------------------------------------------------------------------------*/


            ValueStateMethod: function(oEvent){
              var oValueStateModel = this.getView().getModel("valueState"); 
              MessageToast.show("Please fill all mandatory fields");
              oValueStateModel.setProperty("/valueState", ValueState.Error);
              oValueStateModel.setProperty("/valueStateText", "This field is mandatory");

          },

          resetValueState: function(oEvent){
              var oValueStateModel = this.getView().getModel("valueState"); 
              oValueStateModel.setProperty("/valueState", ValueState.None);
              oValueStateModel.setProperty("/valueStateText", "");
          },

          onChangeValueState: function(oEvent){
              var sValue = oEvent.mParameters.newValue; 
              if(sValue) this.resetValueState(); 
          }

	});

});