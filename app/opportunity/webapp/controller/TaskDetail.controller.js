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
                    // parameters: {
                    //     expand: "actionItems"
                    // }

                });
                oModel.setDefaultBindingMode("TwoWay");

                this.onReadSubTasksData(this._sID);

            },

            onReadSubTasksData: function (sthisID) {
                var oModel = this.getView().getModel();
                var oTable = this.getView().byId("subTaskTable");
                var sID;
                if (sthisID) sID = sthisID;
                else sID = this.getView().getBindingContext().getObject().ID;

                var aFilters = [];
                aFilters.push(new Filter("opptID_ID", FilterOperator.EQ, this._sID));

                //  var aFilters = [];
                //  aFilters.push(new Filter("ID", FilterOperator.EQ, sID));
                var oSubTaskModel = this.getView().getModel("subTaskModel");

                oModel.read("/opportunitySubTasks", {
                    //  urlParameters: {
                    //      "$expand": "subTasks"
                    //  },
                    filters: aFilters,
                    success: function (oResponse) {
                        var aTasks = oResponse.results;
                        oSubTaskModel.setProperty("/subtasks", aTasks);

                        var iCompletedCount = aTasks.reduce(function (iCount, oTask) {
                            return oTask.subTaskCompleted ? iCount : iCount + 1;
                        }, 0);
                        oSubTaskModel.setProperty("/completedCount", iCompletedCount);

                        oTable.updateBindings();
                        oTable.getSelectedItems().forEach(oItem => {
                            oItem.mAggregations.cells[0].addStyleClass("checkSubTask");
                        });



                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

            },


            onNavBackPress: function (oEvent) {

                var oModel = this.getView().getModel();

                var oEditModel = this.getView().getModel("editModel");
                var bEditMode = oEditModel.getProperty("/editMode");
                if (bEditMode) {
                    MessageBox.confirm("Discard changes and navigate back?", {
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                // If user confirms, navigate back
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("TasksReport");
                                oEditModel.setProperty("/editMode", false);

                                if (oModel.hasPendingChanges()) {
                                    oModel.resetChanges();
                                    oModel.updateBindings();
                                }
                            }
                        }.bind(this)
                    });
                } else {
                    // If edit mode is disabled, directly navigate back
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("TasksReport");
                }


            },



            onTableCheckPress: function (oEvent) {
                var aSelected = this.getView().byId("subTaskTable").getTable().getSelectedItems()
                // .addStyleClass("checkSubTask")

                var aItems = this.getView().byId("subTaskTable").getTable().getItems();
                aItems.forEach(oItem => {
                    if (oItem.getSelected()) {
                        oItem.mAggregations.cells[0].addStyleClass("checkSubTask");
                    }
                })

            },

            onBeforeRebindSubTaskTable: function (oEvent) {
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

            onSubmitNewSubTask: function (oEvent) {
                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent();
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                var oData = oAddSubTaskModel.getData();

                var sID = this.getView().getBindingContext().getObject().ID;
                var sOpptID = this.getView().getBindingContext().getObject().opptID_opportunityID;
                var sCustomer = this.getView().getBindingContext().getObject().actionCustomer;

                var sDueDate;
                if (oData.subTaskDueDate) sDueDate = new Date(oData.subTaskDueDate).toISOString().split("T")[0];

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
                        oAddSubTaskModel.setData({}); 
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
                oEvent.getSource().getParent().getParent().close();
                var oAddTaskModel = this.getView().getModel("AddSubTaskModel");
                oAddTaskModel.setData({}); 
            },


            onSelectSubTask: function (oEvent) {
                var that = this;
                that.getView().setBusy(true); 
                
                var aSelected = oEvent.mParameters.listItems; 
                aSelected.forEach(oItem =>{
                    var oData; 
                    var oContext = oItem.getBindingContext().getObject();
                    var isSelected = oItem.getSelected();
                    if(oItem.getBindingContext("subTaskModel")){
                        oData = oItem.getBindingContext("subTaskModel").getObject();
                        var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')"

                        if (isSelected === true) oContext.subTaskCompleted = true;
                        else oContext.subTaskCompleted = false;

                        var oPayload = {
                            ID: oData.ID,
                            subTaskCompleted: oContext.subTaskCompleted
                        }
        
                        var oModel = this.getView().getModel();
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                if (isSelected === true) {
                                    MessageToast.show("Sub-Task Completed");
                                }
                                that.onReadSubTasksData();
                                that.getView().setBusy(false); 
                            },
                            error: function (oError) {
                                MessageToast.show(oError.message);
                                that.getView().setBusy(false); 
                            }
                        });
                    }
                });

            },

            onDeleteSubTasks: function (oEvent) {
                var that = this; 
                var oTable = this.getView().byId("subTaskTable");
                var aSelectedItems = oTable.getSelectedItems();

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show("Complete at least one sub-task to delete");
                    return;
                }
                var oModel = this.getView().getModel(); 
                sap.m.MessageBox.warning("Are you sure you want to delete all the completed sub-tasks?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {

                                var oData = aSelectedItems[i].getBindingContext("subTaskModel").getObject();
                                var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')"

                                oModel.remove(sPath, {
                                    success: function () {
                                        sap.m.MessageToast.show("Sub-Task deleted successfully.");
                                        that.onReadSubTasksData(); 
                                        oTable.removeSelections(true); 
                                    },
                                    error: function () {
                                        sap.m.MessageToast.show("Could not delete Sub-Task. Please try again later.");
                                    }
                                });
                            }
                        }
                    }
                });
            },

            onDeleteTaskObjectPress: function (oEvent) {
                var that = this;
                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath();

                

                MessageBox.warning("Are you sure you want to delete this task?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction === MessageBox.Action.OK){
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("TasksReport");
                            that.getView().setBusy(true);
    
                            var oModel = that.getView().getModel();
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Task deleted successfully.");
                                    that.getView().setBusy(false);
                                },
                                error: function () {
                                    sap.m.MessageToast.show("Task could not be deleted. Please try again.");
                                    that.getView().setBusy(false);
                                }
                            });
                    } else{
                        that.getView().setBusy(false);
                    }
                    }
                });
            },


            /* ------------------------------------------------------------------------------------------------------------
            EDIT / CANCEL
            --------------------------------------------------------------------------------------------------------------*/

            onSaveObjectPress: function (oEvent) {
                var oModel = this.getView().getModel();
                var oEditModel = this.getView().getModel("editModel")

                if (oModel.hasPendingChanges()) {
                    oModel.submitChanges({
                        success: function () {
                            oModel.refresh();
                            MessageToast.show("Changes saved successfully!");
                            oModel.resetChanges();
                            oEditModel.setProperty("/editMode", false);
                        }.bind(this),
                        error: function (oError) {
                            MessageBox.success("Your changes could not be saved. Please try again.");
                            oModel.resetChanges();
                        }.bind(this)
                    });
                } else MessageToast.show("No changes detected")

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

            onProgressSliderChange: function(oEvent){

                var oModel = this.getView().getModel(); 

                var oValue = oEvent.getParameter("value");
                var oContext = this.getView().getBindingContext();
                
                var sPath = oContext.getPath();
                oModel.setProperty(sPath + "/actionProgress", oValue);

            },



        });
    });
