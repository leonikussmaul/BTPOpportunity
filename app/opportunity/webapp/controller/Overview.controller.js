sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/FilterType",
    "../model/formatter"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Sorter, Message, MessageToast, FilterType, formatter) {
        "use strict";

        return Controller.extend("opportunity.opportunity.controller.Overview", {
            formatter: formatter,
            onInit() {
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("Overview").attachPatternMatched(this._onRoutePatternMatched, this);

                var oLocalModel = new JSONModel({});
                this.getView().setModel(oLocalModel, "localModel");
            },

            _onRoutePatternMatched: function (oEvent) {
                var oChart1 = this.getView().byId("smartChart1");
                if (oChart1.isInitialised()) oChart1.rebindChart();

                var oChart2 = this.getView().byId("smartChart2");
                if (oChart2.isInitialised()) oChart2.rebindChart();

                var oChart3 = this.getView().byId("smartChart3");
                if (oChart3.isInitialised()) oChart3.rebindChart();

                this.onReadDataOpportunities();
                this.onReadDataTasks();

                //refresh tasks 
                this.getView().byId("taskCard").refreshData();
                this.getView().byId("opportunityCard").refreshData();
                this.getView().byId("adoptionCard").refreshData();
                this.getView().byId("linksCard").refreshData();
                this.getView().byId("calendarCard").refreshData();
                this.getView().byId("RFPCard").refreshData();
                this.getView().byId("goLiveCard").refreshData();
            },

            onRebindUtilizationChart: function (oEvent) {
                var oBindingParams = oEvent.getParameter('bindingParams');
                var oSorter = new sap.ui.model.Sorter("order", false);
                oBindingParams.sorter.push(oSorter);
            },

            onBeforeRebindMUChart: function (oEvent) {
                var oBindingParams = oEvent.getParameter('bindingParams');
                var oSorter = new sap.ui.model.Sorter("marketUnit", false);
                oBindingParams.sorter.push(oSorter);
            },

            onSubmitFeedback: function (oEvent) {
                var that = this;
                var oLocalModel = this.getView().getModel("localModel");

                var oData = oLocalModel.getData();
                if(oData.feedback){

                var sPostedBy = this.getOwnerComponent().getModel("user").getProperty("/firstname");
                var bPositive;

                if (oData.positive === true) bPositive = true;
                else if (oData.negative === true) bPositive = false;

                var oPayload = {
                    feedback: oData.feedback,
                    positive: bPositive,
                    postedBy: sPostedBy,
                    postedOn: new Date()
                }

                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/userFeedback", oPayload, {
                    success: function (oData, response) {
                        MessageToast.show("Your Feedback has been registered. Thank you!");
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        MessageBox.error("Your feedback could not be submitted at this time. Please refresh and try again.");
                    }
                });
            }else MessageToast.show("Please enter your feedback first")

            },
            onTogglePositiveFeedback: function () {
                var oLocalModel = this.getView().getModel("localModel");
                oLocalModel.setProperty("/positive", true);
                oLocalModel.setProperty("/negative", false);
            },

            onToggleNegativeFeedback: function () {
                var oLocalModel = this.getView().getModel("localModel");
                oLocalModel.setProperty("/positive", false);
                oLocalModel.setProperty("/negative", true);
            },

            onReadDataOpportunities: function () {
                var that = this;
                var oLocalModel = that.getView().getModel("localModel");
                var oModel = that.getView().getModel();
                oModel.read("/opportunityHeader", {
                    success: function (oResponse) {
                        var aData = oResponse.results.length;
                        oLocalModel.setProperty("/opportunityHeaderLength", aData);

                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });
            },

            onReadDataTasks: function () {
                var that = this;
                var oLocalModel = that.getView().getModel("localModel");
                var oModel = that.getView().getModel();
                oModel.read("/opportunityActionItems", {
                    success: function (oResponse) {
                        var aData = oResponse.results.length;
                        oLocalModel.setProperty("/opportunityActionItemsLength", aData);

                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });
            },

            onNavToOpportunities: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("MainReport");
            },

            onNavToTasks: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TasksReport");
            },

        });
    });
