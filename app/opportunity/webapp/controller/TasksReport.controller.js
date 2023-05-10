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


        return Controller.extend("opportunity.opportunity.controller.TasksReport", {
            formatter: formatter,
            onInit: function () {

                var AddTaskModel = new JSONModel({});
                this.getView().setModel(AddTaskModel, "AddTaskModel");

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("TasksReport").attachPatternMatched(this._onRoutePatternMatched, this);


               

            },

            _onRoutePatternMatched: function (oEvent) {
                // var oModel = this.getView().getModel();
                // var sOpportunityID = oEvent.getParameter("arguments").opportunityID;
                // this.getView().bindElement({
                //     path: "/opportunityHeader/" + sOpportunityID,
                //     parameters: {
                //         expand: "actionItems"
                //     }

                // });
                // oModel.setDefaultBindingMode("TwoWay");

                var oGlobalModel = this.getOwnerComponent().getModel("globalModel"); 
                var sViewName = this.getView().getViewName().split('.')[3]; 
                oGlobalModel.setProperty("/viewName", sViewName);
                oGlobalModel.setProperty("/buttonText", "Go to Opportunities");
               
                
            },
           

            onBeforeRebindTaskTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                //var oSmartFilterBar = this.getView().byId("smartFilterBar");
              
                var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader; 
                    if(oContext.getProperty("actionPriorityNumber") != null){
                  sHeader = oContext.getProperty("actionPriority");
                }
                  return {
                    key: sHeader,
                  };
                };
                var oGrouping = new sap.ui.model.Sorter("actionPriorityNumber", false, fnGroupHeaderFormatter);
                oBindingParams.sorter.push(oGrouping);
              
               
              },

              onDeleteTableItem: function (oEvent) {
                var oSmartTable = this.getView().byId("myTaskTable");
                var aSelectedItems = oSmartTable.getTable().getSelectedItems();

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show("Select at least one task to delete");
                    return;
                }
                var oModel = oSmartTable.getModel();
                sap.m.MessageBox.warning("Are you sure you want to delete the selected tasks?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                                var sPath = aSelectedItems[i].getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function () {
                                        sap.m.MessageToast.show("Task deleted successfully.");
                                    },
                                    error: function () {
                                        sap.m.MessageToast.show("Failed to delete task.");
                                    }
                                });
                            }
                        }
                    }
                });
            },


            onAddToDoTablePress: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDoTask");
                
            },
            onSubmitNewTask: function(oEvent) {
                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent(); 
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                var oSelected = sap.ui.getCore().byId("accountComboBox").getSelectedItem(); 
                var sCustomer = oSelected.getText();

                var sDueDate;
                if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];

                var sPriorityNumber; 
                if(oData.actionPriority === "High") sPriorityNumber = 1; 
                else if (oData.actionPriority === "Medium") sPriorityNumber = 2; 
                else if (oData.actionPriority === "Low") sPriorityNumber = 3; 
              
                var oNewTask = {
                  actionDueDate: sDueDate,
                  actionCustomer: sCustomer,
                  actionOwner: oData.actionOwner,
                  actionProgress: oData.actionProgress,
                  actionTopic: oData.actionTopic,
                  actionTask: oData.actionTask,
                  actionTitle: oData.actionTitle,
                  actionPriority: oData.actionPriority,
                  actionPriorityNumber: sPriorityNumber,
                  opptID_opportunityID: oData.account
                };
              
                var sPath = "/opportunityActionItems";
              
                var oModel = this.getView().getModel();
                oModel.create(sPath, oNewTask, {
                  success: function(oData, response) {
                    MessageToast.show("New Task created!");
                    oDialog.close(); 
                  },
                  error: function(oError) {
                    sap.m.MessageBox.error("Task could not be created, try again.");
                  }
                });
              },
              

             

            onDialogOpen: function (fragmentName) {
                var oController = this;
                if (!this._fragmentDialogs) {
                    this._fragmentDialogs = {};
                }

                if (!this._fragmentDialogs[fragmentName]) {
                    this._fragmentDialogs[fragmentName] = Fragment.load({ name: fragmentName, controller: this });
                }

                this._fragmentDialogs[fragmentName].then(function (fragmentDialog) {
                    oController.getView().addDependent(fragmentDialog);
                    fragmentDialog.open();
                });
            },


            onCancelDialogPress: function (oEvent) {
                oEvent.getSource().getParent().getParent().close()
            },


            onListItemPress: function (oEvent) {
                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TaskDetail", {
                    ID: selectedItem.ID
                });
            },

           

        });
    });
