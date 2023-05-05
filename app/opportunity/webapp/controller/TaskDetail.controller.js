sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'sap/ui/model/Sorter',
    "sap/ui/core/message/Message",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/m/Token",
    "sap/ui/export/Spreadsheet",
    'jquery.sap.global',
    "sap/ui/model/FilterType",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, Sorter, Message, MessageToast, ValueState, Token, Spreadsheet, jQuery, FilterType, formatter) {
        "use strict";


        return Controller.extend("opportunity.opportunity.controller.TaskDetail", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("TaskDetail").attachPatternMatched(this._onRoutePatternMatched, this);


            },

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var sOpportunityID = oEvent.getParameter("arguments").opportunityID;
                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "actionItems"
                    }

                });
                oModel.setDefaultBindingMode("TwoWay");
               
            },
           



        });
    });
