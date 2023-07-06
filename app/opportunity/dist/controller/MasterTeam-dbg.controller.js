sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    'sap/m/library'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, formatter, library) {
        "use strict";


        return Controller.extend("opportunity.opportunity.controller.MasterTeam", {
            formatter: formatter,

            onInit() {
                this.oRouter = this.getOwnerComponent().getRouter();
                this.oRouter.attachRouteMatched(this.onRouteMatched, this);
                // this.oRouter.attachBeforeRouteMatched(this.onBeforeRouteMatched, this);
              },
      
              onRouteMatched: function (oEvent) {
                var oModel = this.getOwnerComponent().getModel('FlexColLayoutModel');
                oModel.setProperty("/layout", "TwoColumnsMidExpanded");
           
              }

        });
    });
