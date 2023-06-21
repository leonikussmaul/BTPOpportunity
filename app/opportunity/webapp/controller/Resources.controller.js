sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
		"sap/ui/core/Fragment",
        "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, Fragment, formatter) {
        "use strict";



        return Controller.extend("opportunity.opportunity.controller.Resources", {
            formatter: formatter,
            onInit: function () {
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("Resources").attachPatternMatched(this._onRoutePatternMatched, this);

            },

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var inumber = oEvent.getParameter("arguments").inumber;
               
                this.getView().bindElement({
                    path: "/teamMembers/" + inumber,
                    parameters: {
                        expand: "skills,tools,projects"
                    }
                });


            },

            

           
           

        });
    });
