sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/suite/ui/commons/networkgraph/layout/LayeredLayout",
    "sap/suite/ui/commons/networkgraph/ActionButton",
    "sap/suite/ui/commons/networkgraph/Node",
    "sap/ui/core/Fragment",
    "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, LayeredLayout, ActionButton, Node, Fragment, formatter) {
        "use strict";


        return Controller.extend("opportunity.opportunity.controller.TeamChart", {
            formatter: formatter,
            onInit: function () {
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("TeamChart").attachPatternMatched(this._onRoutePatternMatched, this);
            },

            _onRoutePatternMatched: function(){
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/layout", "OneColumn");
                oGlobalModel.setProperty("/selectedKey", "TeamChart");
            },

            onSelectionChange: function (oEvent) {
                const oGraph = this.getView().byId("graph");

                oGraph.getNodes().forEach((oNode) => {
                    const oDetailButton = new sap.suite.ui.commons.networkgraph.ActionButton({
                        title: "Detail",
                        icon: "sap-icon://person-placeholder",
                        press: (oEvent) => {
                            this.onPersonDetails(oNode, oEvent.getParameter("buttonElement"));
                        }
                    });
                    oNode.addActionButton(oDetailButton);

                    const oEngagementButton = new sap.suite.ui.commons.networkgraph.ActionButton({
                        title: "Engagement",
                        icon: "sap-icon://workflow-tasks",
                        press: (oEvent) => {
                            this.onPressEngagement(oNode, oEvent.getParameter("buttonElement"));
                        }
                    });
                    oNode.addActionButton(oEngagementButton);
                });
            },

            onPersonDetails: function (oNode, oButton) {
                if (!this._oQuickView) {
                    sap.ui.core.Fragment.load({
                        name: "opportunity.opportunity.view.fragments.PersonDetail",
                        type: "XML"
                    }).then((oFragment) => {
                        this._oQuickView = oFragment;
                        this._oQuickView.setModel(new sap.ui.model.json.JSONModel({
                            icon: oNode.getImage() && oNode.getImage().getProperty("src"),
                            title: oNode.getTitle(),
                            description: oNode.getDescription(),
                            inumber: this._getCustomDataValue(oNode, "inumber"),
                            location: this._getCustomDataValue(oNode, "location"),
                            email: this._getCustomDataValue(oNode, "email"),
                            role: this._getCustomDataValue(oNode, "role"),
                            joined: this._getCustomDataValue(oNode, "joined"),
                            description: this._getCustomDataValue(oNode, "description"),
                            mainArea: this._getCustomDataValue(oNode, "mainArea")
                        }));

                        setTimeout(() => {
                            this._oQuickView.openBy(oButton);
                        }, 0);
                    });
                } else {
                    this._oQuickView.setModel(new sap.ui.model.json.JSONModel({
                        icon: oNode.getImage() && oNode.getImage().getProperty("src"),
                        title: oNode.getTitle(),
                        description: oNode.getDescription(),
                        inumber: this._getCustomDataValue(oNode, "inumber"),
                        location: this._getCustomDataValue(oNode, "location"),
                        email: this._getCustomDataValue(oNode, "email"),
                        role: this._getCustomDataValue(oNode, "role"),
                        joined: this._getCustomDataValue(oNode, "joined"),
                        description: this._getCustomDataValue(oNode, "description"),
                        mainArea: this._getCustomDataValue(oNode, "mainArea")
                    }));

                    setTimeout(() => {
                        this._oQuickView.openBy(oButton);
                    }, 0);
                }
            },

            _getCustomDataValue: function (oNode, sName) {
                var aItems = oNode.getCustomData().filter(function (oData) {
                    return oData.getKey() === sName;
                });

                return aItems.length > 0 && aItems[0].getValue();
            },

            onPressEngagement: function (oNode, oButton) {

                var inumber = oNode.getAttributes()[0].getLabel();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("IndividualEngagement", {
                    inumber: inumber
                }
                );



            }







        });
    });
