sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",
    "sap/ui/model/FilterType",
    "sap/ui/core/routing/History",
    "sap/ui/core/date/UI5Date",
    "sap/ui/core/format/DateFormat",
    'sap/m/library',
    "sap/ui/core/library"

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast, formatter, JSONModel, Filter, FilterOperator, Fragment, FilterType, History, UI5Date, DateFormat, library, CoreLibrary) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oValueState = {
                valueState: ValueState.None,
                valueStateText: ""
            };

        return Controller.extend("opportunity.opportunity.controller.OpportunityDetail", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("OpportunityDetail").attachPatternMatched(this._onRoutePatternMatched, this);

                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "pageModel");

                var oEditModel = new JSONModel({
                    editMode: false
                });
                this.getView().setModel(oEditModel, "editModel");

                var AddTaskModel = new JSONModel({});
                this.getView().setModel(AddTaskModel, "AddTaskModel");

                var oEditPageModel = new JSONModel({});
                this.getView().setModel(oEditPageModel, "editPageModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                }), "viewModel");

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");

                oView.setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");

                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "subTaskModel");

                var AddSubTaskModel = new JSONModel({});
                this.getView().setModel(AddSubTaskModel, "AddSubTaskModel");
            },
            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();

                var sOpportunityID = oEvent.getParameter("arguments").opportunityID || this.getOwnerComponent().getModel("userModel").getProperty("/opportunityID");
                this.getOwnerComponent().getModel("userModel").setProperty("/opportunityID", sOpportunityID);

                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "deliverables,links"
                    }
                });

                this.sOpportunityID = sOpportunityID;
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "Opportunities");
                oModel.setDefaultBindingMode("TwoWay");

                // wait for async calls 
                Promise.all([
                    this.onFilterLinkList(sOpportunityID),
                    this.onFilterNextSteps(sOpportunityID),
                    this.onReadModelData(sOpportunityID),
                    this.onReadSubTasksData(sOpportunityID),
                    this.onSetLayout(),
                    this.onReadTopics(),
                    this.onReadDeliverables()
                ]).then(() => {

                    this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");
                    this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", false);
                    this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", false);

                    // var oMaturityTable = this.getView().byId("maturityTableID");
                    // if (oMaturityTable.isInitialised()) oMaturityTable.rebindTable();

                    var oActivitiesTable = this.getView().byId("activitiesTableID");
                    if (oActivitiesTable.isInitialised()) oActivitiesTable.rebindTable();

                    //set segmented button text for current status of opportunity
                    this.setSegButtonText();
                }).catch(err => {
                    console.error("Error with route:", err);
                });
            },


            onFilterLinkList: function (sOpportunityID) {
                return new Promise((resolve, reject) => {
                    try {
                        var oTemplate = this.getView().byId("linkListItem");
                        var oSorter = new sap.ui.model.Sorter("linkName", true);
                        var oFilter = new Filter("opptID_opportunityID", FilterOperator.EQ, sOpportunityID);
                        this.getView().byId("linkList").bindAggregation("items", {
                            template: oTemplate,
                            path: "/opportunityLinks",
                            sorter: oSorter,
                            filters: oFilter
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            onFilterNextSteps: function (sOpportunityID) {
                return new Promise((resolve, reject) => {
                    try {
                        var oList = this.getView().byId("idTimeline");
                        var commentTemp = this.getView().byId("timelineTasks");
                        var aCommentFilters = new Filter("opptID_opportunityID", FilterOperator.EQ, sOpportunityID);
                        oList.bindAggregation("content", {
                            template: commentTemp,
                            path: "/opportunityNextSteps",
                            filters: aCommentFilters
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            onReadModelData: function (sOppID) {
                return new Promise((resolve, reject) => {
                    var oModel = this.getView().getModel();
                    var sOpportunityID = sOppID || this.getView().getBindingContext().getObject().opportunityID;
                    var aFilters = [new Filter("opportunityID", FilterOperator.EQ, sOpportunityID)];
                    var oPageModel = this.getView().getModel("pageModel");

                    oModel.read("/opportunityHeader", {
                        urlParameters: {
                            // "$expand": "actionItems/subTasks,topics,deliverables,maturity"
                             "$expand": "topics,deliverables,maturity"
                        },
                        filters: aFilters,
                        success: function (oResponse) {
                           // var aTasks = oResponse.results[0].actionItems.results;
                            var aTopics = oResponse.results[0].topics.results;
                            var aDeliverables = oResponse.results[0].deliverables.results;
                           // oPageModel.setProperty("/actionItems", aTasks);
                            oPageModel.setProperty("/topics", aTopics);
                            oPageModel.setProperty("/deliverables", aDeliverables);
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            console.log(oError);
                            reject(oError);
                        }
                    });
                });
            },

            onReadSubTasksData: function (sthisID) {
                var that = this;
                var oModel = this.getView().getModel();
                let iOppID = parseInt(sthisID);

                var aFilters = [];
                aFilters.push(new Filter("opportunityID_opportunityID", FilterOperator.EQ, iOppID));
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

            onAddSubTask: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddSubTask");
            },

            onSubmitNewSubTask: function (oEvent) {
                var that = this;
                var iOppID = parseInt(this.sOpportunityID);
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
                        opportunityID_opportunityID: iOppID,
                        subTaskCompleted: bCompleted,
                        subTaskStatus: subTaskStatus,
                        subTaskOrder: iOrder
                    };

                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunitySubTasks", oNewSubTask, {
                        success: function (oData, response) {
                            MessageToast.show("New sub-task added!");
                            that.onReadSubTasksData(iOppID);
                            that.getView().setBusy(false);
                            // oDialog.close();
                            oAddSubTaskModel.setData({});
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

            onSelectSubTask: function (oEvent) {
                var that = this;
                that.getView().setBusy(true);

                var iOppID = parseInt(this.sOpportunityID);

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
                                that.onReadSubTasksData(iOppID);
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

                var iOppID = parseInt(this.sOpportunityID);

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show("Complete at least one task to delete");
                    return;
                }
                var oModel = this.getView().getModel();

                sap.m.MessageBox.warning("Are you sure you want to delete all the completed tasks?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            var promises = []; // array to store promises
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                                var oData = aSelectedItems[i].getBindingContext("subTaskModel").getObject();
                                var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')";

                                var promise = new Promise(function (resolve, reject) {
                                    oModel.remove(sPath, {

                                        success: function (oData, oResponse) {
                                            oModel.refresh();
                                            oSubTaskModel.refresh();
                                            that.onReadSubTasksData(iOppID);
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
                                sap.m.MessageToast.show("All Tasks Completed!");
                                that.onReadSubTasksData(iOppID);
                            }).catch(function () {
                                sap.m.MessageToast.show("Some Tasks could not be deleted. Please try again later.");
                                oTable.removeSelections(true);
                            });
                        }
                    }
                });
            },

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

                var iOppID = parseInt(this.sOpportunityID);

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
                        MessageToast.show("Task updated!");
                        that.onReadSubTasksData(iOppID);
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

            onSetLayout: function () {
                return new Promise((resolve, reject) => {
                    try {
                        var oLayout1 = this.getView().byId("topicsID");
                        var oTemplate1 = oLayout1.getBindingInfo("content").template;
                        oLayout1.bindAggregation("content", {
                            path: 'pageModel>/topics',
                            template: oTemplate1,
                            sorter: new sap.ui.model.Sorter('sortOrder', false)
                        });

                        oLayout1 = this.getView().byId("TopicFiltersObject");
                        oTemplate1 = oLayout1.getBindingInfo("content").template;
                        oLayout1.bindAggregation("content", {
                            path: '/opportunityTopicsVH',
                            template: oTemplate1,
                            sorter: new sap.ui.model.Sorter('topic', false)
                        });

                        var oLayout2 = this.getView().byId("DeliverablesFiltersObject");
                        var oTemplate2 = oLayout2.getBindingInfo("content").template;
                        oLayout2.bindAggregation("content", {
                            path: '/opportunityDeliverablesVH',
                            template: oTemplate2,
                            sorter: new sap.ui.model.Sorter('deliverable', false)
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            onReadTopics: function () {
                return new Promise((resolve, reject) => {
                    var that = this;
                    that.getView().setBusy(true);
                    var oLocalModel = that.getView().getModel("localModel");
                    var oModel = that.getView().getModel();

                    oModel.read("/opportunityTopics", {
                        urlParameters: {
                            "$orderby": "topic"
                        },
                        success: function (oResponse) {
                            var aTopics = oResponse.results;
                            oLocalModel.setProperty("/topics", aTopics);
                            that.getView().setBusy(false);
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            console.log(oError);
                            that.getView().setBusy(false);
                            reject(oError);
                        }
                    });
                });
            },

            onReadDeliverables: function () {
                return new Promise((resolve, reject) => {
                    var that = this;
                    that.getView().setBusy(true);
                    var oLocalModel = that.getView().getModel("localModel");
                    var oModel = that.getView().getModel();

                    oModel.read("/opportunityDeliverables", {
                        urlParameters: {
                            "$orderby": "deliverable"
                        },
                        success: function (oResponse) {
                            var aDeliverables = oResponse.results;
                            oLocalModel.setProperty("/deliverables", aDeliverables);
                            that.getView().setBusy(false);
                            resolve();
                        }.bind(this),
                        error: function (oError) {
                            console.log(oError);
                            that.getView().setBusy(false);
                            reject(oError);
                        }
                    });
                });
            },


            onDeleteLink: function (oEvent) {
                var that = this;
                var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
                var sPath = oBindingContext.getPath();
                var sLinkName = oBindingContext.getProperty("linkName");
            
                MessageBox.warning("Are you sure you want to delete the link '" + sLinkName + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
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
                    }
                });
            },
            


            onAddNewLink: function (oEvent) {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddLink");
            },

            onSubmitNewLink: function (oEvent) {
                var that = this;
                //var oDialog = oEvent.getSource().getParent();
                this.customerID = this.getView().getBindingContext().getObject().opportunityID;
                var sOpportunityID = this.customerID;

                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();

                if (oData.linkName && oData.link) {
                    this.resetValueState();

                    var oPayload = {
                        linkName: oData.linkName,
                        linkDescription: oData.linkDescription,
                        link: oData.link,
                        opptID_opportunityID: this.customerID
                    }
                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunityLinks", oPayload, {
                        success: function (oData, response) {
                            MessageToast.show("New Link added!");
                            that.getView().setBusy(false);
                            //oDialog.close();
                            that.onCancelDialogPress();
                            //oLocalModel.setData({});
                            that.onFilterLinkList(sOpportunityID);
                        },
                        error: function (oError) {
                            that.getView().setBusy(false);
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });

                } else this.ValueStateMethod();

            },

            _getText: function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

            },

            onNavBackPress: function (oEvent) {

                // this.oRichTextEditor.destroy();
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
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                if (sPreviousHash !== undefined) window.history.go(-1);
                                else oRouter.navTo("OpportunityReport");
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
                    if (sPreviousHash !== undefined) window.history.go(-1);
                    else oRouter.navTo("OpportunityReport");
                }

                // this.destroyRichTextEditor(); 

            },



            /* ------------------------------------------------------------------------------------------------------------
            DELETE
            --------------------------------------------------------------------------------------------------------------*/

            onDeleteObjectPress: function (oEvent) {
                var that = this;
                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath();
                var sDeletedAccount = oBindingContext.getObject("account");

                MessageBox.confirm("Do you want to delete this opportunity with " + sDeletedAccount + "?", function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("OpportunityReport");
                        that.getView().setBusy(true);

                        var oModel = that.getView().getModel();
                        oModel.remove(sPath, {
                            success: function () {
                                sap.m.MessageToast.show("Item deleted successfully.");
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


            /* ------------------------------------------------------------------------------------------------------------
            EDIT / CANCEL
            --------------------------------------------------------------------------------------------------------------*/

            onSaveObjectPress: function (oEvent) {
                var that = this;
                this._bEdit = true;
                var oModel = this.getView().getModel();
                var oEditModel = this.getView().getModel("editModel");
                var oEditPageModel = this.getView().getModel("editPageModel");

                var oData = this.getView().getModel("editPageModel").getData();
                if (oData.account && oData.marketUnit) {

                    this.resetValueState();

                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    const d = new Date();
                    var sMonth = monthNames[d.getMonth()];

                    var oPayload = {
                        account: oData.account,
                        clientContactPerson: oData.clientContactPerson,
                        marketUnit: oData.marketUnit,
                        noteText: this.getView().byId("editRTE").getValue(),
                        opportunityClosedQuarter: oData.opportunityClosedQuarter,
                        opportunityCreatedQuarter: oData.opportunityCreatedQuarter,
                        opportunityDueDate: oData.opportunityDueDate,
                        opportunityStartDate: oData.opportunityStartDate,
                        opportunityInCRM: oData.opportunityInCRM,
                        opportunityValue: oData.opportunityValue,
                        primaryContact: oData.primaryContact,
                        priority: oData.priority,
                        progress: oData.progress,
                        source: oData.source,
                        status: this.getView().byId("segmentedStatusObject").getSelectedKey(),
                        ssa: oData.ssa,
                        topic: oData.topic,
                        valueMonth: sMonth,
                        valueYear: new Date().getFullYear().toString(),
                        adoption: oData.adoption,
                        consumption: oData.consumption
                    }

                    var sPath = this.getView().getBindingContext().sPath;
                    oModel.update(sPath, oPayload, {
                        success: function () {
                            MessageToast.show("Changes saved successfully!");
                            oModel.refresh();
                            oEditModel.setProperty("/editMode", false);
                            that.onReadModelData();
                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });

                } else this.ValueStateMethod();

            },


            onToggleButtonPressed: function (oEvent) {
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

            },

            onPressToggle1: function (oEvent) {
                var oButton = oEvent.getSource();
                var bPressed = oButton.getPressed();
                var sTopic = oButton.getText();
                var oContext = this.getView().getBindingContext();
                var sPath = oContext.getPath();
                var oModel = this.getView().getModel();

                var oNewTopic = {
                    topic: sTopic,
                    opptID_opportunityID: this.getView().getBindingContext().getObject().opportunityID
                };

                if (bPressed) {
                    var sNewPath = sPath + "/topics";
                    oModel.create(sNewPath, oNewTopic, {
                        success: function (oData, response) {
                            MessageToast.show("'" + sTopic + "' added!");
                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                } else {
                    var sTopicPath;
                    var sSource = oButton.getCustomData()[0].getValue();
                    var aTopics = oModel.getProperty(sPath + "/topics");
                    aTopics.forEach(oItem => {
                        if (oModel.getProperty("/" + oItem)) {
                            var oTopic = oModel.getProperty("/" + oItem).topic;
                            if (oTopic === sSource) {
                                sTopicPath = "/" + oItem;
                            }
                        }
                    });

                    oModel.remove(sTopicPath, {
                        success: function (oData, response) {
                            oButton.setEnabled(false);
                            MessageToast.show("'" + sSource + "' removed!");

                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                }

            },

            onPressToggle2: function (oEvent) {
                var oButton = oEvent.getSource();
                var bPressed = oButton.getPressed();
                var sDeliverable = oButton.getText();
                var oContext = this.getView().getBindingContext();
                var sPath = oContext.getPath();
                var oModel = this.getView().getModel();

                var oNewDeliverable = {
                    deliverable: sDeliverable,
                    opptID_opportunityID: this.getView().getBindingContext().getObject().opportunityID
                };

                if (bPressed) {
                    var sNewPath = sPath + "/deliverables";
                    oModel.create(sNewPath, oNewDeliverable, {
                        success: function (oData, response) {
                            MessageToast.show("'" + sDeliverable + "' added!");
                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                } else {
                    var sDeliverablePath;
                    var sSource = oButton.getCustomData()[0].getValue();
                    var aDeliverables = oModel.getProperty(sPath + "/deliverables");
                    aDeliverables.forEach(oItem => {
                        var oDeliverable = oModel.getProperty("/" + oItem).deliverable;
                        if (oDeliverable === sSource) {
                            sDeliverablePath = "/" + oItem;
                        }
                    })

                    oModel.remove(sDeliverablePath, {
                        success: function (oData, response) {
                            oButton.setEnabled(false);
                            MessageToast.show("'" + sSource + "' removed!");

                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                }
            },

            onCRMCheckboxSelect: function (oEvent) {
                var oCheckBox = oEvent.getSource();
                var oText = this.byId("opportunityInCRMText");
                var bSelected = oCheckBox.getSelected();
                var sText = bSelected ? "Yes" : "No";
                oText.setText(sText);
            },


            onCancelObjectPress: function (oEvent) {
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", false);
                var oModel = this.getView().getModel();
                oModel.resetChanges();
                oModel.updateBindings();

                //handle segmented btns
                var oSegmentedBtns = this.getView().byId("segmentedStatusObject");
                var aButtons = oSegmentedBtns.getItems();
                var oSelectedItem = oSegmentedBtns.getSelectedKey();
                aButtons.forEach(function (oBtn) {
                    if (oBtn.getKey() === oSelectedItem) {
                        oBtn.setText(oSelectedItem);
                        oBtn.setWidth("120px"); // Set width for the selected button
                    } else {
                        oBtn.setText("");
                        oBtn.setWidth("50px"); // Reset to default width
                    }
                });

            },

            onEditObjectPress: function (oEvent) {
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);
                this.onSetEditPageModel();
                this.resetValueState();
            },

            onSetEditPageModel: function (oEvent) {
                var oData = this.getView().getBindingContext().getObject();
                var oEditPageModel = this.getView().getModel("editPageModel");
                oEditPageModel.setData(oData);
            },

            onSegmentPressed: function (oEvent) {
                this.onSetEditPageModel();
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);
                var sKey = oEvent.getSource().getSelectedKey();
                this.getView().getModel("editPageModel").getData().status = sKey;

                var aButtons = this.getView().byId("segmentedStatusObject").getItems();

                var oSelectedItem = oEvent.getParameter("item");
                var sSelectedKey = oSelectedItem.getKey();

                aButtons.forEach(function (oBtn) {
                    if (oBtn.getKey() === sSelectedKey) {
                        oBtn.setText(sSelectedKey);
                        oBtn.setWidth("120px"); // Set width for the selected button
                    } else {
                        oBtn.setText("");
                        oBtn.setWidth("50px"); // Reset to default width
                    }
                });
            },

            setSegButtonText: function () {
                let oSegmentedButton = this.getView().byId("segmentedStatusObject");
                let aButtons = oSegmentedButton.getItems();
                let sSelectedKey = oSegmentedButton.getSelectedKey();

                aButtons.forEach(function (oButton) {
                    if (oButton.getKey() === sSelectedKey) {
                        oButton.setText(sSelectedKey);
                        oButton.setWidth("120px"); // Set width for the selected button
                    } else {
                        oButton.setText("");
                        oButton.setWidth("50px"); // Reset to default width
                    }
                });
            },

            /* ------------------------------------------------------------------------------------------------------------
            DIALOG
            --------------------------------------------------------------------------------------------------------------*/


            onSubmitNewTask: function (oEvent) {

                var that = this;
                // var oDialog = oEvent.getSource().getParent().getParent();
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                if (oData.actionTask && oData.actionTitle) {
                    this.resetValueState();

                    if (this._bEdit) {
                        this._bEdit = false;
                        this.onSubmitEditedTask();

                    } else {

                        var sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                        var sCustomer = this.getView().getBindingContext().getObject().account;
                        var sDueDate;
                        if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];

                        var sPriorityNumber;
                        if (oData.actionPriority === "High") sPriorityNumber = 1;
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
                            opptID_opportunityID: sOpportunityID
                        };

                        var sPath = "/opportunityHeader(" + sOpportunityID + ")/actionItems";

                        var oModel = this.getView().getModel();
                        oModel.create(sPath, oNewTask, {
                            success: function (oData, response) {
                                MessageToast.show("New Task created!");
                                that.onReadModelData();
                                that.onCancelDialogPress();
                                //oAddTaskModel.setData({});
                            },
                            error: function (oError) {
                                var sMessage = JSON.parse(oError.responseText).error.message.value;
                                sap.m.MessageBox.error(sMessage);

                            }
                        });
                        this._bEdit = false;
                    }
                } else this.ValueStateMethod();

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

            onAddTopicPress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddTopic");
            },
            onAddDeliverablePress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddDeliverable");
            },
            onAddToDoPress: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddToDo");

            },

            onDialogOpen: function (fragmentName) {

                this.resetValueState();
                var that = this;
                if (!this._pDialog) {
                    this._pDialog = Fragment.load({
                        // id:"myDialog",
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
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oLocalModel = this.getView().getModel("localModel");
                oAddTaskModel.setData({});
                oLocalModel.setData({});

            },


            /* ------------------------------------------------------------------------------------------------------------
            CHART
            --------------------------------------------------------------------------------------------------------------*/


            beforeRebindChart: function (oEvent) {
                var sOpportunityID = this.getOwnerComponent().getModel("userModel").getProperty("/opportunityID");
                var oBindingParams = oEvent.getParameter('bindingParams');

                // var filterOpportunityID = new Filter("opportunityID", FilterOperator.EQ, sOpportunityID);
                // oBindingParams.filters.push(filterOpportunityID);

                if (this.getView().getBindingContext()) {
                    var sMarketUnit = this.getView().getBindingContext().getObject().marketUnit;
                    var oFilter = new Filter("marketUnit", FilterOperator.EQ, sMarketUnit);
                    oBindingParams.filters.push(oFilter);

                }

            },


            onPopoverPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView(),
                    iIndex = oEvent.getSource().getBindingContext("pageModel").sPath;

                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "opportunity.opportunity.view.fragments.taskPopover.TaskPopover3",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.bindElement({
                        path: "pageModel>" + iIndex,
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
                        //this._pPopover = null;
                    }.bind(this));
                    oPopover.openBy(oButton);
                });
            },

        

            onCRMCheckboxSelect: function (oEvent) {
                this.onSetEditPageModel();
                var oEditModel = this.getView().getModel("editModel");
                var oEditPageModel = this.getView().getModel("editPageModel")
                var oCheckBox = oEvent.getSource();
                var bSelected = oCheckBox.getSelected();
                var sText = bSelected ? "Yes" : "No";
                oCheckBox.setText(sText);
                oEditModel.setProperty("/editMode", true);
                oEditPageModel.setProperty("/opportunityInCRM", sText);
            },


            /* ------------------------------------------------------------------------------------------------------------
          ADD TOPIC
     --------------------------------------------------------------------------------------------------------------*/


            onSubmitTopic: function (oEvent) {
                var that = this;
                //var oDialog = sap.ui.getCore().byId("topicDialog");
                var oInput = sap.ui.getCore().byId("topicInput");
                var oValue = oInput.getValue();
                var aTopics = this.getView().getModel("localModel").getData().topics;

                if (oValue != "" && oInput != null) {
                    this.resetValueState();
                    MessageBox.warning("Are you sure you want to post the topic " + oValue + " to the DataBase? This action is not reversible.", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                var isMatch = aTopics.some(oItem => {
                                    return oItem.topic.toUpperCase() === oValue.toUpperCase();
                                });
                                // POST call 
                                var oNewTopic = {
                                    topic: oValue
                                }
                                that.getView().setBusy(true);
                                var oModel = that.getView().getModel();
                                oModel.create("/opportunityTopicsVH", oNewTopic, {
                                    success: function (oData, response) {
                                        MessageToast.show("New topic posted!");
                                        // oDialog.close();
                                        that.onCancelDialogPress();
                                        oInput.setValue("");
                                        that.getView().setBusy(false);
                                    },
                                    error: function (oError) {
                                        that.getView().setBusy(false);
                                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                                        sap.m.MessageBox.error(sMessage);

                                    }
                                });
                                //}
                            } else {
                                oInput.setValue("");
                                that.getView().setBusy(false);
                            }
                        }
                    });
                } else this.ValueStateMethod();
            },

            /* ------------------------------------------------------------------------------------------------------------
          ADD DELIVERABLE
     --------------------------------------------------------------------------------------------------------------*/

            onSubmitDeliverable: function (oEvent) {
                var that = this;
                //var oDialog = sap.ui.getCore().byId("deliverableDialog");
                var oInput = sap.ui.getCore().byId("deliverableInput");
                var oValue = oInput.getValue();
                var aDeliverables = this.getView().getModel("localModel").getData().deliverables;

                if (oValue != "" && oInput != null) {
                    this.resetValueState();
                    MessageBox.warning("Are you sure you want to post the deliverable " + oValue + " to the DataBase? This action is not reversible.", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if (sAction === MessageBox.Action.OK) {
                                // POST call 
                                var oNewDeliverable = {
                                    deliverable: oValue
                                }
                                that.getView().setBusy(true);
                                var oModel = that.getView().getModel();
                                oModel.create("/opportunityDeliverablesVH", oNewDeliverable, {
                                    success: function (oData, response) {
                                        MessageToast.show("New deliverable posted!");
                                        //oDialog.close();
                                        that.onCancelDialogPress();
                                        oInput.setValue("");
                                        that.getView().setBusy(false);
                                    },
                                    error: function (oError) {
                                        that.getView().setBusy(false);
                                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                                        sap.m.MessageBox.error(sMessage);

                                    }
                                });
                                //}
                            } else {
                                oInput.setValue("");
                                that.getView().setBusy(false);
                            }
                        }
                    });
                } this.ValueStateMethod();
            },

            onSelectAllTopicsPress: function (oEvent) {
                sap.ui.getCore().byId("TopicFilters").getContent().forEach(function (oToggle) {
                    var bPressed = oToggle.getPressed();
                    oToggle.setPressed(!bPressed);
                });
            },
            onSelectAllDeliverablesPress: function (oEvent) {
                sap.ui.getCore().byId("DeliverablesFilters").getContent().forEach(function (oToggle) {
                    var bPressed = oToggle.getPressed();
                    oToggle.setPressed(!bPressed);
                });
            },


            onCRMCheckboxSelect: function (oEvent) {
                var oCheckBox = oEvent.getSource();
                var bSelected = oCheckBox.getSelected();
                var sText = bSelected ? "Yes" : "No";
                oCheckBox.setText(sText);
            },

         
            onToggleInCRM: function (oEvent) {
                var bPressed = oEvent.getSource().getPressed();
                var sValue = bPressed ? "Yes" : "No";
                oEvent.getSource().setText(sValue);

                var sFilterValue = bPressed ? "Yes" : "";
                var oFilter = new Filter("opportunityInCRM", FilterOperator.Contains, sFilterValue);
                var oTable = this.getView().byId("mainTable");
                oTable.getBinding("items").filter(oFilter);
            },


            onBeforeRebindActivitiesTable: function (oEvent) {

                var oBindingParams = oEvent.getParameter("bindingParams");
                var oFilter = new Filter("opptID_opportunityID", FilterOperator.EQ, this.sOpportunityID);
                oBindingParams.filters.push(oFilter);
                var oSorter = new sap.ui.model.Sorter("completed", true);
                oBindingParams.sorter.push(oSorter);

            },

            onActivityCompletedCheck: function (oEvent) {
                var bSelect = oEvent.mParameters.selected;
                var sPath = oEvent.getSource().getBindingContext().sPath;

                var sDeliverable = oEvent.getSource().getBindingContext().getObject().deliverable;
                var oModel = this.getView().getModel();
                var oPayload = {
                    completed: bSelect,
                    completedOn: new Date()
                }
                oModel.update(sPath, oPayload, {
                    success: function () {
                        if (bSelect == true) MessageToast.show("'" + sDeliverable + "' is completed");
                        if (bSelect !== true) MessageToast.show("'" + sDeliverable + "' is uncompleted");

                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        if (bSelect == true) MessageBox.error("'" + sDeliverable + "' could not be completed. Please try again. " + sMessage);
                        if (bSelect !== true) MessageBox.error("'" + sDeliverable + "' could not be marked as uncompleted. Please try again. " + sMessage);
                    }
                });


            },

            onBeforeRebindMaturityTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                var oFilter = new Filter("opptID_opportunityID", FilterOperator.EQ, this.sOpportunityID);
                oBindingParams.filters.push(oFilter);
                var oSorter = new sap.ui.model.Sorter("topic", true);
                oBindingParams.sorter.push(oSorter);
            },

            onAddActivityPress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddActivity");
            },

            onSubmitActivity: function (oEvent) {
                var that = this;
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                if (oData.deliverable) {
                    this.resetValueState();
                    this.sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                    var sDate, sCompletedOn;
                    var sCompleted = false;
                    if (oData.deliverableDate) sDate = new Date(oData.deliverableDate).toISOString().split("T")[0];
                    if (oData.completedOn) {
                        sCompletedOn = new Date(oData.completedOn).toISOString().split("T")[0];
                        sCompleted = true;
                    }
                    var oPayload = {
                        deliverable: oData.deliverable,
                        deliverableDate: sDate,
                        completed: sCompleted,
                        completedOn: sCompletedOn,
                        primaryContact: oData.primaryContact,
                        shortDescription: oData.shortDescription,
                        status: oData.status,
                        opptID_opportunityID: this.sOpportunityID
                    };

                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunityDeliverables", oPayload, {
                        success: function (oData, response) {
                            MessageToast.show("New activity added!");
                            that.getView().setBusy(false);
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


            onDeleteActivity: function (oEvent) {
                var that = this;
                var oItem = oEvent.mParameters.listItem;
                var sDeliverable = oItem.getBindingContext().getObject().deliverable;

                MessageBox.warning("Are you sure you want to delete the activity '" + sDeliverable + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            var sPath = oItem.getBindingContextPath();
                            that.getView().setBusy(true);
                            var oModel = that.getView().getModel();
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Activity has been deleted");
                                    that.getView().setBusy(false);
                                },
                                error: function (oError) {
                                    that.getView().setBusy(false);
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageToast.show(sMessage);
                                }
                            });
                        }
                    }
                });
            },

            /* ------------------------------------------------------------------------------------------------------------
COMMENTS
--------------------------------------------------------------------------------------------------------------*/


            onRatingChange: function (oEvent) {
                var sNewRating = oEvent.getParameters().value;
                var sPath = oEvent.getSource().getBindingContext().sPath;
                var sTopic = oEvent.getSource().getBindingContext().getObject().topic;
                var oModel = this.getView().getModel();
                var oPayload = {
                    maturity: sNewRating
                }
                oModel.update(sPath, oPayload, {
                    success: function () {
                        MessageToast.show("Maturity Rating for '" + sTopic + "' updated");

                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);
                    }
                });

            },

            onMaturityEdit: function (oEvent) {
                var oLocalModel = this.getView().getModel("localModel");
                this.maturityObject = oEvent.getSource().getBindingContext().getObject();
                oLocalModel.setData(this.maturityObject);
                this.maturityPath = oEvent.getSource().getBindingContext().sPath;
                this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditMaturity");
            },

            onSubmitMaturityComment: function (oEvent) {
                var that = this;
                var sPath = this.maturityPath;
                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();
                var sTopic = this.maturityObject.topic;

                var oModel = this.getView().getModel();
                var oPayload = {
                    comment: oData.comment
                }
                oModel.update(sPath, oPayload, {
                    success: function () {
                        MessageToast.show("Maturity Rating for '" + sTopic + "' updated");
                        oLocalModel.setData({});
                        that.onCancelDialogPress();
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });
            },

            onSelectLink: function (oEvent) {
                var sLink = oEvent.getSource().getBindingContext().getObject().link;
                library.URLHelper.redirect(sLink, true);
            },


            onEditActivityPress: function (oEvent) {
                var oLocalModel = this.getView().getModel("localModel");
                this.deliverableObject = oEvent.getSource().getBindingContext().getObject();
                oLocalModel.setData(this.deliverableObject);
                this.deliverablePath = oEvent.getSource().getBindingContext().sPath;
                this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditActivity");
            },

            onSubmitEditedActivity: function (oEvent) {
                var that = this;
                var sPath = this.deliverablePath;
                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();
                var sDeliverable = this.deliverableObject.deliverable;

                var oModel = this.getView().getModel();
                var oPayload = {
                    deliverable: oData.deliverable,
                    deliverableDate: oData.deliverableDate,
                    status: oData.status,
                    completed: oData.completed,
                    completedOn: oData.completedOn,
                    shortDescription: oData.shortDescription,
                    primaryContact: oData.primaryContact
                }
                oModel.update(sPath, oPayload, {
                    success: function () {
                        MessageToast.show("Activity '" + sDeliverable + "' updated");
                        oLocalModel.setData({});
                        that.onCancelDialogPress();

                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });
            },

            onAddNextStep: function (oEvent) {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddNextStep");
            },

            onSubmitNextStep: function (oEvent) {
                var that = this;
                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();

                this.sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                if (oData.nextStep) {
                    this.resetValueState();

                    var oPayload = {
                        nextStep: oData.nextStep,
                        nextStepDescription: oData.nextStepDescription,
                        completed: oData.completed,
                        postedOn: new Date(),
                        opptID_opportunityID: this.sOpportunityID
                    };

                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/opportunityNextSteps", oPayload, {
                        success: function (oData, response) {
                            MessageToast.show("Item added to Roadmap!");
                            that.getView().setBusy(false);
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

            onEditNextStep: function (oEvent) {
                var oLocalModel = this.getView().getModel("localModel");
                this.nextStepObject = oEvent.getSource().getBindingContext().getObject();
                oLocalModel.setData(this.nextStepObject);
                this.nextStepPath = oEvent.getSource().getBindingContext().sPath;
                this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditNextStep");
            },

            onSubmitEditedNextStep: function (oEvent) {
                var that = this;
                var sPath = this.nextStepPath;
                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();
                var sNextStep = this.nextStepObject.nextStep;
                if (oData.nextStep) {
                    this.resetValueState();
                    var oModel = this.getView().getModel();
                    var oPayload = {
                        nextStep: oData.nextStep,
                        nextStepDescription: oData.nextStepDescription,
                        completed: oData.completed,
                        //postedOn: new Date()
                    }
                    oModel.update(sPath, oPayload, {
                        success: function () {
                            MessageToast.show("Item '" + sNextStep + "' updated");
                            that.onCancelDialogPress();
                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });
                } else this.ValueStateMethod();
            },

            onDeleteNextStep: function (oEvent) {
                var that = this;
                var sPath = this.nextStepPath;

                MessageBox.warning("Are you sure you want to delete this item?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            that.getView().setBusy(true);
                            var oModel = that.getView().getModel();
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Item has been deleted from the roadmap");
                                    that.getView().setBusy(false);
                                    that.onCancelDialogPress();
                                },
                                error: function (oError) {
                                    that.getView().setBusy(false);
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageToast.show(sMessage);
                                }
                            });

                        }
                    }
                });


            },

            onHorizontalSwitch: function (oEvent) {
                var bState = oEvent.getParameters().state;
                if (bState == true) {
                    this.getView().byId("idTimeline").setAxisOrientation("Horizontal");
                } else {
                    this.getView().byId("idTimeline").setAxisOrientation("Vertical")
                }

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
                this.getOwnerComponent().getModel("global").setProperty("/layout", "OneColumn");

                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);

                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/columnsExpanded", true);
                oGlobalModel.setProperty("/filterbarExpanded", true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("OpportunityReport", {
                });

            },


        });
    });
