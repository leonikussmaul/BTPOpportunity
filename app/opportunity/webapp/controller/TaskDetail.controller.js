sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/core/ValueState",
    "sap/ui/model/FilterType",
    "../model/formatter",
    "sap/ui/core/routing/History",
    "sap/ui/core/date/UI5Date",
    'sap/m/library',
    "sap/ui/core/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, MessageToast, ValueState, FilterType, formatter, History, UI5Date, library, CoreLibrary) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oValueState = {
                valueState: ValueState.None,
                valueStateText: ""
            };


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

                var oEditPageModel = new JSONModel({});
                this.getView().setModel(AddSubTaskModel, "editPageModel");

                var oLocalModel = new JSONModel({});
                this.getView().setModel(oLocalModel, "localModel");

                this.getView().setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");


            },

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                this._sID = oEvent.getParameter("arguments").ID;

                this.getView().bindElement({
                    path: "/opportunityActionItems/" + this._sID,
                    parameters: {
                        expand: "subTasks"
                    }

                });
                oModel.setDefaultBindingMode("TwoWay");

                this.onReadSubTasksData(this._sID);
                this.onFilterLinkList(this._sID);
                this.onFilterComments(this._sID);

                this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", false);
                this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", false);

                this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");
            },

            onReadSubTasksData: function (sthisID) {
                var that = this;
                var oModel = this.getView().getModel();
                var sID;
                if (sthisID) sID = sthisID;
                else sID = this.getView().getBindingContext().getObject().ID;

                var aFilters = [];
                aFilters.push(new Filter("opptID_ID", FilterOperator.EQ, this._sID));
                var oSubTaskModel = this.getView().getModel("subTaskModel");

                oModel.read("/opportunitySubTasks", {
                    //  urlParameters: {
                    //      "$expand": "subTasks"
                    //  },
                    filters: aFilters,
                    sorters: [
                        new sap.ui.model.Sorter("subTaskOrder", false)
                    ],
                    success: function (oResponse) {
                        var aTasks = oResponse.results;
                        oSubTaskModel.setProperty("/subtasks", aTasks);
                        var iCompletedCount = aTasks.reduce(function (iCount, oTask) {
                            return oTask.subTaskCompleted ? iCount : iCount + 1;
                        }, 0);
                        oSubTaskModel.setProperty("/completedCount", iCompletedCount);
                        that.onCompleteItems();
                        that.updateCurrentIndex(aTasks);

                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

            },

            onCompleteItems: function (oEvent) {
                var oTable = this.getView().byId("subTaskTable");
                oTable.getItems().forEach(oItem => {
                    if (oItem.getSelected()) oItem.mAggregations.cells[1].addStyleClass("checkSubTask");
                    else if (!oItem.getSelected()) oItem.mAggregations.cells[1].removeStyleClass("checkSubTask");
                });

            },

            onNavBackPress: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oModel = this.getView().getModel();
                var oHistory = History.getInstance();
                var sPreviousHash = oHistory.getPreviousHash();

                var oEditModel = this.getView().getModel("editModel");
                var bEditMode = oEditModel.getProperty("/editMode");
                if (bEditMode) {
                    MessageBox.confirm("Discard changes and navigate back?", {
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {

                                // If user confirms, navigate back
                                oEditModel.setProperty("/editMode", false);
                                if (oModel.hasPendingChanges()) {
                                    oModel.resetChanges();
                                    oModel.updateBindings();
                                }

                                if (sPreviousHash !== undefined) window.history.go(-1);
                                else oRouter.navTo("TasksReport");
                            }
                        }.bind(this)
                    });
                } else {
                    // If edit mode is disabled, directly navigate back
                    if (sPreviousHash !== undefined) window.history.go(-1);
                    else oRouter.navTo("TasksReport");
                }

            },


            onAddSubTask: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddSubTask");

            },

            onSubmitNewSubTask: function (oEvent) {
                var that = this;
                //var oDialog = oEvent.getSource().getParent().getParent();
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                var oData = oAddSubTaskModel.getData();
                if (oData.subTask) {
                    this.resetValueState();

                    var iOrder = this.getView().getModel("subTaskModel").getData().subtasks.length;

                    var subTaskStatus;
                    if (oData.subTaskStatus) subTaskStatus = oData.subTaskStatus;
                    else subTaskStatus = "Not Started";

                    var bCompleted = false;
                    if (oData.subTaskStatus === "Completed") {
                        bCompleted = true
                    }

                    var sDueDate;
                    if (oData.subTaskDueDate) sDueDate = new Date(oData.subTaskDueDate).toISOString().split("T")[0];

                    var oNewSubTask = {
                        subTask: oData.subTask,
                        subTaskOwner: oData.subTaskOwner,
                        subTaskDueDate: sDueDate,
                        opptID_ID: this._sID,
                        subTaskCompleted: bCompleted,
                        subTaskStatus: subTaskStatus,
                        subTaskOrder: iOrder
                    };

                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunitySubTasks", oNewSubTask, {
                        success: function (oData, response) {
                            MessageToast.show("New sub-task added!");
                            that.onReadSubTasksData();
                            that.getView().setBusy(false);
                            // oDialog.close();
                            //oAddSubTaskModel.setData({});
                            that.onCancelDialogPress();

                        },
                        error: function (oError) {
                            that.getView().setBusy(false);
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                } else this.ValueStateMethod();
            },

            onDialogOpen: function (fragmentName) {
                this.resetValueState();
                var that = this;
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        //id:"myDialog",
                        name: fragmentName,
                        controller: this
                    }).then(function (_pDialog) {
                        that.getView().addDependent(_pDialog);
                        _pDialog.setEscapeHandler(function () {
                            that.onCloseDialog();
                        });
                        return _pDialog;
                    });
                }
                this._pDialog.then(function (_pDialog) {
                    _pDialog.open();

                })
            },


            onCancelDialogPress: function (oEvent) {
                this._pDialog.then(function (_pDialog) {
                    _pDialog.close();
                    _pDialog.destroy();
                });
                this._pDialog = null;
                var oLocalModel = this.getView().getModel("localModel");
                oLocalModel.setData({});
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                oAddSubTaskModel.setData({});

            },


            onSelectSubTask: function (oEvent) {
                var that = this;
                that.getView().setBusy(true);

                var aSelected = oEvent.mParameters.listItems;
                aSelected.forEach(oItem => {
                    var oData;
                    var oContext = oItem.getBindingContext().getObject();
                    var isSelected = oItem.getSelected();
                    if (oItem.getBindingContext("subTaskModel")) {
                        oData = oItem.getBindingContext("subTaskModel").getObject();
                        var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')"

                        if (isSelected === true) {
                            oContext.subTaskCompleted = true;
                            oContext.subTaskStatus = "Completed"
                        }
                        else {
                            oContext.subTaskCompleted = false;
                            oContext.subTaskStatus = oData.subTaskStatus
                        }

                        var oPayload = {
                            ID: oData.ID,
                            subTaskCompleted: oContext.subTaskCompleted,
                            subTaskStatus: oContext.subTaskStatus
                        }

                        var oModel = this.getView().getModel();
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                if (isSelected === true) {
                                    MessageToast.show("Sub-Task Completed");
                                }
                                that.onReadSubTasksData();
                                that.getView().getModel("subTaskModel").refresh();
                                that.getView().setBusy(false);
                            },
                            error: function (oError) {
                                that.getView().setBusy(false);
                                var sMessage = JSON.parse(oError.responseText).error.message.value;
                                sap.m.MessageToast.show(sMessage);
                            }
                        });
                    }
                });

            },

            onDeleteSubTasks: function (oEvent) {
                var that = this;
                var oTable = this.getView().byId("subTaskTable");
                var oSubTaskModel = this.getView().getModel("subTaskModel");
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
                            var promises = []; // array to store promises
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                                var oData = aSelectedItems[i].getBindingContext("subTaskModel").getObject();
                                var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')";

                                var promise = new Promise(function (resolve, reject) {
                                    oModel.remove(sPath, {

                                        success: function (oData, oResponse) {
                                            oModel.refresh();
                                            oSubTaskModel.refresh();
                                            that.onReadSubTasksData();
                                            oSubTaskModel.updateBindings();
                                            oTable.updateBindings();

                                            oTable.removeSelections(true);
                                            resolve();

                                        },
                                        error: function () {
                                            reject();
                                        }
                                    });
                                });

                                promises.push(promise); // add promise to the array
                            }

                            Promise.all(promises).then(function () {
                                sap.m.MessageToast.show("All Sub-Tasks Completed!");
                                that.onReadSubTasksData();
                            }).catch(function () {
                                sap.m.MessageToast.show("Some Sub-Tasks could not be deleted. Please try again later.");
                                oTable.removeSelections(true);
                            });
                        }
                    }
                });
            },

            //Edit Sub Task 

            onEditSubTask: function (oEvent) {
                var that = this;
                var oData = oEvent.getSource().getBindingContext("subTaskModel").getObject();
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                if (oData.subTaskDueDate) {
                    oData.subTaskDueDate = oData.subTaskDueDate.toISOString().split('T')[0];
                }
                oAddSubTaskModel.setData(oData);
                this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditSubTask");

            },

            onSubmitEditedSubTask: function (oEvent) {
                var that = this;

                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                var oData = oAddSubTaskModel.getData();

                var subTaskStatus;
                if (oData.subTaskStatus) subTaskStatus = oData.subTaskStatus;
                else subTaskStatus = "Not Started";

                var bCompleted = false;
                if (oData.subTaskStatus === "Completed") {
                    bCompleted = true
                }

                var sDueDate;
                if (oData.subTaskDueDate) sDueDate = new Date(oData.subTaskDueDate).toISOString().split("T")[0];

                var oPayload = {
                    subTask: oData.subTask,
                    subTaskOwner: oData.subTaskOwner,
                    subTaskDueDate: sDueDate,
                    subTaskStatus: subTaskStatus
                };

                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                var sPath = "/opportunitySubTasks/" + oAddSubTaskModel.getData().ID;
                oModel.update(sPath, oPayload, {
                    success: function (oData, response) {
                        MessageToast.show("Sub-task updated!");
                        that.onReadSubTasksData();
                        that.getView().setBusy(false);
                        that.onCancelDialogPress();

                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

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
                        if (sAction === MessageBox.Action.OK) {
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("TasksReport");
                            that.getView().setBusy(true);

                            var oModel = that.getView().getModel();
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Task deleted successfully.");
                                    that.getView().setBusy(false);
                                },
                                error: function (oError) {
                                    that.getView().setBusy(false);
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageToast.show(sMessage);
                                }
                            });
                        } else {
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
                var oEditModel = this.getView().getModel("editModel");
                var oEditPageModel = this.getView().getModel("editPageModel");
                var oData = oEditPageModel.getData();


                var sPriority;
                if (oData.actionPriority == "High") sPriority = 1;
                else if (oData.actionPriority == "Medium") sPriority = 2;
                else if (oData.actionPriority == "Low") sPriority = 3;

                var oPayload = {
                    actionTask: oData.actionTask,
                    actionTitle: oData.actionTitle,
                    actionOwner: oData.actionOwner,
                    actionProgress: this.getView().byId("actionProgressSlider").getValue(),
                    actionDueDate: oData.actionDueDate,
                    actionPriority: oData.actionPriority,
                    actionPriorityNumber: sPriority,
                    actionTopic: oData.actionTopic
                }

                var sPath = this.getView().getBindingContext().sPath;
                oModel.update(sPath, oPayload, {
                    success: function () {
                        MessageToast.show("Changes saved successfully!");
                        oEditModel.setProperty("/editMode", false);
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });
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
                this.onSetEditPageModel();
            },

            onSetEditPageModel: function () {
                var oData = this.getView().getBindingContext().getObject();
                var oEditPageModel = this.getView().getModel("editPageModel");
                oEditPageModel.setData(oData);
            },


            onProgressSliderChange: function (oEvent) {
                var oModel = this.getView().getModel();
                var oValue = oEvent.getParameter("value");
                var oContext = this.getView().getBindingContext();
                var sPath = oContext.getPath();
                oModel.setProperty(sPath + "/actionProgress", oValue);
            },

            onReorderUp: function (oEvent) {
                var sDirection = "Up"
                this.onReorderItems(oEvent, sDirection);
            },

            onReorderDown: function (oEvent) {
                var sDirection = "Down"
                this.onReorderItems(oEvent, sDirection);
            },

            onReorderItems: function (oEvent, sDirection) {
                var that = this;
                var oSubTaskModel = this.getView().getModel("subTaskModel");
                var aSubTasks = oSubTaskModel.getProperty("/subtasks");
                var oItem = oEvent.getSource().getBindingContext("subTaskModel").getObject();
                var iIndex = oItem.subTaskOrder;

                // Order up or down
                var iNewIndex = iIndex;
                if (sDirection === "Up" && iIndex > 0) {
                    iNewIndex = iIndex - 1;
                } else if (sDirection === "Down" && iIndex < aSubTasks.length - 1) {
                    iNewIndex = iIndex + 1;
                }

                if (iIndex !== iNewIndex) {
                    aSubTasks.splice(iNewIndex, 0, aSubTasks.splice(iIndex, 1)[0]);
                    aSubTasks.forEach(function (oItem, iIndex) {
                        if (oItem) {
                            oItem.subTaskOrder = iIndex;
                        }
                    });
                    aSubTasks = aSubTasks.filter(function (oItem) {
                        return oItem !== undefined;
                    });
                    oSubTaskModel.setProperty("/subtasks", aSubTasks);
                    oSubTaskModel.updateBindings();

                    // Update the server-side data if required
                    var oModel = this.getView().getModel();
                    aSubTasks.forEach(function (oItem, iIndex) {
                        if (oItem) {
                            var guidJSON = oItem.ID;
                            var iOrder = oItem.subTaskOrder;
                            var sPath = "/opportunitySubTasks(guid'" + guidJSON + "')";
                            var oData = { subTaskOrder: iOrder };
                            oModel.update(sPath, oData, {
                                success: function () {
                                    that.onCompleteItems();
                                    that.getView().getModel("subTaskModel").refresh();
                                },
                                error: function (oError) {
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageToast.show(sMessage);
                                }
                            });
                        } else {
                            // Skip creating a new item
                            aSubTasks.splice(iIndex, 1);
                        }
                    });
                }
            },



            onPopoverPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView(),
                    iIndex = oEvent.getSource().getBindingContext("subTaskModel").sPath;

                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "opportunity.opportunity.view.fragments.taskPopover.TaskPopover2",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.bindElement({
                        path: "subTaskModel>" + iIndex,
                        events: {
                            change: function () {
                                oPopover.invalidate();
                            }
                        }
                    });

                    return oPopover;
                })

                this._pPopover.then(function (oPopover) {
                    oPopover.attachAfterClose(function () {
                        oPopover.destroy();
                    }.bind(this));
                    oPopover.openBy(oButton);
                });
            },

            onSubTaskStatusChange: function (oEvent) {
                var that = this;
                var oModel = this.getView().getModel();
                var selectedGuid = oEvent.getSource().getBindingContext("subTaskModel").getObject().ID;
                var oNewStatus = oEvent.getSource().getText();

                var oData = { subTaskStatus: oNewStatus, subTaskCompleted: false };
                if (oNewStatus === "Completed") {
                    oEvent.getSource().getParent().getParent().getParent().setSelected(true);
                    oData = {
                        subTaskStatus: oNewStatus,
                        subTaskCompleted: true
                    };
                }

                var sPath = "/opportunitySubTasks(guid'" + selectedGuid + "')";

                oModel.update(sPath, oData, {
                    success: function () {
                        MessageToast.show("Status changed to " + oNewStatus);
                        // that.onReadSubTasksData();
                        that.onCompleteItems();
                        that.getView().getModel("subTaskModel").refresh();
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageToast.show(sMessage);
                    }
                });
            },

            updateCurrentIndex: function (aTasks) {
                var that = this;
                var oModel = this.getView().getModel();
                var oTable = this.getView().byId("subTaskTable");
                var oSubTaskModel = this.getView().getModel("subTaskModel");
                var aTasks = this.getView().getModel("subTaskModel").getProperty("/subtasks");
                for (var i = 0; i < aTasks.length; i++) {
                    var sGuid = aTasks[i].ID
                    var sPath = "/opportunitySubTasks(guid'" + sGuid + "')";
                    var oData = { subTaskOrder: i };
                    oModel.update(sPath, oData, {
                        success: function () {
                            oTable.updateBindings();
                            oSubTaskModel.updateBindings();
                            oModel.refresh();
                            that.getView().getModel("subTaskModel").refresh();

                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageToast.show(sMessage);
                        }
                    });

                }

            },

            onGoToOpportunity: function (oEvent) {
                var oContext = this.getView().getBindingContext().getObject();
                var oppID = oContext.opptID_opportunityID;
                this.getOwnerComponent().getModel("userModel").setProperty("/opportunityID", oppID);

                // var oTabModel = this.getOwnerComponent().getModel("tabModel");
                // var aData = oTabModel.getData().tabs; 

                // var oObject = this.getView().getModel().getProperty("/opportunityHeader(" + oppID + ")");
                // aData.unshift(oObject); 
                // oTabModel.setProperty("/tabs", aData); 

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ObjectPage", {
                    opportunityID: oppID,
                    layout: "TwoColumnsMidExpanded"
                });
            },

            onSubTaskFilter: function () {
                var oTable = this.byId("subTaskTable");
                var oBinding = oTable.getBinding("items");
                var oSelected = this.getView().byId("subTaskFilter").getSelectedKey();
                var oFilter;

                if (oSelected === 'Open') {
                    oFilter = new sap.ui.model.Filter("subTaskCompleted", sap.ui.model.FilterOperator.EQ, false);

                } else if (oSelected === 'Completed') {
                    oFilter = new sap.ui.model.Filter("subTaskCompleted", sap.ui.model.FilterOperator.EQ, true);

                } else {
                    oFilter = null;

                }

                oBinding.filter(oFilter, sap.ui.model.FilterType.Application);
                this.onReadSubTasksData();
            },

            /* ------------------------------------------------------------------------------------------------------------
COMMENTS
--------------------------------------------------------------------------------------------------------------*/


            onFilterComments(sOpportunityID) {
                var oList = this.getView().byId("idTimeline")
                var commentTemp = this.getView().byId("timelineTasks");
                // var oSorter = new sap.ui.model.Sorter("postedOn", true);

                var aCommentFilters = new Filter("opptID_ID", FilterOperator.EQ, sOpportunityID);
                oList.bindAggregation("content", {
                    template: commentTemp,
                    path: "/opportunityTasksComments",
                    //sorter: oSorter,
                    filters: aCommentFilters
                });
            },

            onPostComment: function (oEvent) {

                var that = this;
                var oValue = oEvent.mParameters.value;
                this.taskID = this.getView().getBindingContext().getObject().ID;
                var sPostedBy = this.getOwnerComponent().getModel("user").getProperty("/firstname");
                //this.opptID = this.getView().getBindingContext().getObject().opptID_opportunityID;

                var oPayload = {
                    opptID_ID: this.taskID,
                    comment: oValue,
                    postedBy: sPostedBy,
                    postedOn: UI5Date.getInstance()
                }
                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/opportunityTasksComments", oPayload, {
                    success: function (oData, response) {
                        MessageToast.show("New comment added!");
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });


            },

            onDeleteTaskComment: function (oEvent) {
                var that = this;
                this.taskID = this.getView().getBindingContext().getObject().ID;
                var sPath = oEvent.getSource().getParent().getBindingContext().sPath;
                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.remove(sPath, {
                    success: function () {
                        sap.m.MessageToast.show("Comment has been deleted");
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageToast.show(sMessage);
                    }
                });

            },



            /* ------------------------------------------------------------------------------------------------------------
LINK
--------------------------------------------------------------------------------------------------------------*/



            onAddNewLink: function (oEvent) {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddLink");


            },

            onSubmitNewLink: function (oEvent) {
                var that = this;
                var sID = this.getView().getBindingContext().getObject().ID;

                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();

                var oValueStateModel = this.getView().getModel("valueState");
                if (oData.linkName && oData.link) {
                    oValueStateModel.setProperty("/valueState", ValueState.None);


                    var oPayload = {
                        linkName: oData.linkName,
                        linkDescription: oData.linkDescription,
                        link: oData.link,
                        opptID_ID: sID
                    }
                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunityTasksLinks", oPayload, {
                        success: function (oData, response) {
                            MessageToast.show("New Link added!");
                            that.getView().setBusy(false);
                            that.onFilterLinkList(sID);
                            that.onCancelDialogPress();
                        },
                        error: function (oError) {
                            that.getView().setBusy(false);
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });

                } else {
                    MessageToast.show("Please enter a link and a title");
                    oValueStateModel.setProperty("/valueState", ValueState.Error);
                    oValueStateModel.setProperty("/valueStateText", "This field is mandatory");
                }

            },


            onFilterLinkList: function (sID) {

                var oTemplate = this.getView().byId("linkListItem");
                var oSorter = new sap.ui.model.Sorter("linkName", true);
                var oFilter = new Filter("opptID_ID", FilterOperator.EQ, sID);
                this.getView().byId("linkList").bindAggregation("items", {
                    template: oTemplate,
                    path: "/opportunityTasksLinks",
                    sorter: oSorter,
                    filters: oFilter
                });

            },

            onDeleteLink: function (oEvent) {

                var that = this;
                var oBindingContext = oEvent.mParameters.listItem.getBindingContext();
                var sPath = oBindingContext.getPath();
                var sLinkName = oBindingContext.getObject("linkName");

                MessageBox.confirm("Are you sure you want to delete the link '" + sLinkName + "'?", function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        that.getView().setBusy(true);
                        var oModel = that.getView().getModel();
                        oModel.remove(sPath, {
                            success: function () {
                                sap.m.MessageToast.show("Link deleted successfully.");
                                that.getView().setBusy(false);
                            },
                            error: function (oError) {
                                that.getView().setBusy(false);
                                var sMessage = JSON.parse(oError.responseText).error.message.value;
                                sap.m.MessageToast.show(sMessage);
                            }
                        });
                    }
                });

            },

            onSelectLink: function (oEvent) {
                var sLink = oEvent.getSource().getBindingContext().getObject().link;
                library.URLHelper.redirect(sLink, true);
            },


            /* ------------------------------------------------------------------------------------------------------------
         VALUE STATE
         --------------------------------------------------------------------------------------------------------------*/


            ValueStateMethod: function (oEvent) {
                var oValueStateModel = this.getView().getModel("valueState");
                MessageToast.show("Please fill all mandatory fields");
                oValueStateModel.setProperty("/valueState", ValueState.Error);
                oValueStateModel.setProperty("/valueStateText", "This field is mandatory");

            },

            resetValueState: function (oEvent) {
                var oValueStateModel = this.getView().getModel("valueState");
                oValueStateModel.setProperty("/valueState", ValueState.None);
                oValueStateModel.setProperty("/valueStateText", "");
            },

            onChangeValueState: function (oEvent) {
                var sValue = oEvent.mParameters.newValue;
                if (sValue) this.resetValueState();
            },


            /* ------------------------------------------------------------------------------------------------------------
          FCL BUTTONS
          --------------------------------------------------------------------------------------------------------------*/


            handleFullScreen: function () {
                this.getOwnerComponent().getModel("global").setProperty("/layout", "MidColumnFullScreen");

                this.byId("enterFullScreenBtn").setVisible(false);
                this.byId("exitFullScreenBtn").setVisible(true);
            },

            handleExitFullScreen: function () {
                this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");

                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);
            },

            handleClose: function () {
              
                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);

                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/layout", "OneColumn");
                oGlobalModel.setProperty("/columnsExpanded", true);
                oGlobalModel.setProperty("/filterbarExpanded", true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TasksReport", {
                });

            },



        });
    });
