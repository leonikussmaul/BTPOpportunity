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
    "sap/ui/model/FilterType",
    "../model/formatter",
    "sap/ui/core/library"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, Sorter, Message, MessageToast, ValueState, FilterType, formatter, CoreLibrary) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oValueState = {
                valueState: ValueState.None,
                valueStateText: ""
            };


        return Controller.extend("opportunity.opportunity.controller.TasksReport", {
            formatter: formatter,
            onInit: function () {

                var AddTaskModel = new JSONModel({});
                this.getView().setModel(AddTaskModel, "AddTaskModel");

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("TasksReport").attachPatternMatched(this._onRoutePatternMatched, this);



                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "actionItemModel");

                this.getView().setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");

                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/columnsExpanded", true);
                oGlobalModel.setProperty("/filterbarExpanded", true);


            },

            onReadTasksData: function () {
                var that = this;
                var oModel = this.getView().getModel();
                var oActionItemModel = this.getView().getModel("actionItemModel");

                oModel.read("/opportunityActionItems", {
                    urlParameters: {
                        "$expand": "subTasks"
                    },
                    success: function (oResponse) {
                        var aTasks = oResponse.results;
                        var aAllSubTasks = [];
                        for (var i = 0; i < aTasks.length; i++) {
                            var oItem = aTasks[i].subTasks.results;
                            for (var j = 0; j < oItem.length; j++) {
                                aAllSubTasks.push(oItem[j]);
                            }
                        }

                        oActionItemModel.setProperty("/actionItems", aTasks);
                        oActionItemModel.setProperty("/subTasks", aAllSubTasks);
                        that.getView().byId("myTaskTable").rebindTable();
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

            },

            _onRoutePatternMatched: function (oEvent) {

                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/layout", "OneColumn");
                oGlobalModel.setProperty("/columnsExpanded", true);
                oGlobalModel.setProperty("/filterbarExpanded", true);
                oGlobalModel.setProperty("/selectedKey", "Tasks");

                this.onReadTasksData();
                this.getView().byId("myTaskTable").rebindTable();

            },


            onBeforeRebindTaskTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");

                var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader;
                    // if(oContext.getProperty("actionPriorityNumber") != null){
                    sHeader = oContext.getProperty("actionCustomer");
                    // }
                    return {
                        key: sHeader,
                    };
                };
                var oGrouping = new sap.ui.model.Sorter("actionCustomer", false, fnGroupHeaderFormatter);
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
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                                var sPath = aSelectedItems[i].getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function () {
                                        sap.m.MessageToast.show("Task deleted successfully.");
                                    },
                                    error: function (oError) {
                                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                                        sap.m.MessageToast.show(sMessage);
                                    }
                                });
                            }
                        }
                    }
                });
            },


            onAddToDoTablePress: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddToDoTask");

            },
            onSubmitNewTask: function (oEvent) {
                var that = this;
                //var oDialog = oEvent.getSource().getParent().getParent(); 
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                var oSelected = sap.ui.getCore().byId("accountComboBox").getSelectedItem();
                if (oSelected) {

                    if (oData.actionTask && oData.actionTitle) {
                        var sCustomer = oSelected.getText();
                        this.resetValueState();

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
                            opptID_opportunityID: oData.account
                        };

                        var sPath = "/opportunityActionItems";

                        var oModel = this.getView().getModel();
                        oModel.create(sPath, oNewTask, {
                            success: function (oData, response) {
                                MessageToast.show("New Task created!");
                                // oDialog.close(); 
                                that.onCancelDialogPress();
                            },
                            error: function (oError) {
                                var sMessage = JSON.parse(oError.responseText).error.message.value;
                                sap.m.MessageBox.error(sMessage);

                            }
                        });
                    } else this.ValueStateMethod();
                } else MessageToast.show("You have to select an account to link the task to first")
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
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                oAddTaskModel.setData({});

            },



            onListItemPress: function (oEvent) {
                //  this.getView().byId("flexibleColumnLayout").setLayout("TwoColumnsMidExpanded");
                this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");

                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TaskDetail", {
                    ID: selectedItem.ID,
                    layout: "TwoColumnsMidExpanded"
                });

                this.handleVisibilityForFCL();
            },

            handleVisibilityForFCL: function () {
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/columnsExpanded", false);
                oGlobalModel.setProperty("/filterbarExpanded", false);

            },

            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var aFilters = [
                        new Filter({
                            filters: [
                                new Filter({ path: "actionTitle", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "actionTask", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "actionCustomer", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "actionTopic", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "actionOwner", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),


                            ],
                            and: false
                        })
                    ];
                }

                var oList = this.byId("myTaskTable").getTable();
                var oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, FilterType.Application);

            },


            onPopoverPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView(),
                    iIndex = oEvent.getSource().getBindingContext().sPath;

                this._pPopover = Fragment.load({
                    id: oView.getId(),
                    name: "opportunity.opportunity.view.fragments.taskPopover.TaskPopover",
                    controller: this
                }).then(function (oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.bindElement({
                        path: iIndex,
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


            /* ------------------------------------------------------------------------------------------------------------
            EXPORT TO EXCEL
            --------------------------------------------------------------------------------------------------------------*/


            onBeforeExportTasks: function (oEvent) {

                //var oi18nModel = this.getView().getModel("i18n")
                var oWorkbook = oEvent.getParameter("exportSettings").workbook;
                oWorkbook.columns.unshift({ property: 'actionPriority', label: "Priority" })

                //change col order
                // var oFavouriteCol = oWorkbook.columns[1]
                // var oValueDriverCol = oWorkbook.columns[2]
                oWorkbook.columns[5].label = "Progress"
                // oWorkbook.columns[2] = oFavouriteCol;

                // //customization 
                // oWorkbook.context.sheetName = "Business Goals and Value Drivers"
                // oWorkbook.columns[0].width = "40%";
                // oWorkbook.columns[1].width = "50%";

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
            }



        });
    });
