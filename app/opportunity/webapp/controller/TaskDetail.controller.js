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

                var oEditModel = new JSONModel({
                    editMode: false
                });
                this.getView().setModel(oEditModel, "editModel");

                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "subTaskModel");

                var AddSubTaskModel = new JSONModel({});
                this.getView().setModel(AddSubTaskModel, "AddSubTaskModel");


            },

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                this._sID = oEvent.getParameter("arguments").ID;
                this.getView().bindElement({
                    path: "/opportunityActionItems/" + this._sID,
                    parameters: {
                        expand: "opptID,subTasks"
                    }

                });
                oModel.setDefaultBindingMode("TwoWay");

                this.onReadSubTasksData(this._sID); 
               
            },

            onReadSubTasksData: function(sthisID){
                var oModel = this.getView().getModel();
                var oTable = this.getView().byId("subTaskTable");
                var sID;
                if(sthisID) sID = sthisID;
                else sID = this.getView().getBindingContext().getObject().ID;
    
                 var aFilters = [];
                 aFilters.push(new Filter("ID", FilterOperator.EQ, sID));
                 var oSubTaskModel = this.getView().getModel("subTaskModel");

                 oModel.read("/opportunityActionItems", {
                     urlParameters: {
                         "$expand": "subTasks"
                     },
                     filters: aFilters,
                     success: function (oResponse) {
                         var aTasks = oResponse.results[0].subTasks.results;
                         oSubTaskModel.setProperty("/subtasks", aTasks);

                         oTable.updateBindings();
                         oTable.getSelectedItems().forEach(oItem=>{
                            oItem.mAggregations.cells[0].addStyleClass("checkSubTask");
                         });

                         
                        
                     }.bind(this),
                     error: function (oError) {
                         console.log(oError);
                     }
                 });

            },


            onNavBackPress: function (oEvent) {
            
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TasksReport");
            },

            onCancelObjectPress: function (oEvent) {
                var oCancelBtn = oEvent.getSource();
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", false);
                var oModel = this.getView().getModel();
                oModel.resetChanges();
                oModel.updateBindings();

            },

            onEditObjectPress: function (oEvent) {
                var oCancelBtn = oEvent.getSource();
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

            },

            onTableCheckPress: function(oEvent){
                var aSelected = this.getView().byId("subTaskTable").getTable().getSelectedItems()
                // .addStyleClass("checkSubTask")

                var aItems = this.getView().byId("subTaskTable").getTable().getItems(); 
                aItems.forEach(oItem =>{
                    if(oItem.getSelected()){
                        oItem.mAggregations.cells[0].addStyleClass("checkSubTask");
                    }
                })

               
            },

            onBeforeRebindSubTaskTable: function(oEvent){
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter("opptID_ID", sap.ui.model.FilterOperator.EQ, this._sID));

                var oTable = this.getView().byId("subTaskTable")

                  var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader = oContext.getProperty("subTaskOwner");
                    return {
                      key: sHeader,
                    };
                  };
                  var oGrouping = new sap.ui.model.Sorter("subTaskOwner", true, fnGroupHeaderFormatter);
                  oBindingParams.sorter.push(oGrouping);
               


              },


           
            onAddSubTask: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddSubTask");
                
            },

            onSubmitNewSubTask: function(oEvent) {
                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent(); 
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                var oData = oAddSubTaskModel.getData();

                var sID = this.getView().getBindingContext().getObject().ID;
                var sOpptID = this.getView().getBindingContext().getObject().opptID_opportunityID;
                var sCustomer = this.getView().getBindingContext().getObject().actionCustomer; 

                var sDueDate;
                if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];

                var oNewSubTask = {
                  subTask: oData.subTask,
                  subTaskOwner: oData.subTaskOwner,
                  subTaskDueDate: sDueDate,
                  opptID_ID: this._sID,
                  subTaskCompleted: false
                };
              
                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/opportunitySubTasks", oNewSubTask, {
                    success: function (oData, response) {
                        MessageToast.show("New sub-task added!");
                        that.onReadSubTasksData(); 
                        that.getView().setBusy(false);
                        oDialog.close(); 
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        MessageBox.error("Sub-task could not be added. Please check your input.");
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


            onSelectSubTask: function (oEvent) {
                var that = this; 
                var sPath; 

                var isSelected = oEvent.mParameters.listItem.getSelected(); 

                if (isSelected === true) {
                    oContext.isSelected = true; 
                } else {
                    oContext.isSelected = false; 
                }

                var oModel = this.getView().getModel(); 
                oModel.update(sPath, oContext, {
                    success: function() {
                    var sMessage = "";
                    if (isSelected === true) {
                        sMessage = "Added";
                    } else {
                        sMessage = "Removed";
                    }
                    MessageToast.show(sMessage);
                    },
                    error: function(oError) {
                      MessageToast.show(oError.message);
                    }
                  });

            },


         
        });
    });
