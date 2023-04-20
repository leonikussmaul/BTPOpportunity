sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast, formatter, JSONModel) {
        "use strict";
        var _this = this; 

            return Controller.extend("opportunity.opportunity.controller.ObjectPage", {
                        formatter: formatter,
            onInit: function () {
                
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched, this);

                var oViewModel = new JSONModel({
					busy : false,
					hasUIChanges : false,
					usernameEmpty : true,
					order : 0
				});

			this.getView().setModel(oViewModel, "appView");
            this._bTechnicalErrors = false;
            },
            
            

            _onRoutePatternMatched: function (oEvent) {
                this._page = oEvent.getParameter("arguments").opportunityID;
                this.getView().bindElement({
                    path: "/opportunityHeader/" + this._page,
                    //model: "Oppt"
                });
                //this.getView().byId("tableSection").setVisible(true);
            },

            _getText : function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

            },

            onNavBackPress: function(oEvent){

                // var oComponent = this.getOwnerComponent();
                // var oTable = oComponent.byId("MainReport--mainTable");
                // oTable.getBinding("items").refresh();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("MainReport");

            },
           
    

            handleNewVersionPress: function(oEvent){
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("CreatePage",{
                    // opportunityID : "123"
                });
                
            },

            onDeletePress: function(oEvent){
                _this = this; 
                var sDeletedAccount = _this.getView().getBindingContext().getObject("account"); 
                MessageBox.confirm("Do you want to delete this opportunity for the " + sDeletedAccount + " account?", function (oEvent, oRouter) {
                    if (oEvent == "OK") {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(_this);
                        oRouter.navTo("MainReport");
                        _this.getView().setBusy(true);

                        var fnSuccess = function () {
                           _this.getOwnerComponent().byId("MainReport--mainTable").getBinding("items").refresh();
                           _this.getView().setBusy(false);
                           MessageToast.show("Account " + sDeletedAccount + " deleted successfully.");
                       }.bind(this);
           
                       var fnError = function (oError) {
                        _this.getView().setBusy(false);
                           MessageBox.error(oError.message);
                       }.bind(this);
       
                       _this.getView().getBindingContext().delete("$auto").then(fnSuccess, fnError);
                      
                    } 
                });

            },

            onSavePress: function () {
                var sUpdatedAccount = this.getView().getBindingContext().getObject("account");
                var oComponent = this.getOwnerComponent();
            
                this.getView().setBusy(true);
                this.getView().getModel().submitBatch("opportunityGroup")
                    .then(function () {
                        this.getView().setBusy(false);
                        MessageToast.show(this._getText("changesSentMessage"));
            
                        // Refresh main table
                        var oTable = oComponent.byId("MainReport--mainTable");
                        oTable.getBinding("items").refresh();
            
                        // Navigate back to main view
                        var oRouter = oComponent.getRouter();
                        oRouter.navTo("MainReport");
            
                        // Show success message
                        MessageToast.show("Account " + sUpdatedAccount + " updated successfully.");
                    }.bind(this))
                    .catch(function (oError) {
                        this.getView().setBusy(false);
                        MessageBox.error(oError.message);
                    }.bind(this));
            },

            // onCancelPress: function() {
            //     var oModel = this.getView().getModel();
            //     oModel.resetChanges();
            //     this.getView().getModel().refresh();
            //     this.getView().getModel().resetChanges();
            //     this.getOwnerComponent().getRouter().navTo("MainReport");
            // },

            onCancelPress: function(oEvent){
                var oComponent = this.getOwnerComponent();
                // var oBinding = oComponent.byId("MainReport--mainTable").getBinding("items")
                var oBinding = this.getView().getBindingContext();
                oBinding.resetChanges();

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("MainReport");

            },

            onToggleButtonPressed: function(oEvent) {
                var sSelectedTopic = oEvent.getSource().getText();
                var oContext = oEvent.getSource().getBindingContext();
                oContext.setProperty("topic", sSelectedTopic);
            },

            onInputChange : function (oEvt) {
                if (oEvt.getParameter("escPressed")) {
                    this._setUIChanges();
                } else {
                    this._setUIChanges(true);
                   
                }
            },
            _setUIChanges : function (bHasUIChanges) {
                if (this._bTechnicalErrors) {
                    // If there is currently a technical error, then force 'true'.
                    bHasUIChanges = true;
                } else if (bHasUIChanges === undefined) {
                    bHasUIChanges = this.getView().getModel().hasPendingChanges();
                }
                var oModel = this.getView().getModel("appView");
    
                oModel.setProperty("/hasUIChanges", bHasUIChanges);
            },
    
            
              



    
        });
    });
