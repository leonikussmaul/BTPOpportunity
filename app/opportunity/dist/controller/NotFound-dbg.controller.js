


sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
      "sap/base/Log"
  ], function (Controller, UIComponent, Log) {
      "use strict";
  
      return Controller.extend("opportunity.opportunity.controller.NotFound", {
  
          onInit: function () {
              Log.setLevel(Log.Level.INFO);
  
              var oRouter = this.getRouter();
  
              oRouter.attachBypassed(function (oEvent) {
                  var sHash = oEvent.getParameter("hash");
                  Log.info("Sorry, but the hash '" + sHash + "' is invalid.", "The resource was not found.");
              });
          },
  
  
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

    });
});
