sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
		"sap/suite/ui/commons/networkgraph/layout/LayeredLayout",
		"sap/suite/ui/commons/networkgraph/layout/ForceBasedLayout",
		"sap/suite/ui/commons/networkgraph/ActionButton",
		"sap/suite/ui/commons/networkgraph/Node",
		"sap/ui/core/Fragment",
        "../model/formatter",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, LayeredLayout, ForceBasedLayout, ActionButton, Node, Fragment,formatter) {
        "use strict";


        return Controller.extend("opportunity.opportunity.controller.Team", {
            formatter: formatter,
            onInit: function () {
                

                // this._graph = this.getView().byId("graph");
                // var that = this; 

                // this._graph.attachEvent("beforeLayouting", function (oEvent) {
                //     var oGraph = that.getView().byId("graph"); 
                //     oGraph.preventInvalidation(true);
                //     oGraph.getNodes().forEach(function (oNode) {
                //         var oExpandButton, oDetailButton, oUpOneLevelButton;
                //             //sTeamSize = this._getCustomDataValue(oNode, "team"),
                          
    
                //        // oNode.removeAllActionButtons();

                //         oNode.setCollapsed(true);
                //         oExpandButton = new ActionButton({
                //             title: "Expand",
                //             icon: "sap-icon://sys-add",
                //             press: function () {
                //                 oNode.setCollapsed(false);
                //                 //this._loadMore(oNode.getKey());
                //             }.bind(this)
                //         });
                //         oNode.addActionButton(oExpandButton);

                //         oDetailButton = new ActionButton({
                //             title: "Detail",
                //             icon: "sap-icon://person-placeholder",
                //             press: function (oEvent) {
                //                // this._openDetail(oNode, oEvent.getParameter("buttonElement"));
                //             }.bind(this)
                //         });
                //         oNode.addActionButton(oDetailButton);
    
                //     });
    
                // }); 

                
            },

            

           
           

        });
    });
