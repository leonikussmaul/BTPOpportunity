sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/m/MessageBox"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageToast, MessageBox) {
        "use strict";

            return Controller.extend("opportunity.opportunity.controller.CreatePage", {
            onInit: function () {
                

            },

            _getText : function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

            },

            onNavBackPress: function(oEvent){
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("OpportunityReport");
            },

            handleCreateOppPress: function(oEvent){
                var that = this; 
                var oBinding = that.getOwnerComponent().byId("OpportunityReport--mainTable").getBinding("items"); 
                var oModel = this.getView().getModel();
                var oList = oModel.bindList("/opportunityHeader");
                var oSelected = ""
                var oCheck =  this.getView().byId("opportunityInCRM").getSelected()
                if(oCheck == true) oSelected = "Yes"; 
                var sConvertDate = ""; 
                var sDate = this.getView().byId("dateCreated").getValue(); 
                if(sDate != "" && sDate != undefined) sConvertDate = new Date(this.getView().byId("dateCreated").getValue()).toLocaleDateString().split( '/' ).reverse( ).join( '-' );

                oList.create({
                    account: this.getView().byId("account").getValue(),
                    marketUnit: this.getView().byId("marketUnit").getValue(),
                    status: this.getView().byId("status").getValue(),
                    opportunityDate: sConvertDate,
                    opportunityValue: +this.getView().byId("opportunityValue").getValue(),
                    opportunityCreatedQuarter: this.getView().byId("opportunityCreatedQuarter").getValue(),
                    opportunityClosedQuarter: this.getView().byId("opportunityClosedQuarter").getValue(),
                    primaryContact: this.getView().byId("primaryContact").getValue(),
                    ssa: this.getView().byId("ssa").getValue(), 
                    clientContactPerson: this.getView().byId("clientContactPerson").getValue(),
                    opportunityInCRM: oSelected
                });
                    that.getView().setBusy(false);
                    oBinding.refresh();
                    MessageToast.show("New account created successfully.");
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                    oRouter.navTo("OpportunityReport");
                
            },

    
        });
    });
