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
        var _this = this;
        var ValueState = CoreLibrary.ValueState,
        oValueState = {
            valueState: ValueState.None,
            valueStateText: ""
        };

        return Controller.extend("opportunity.opportunity.controller.ObjectPage", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched, this);

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


            },
            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var sOpportunityID = oEvent.getParameter("arguments").opportunityID;
                if (!sOpportunityID) var sOpportunityID = this.getOwnerComponent.getModel("userModel").getProperty("/opportunityID")
                this.getOwnerComponent().getModel("userModel").setProperty("/opportunityID", sOpportunityID);

                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "actionItems,comments,deliverables,links"
                    }
                });

                this.sOpportunityID = sOpportunityID;
                this.onFilterComments(sOpportunityID);
                this.onFilterLinkList(sOpportunityID);
                this.onFilterNextSteps(sOpportunityID);


                oModel.setDefaultBindingMode("TwoWay");
                //oModel read for tasks deep entity 
                this.onReadModelData(sOpportunityID);
                this.onSetLayout();
                // this.initRichTextEditor();

                var oMaturityTable = this.getView().byId("maturityTableID");
                if (oMaturityTable.isInitialised()) oMaturityTable.rebindTable();


                var oActivitiesTable = this.getView().byId("activitiesTableID");
                if (oActivitiesTable.isInitialised()) oActivitiesTable.rebindTable();

                this.onReadTopics();
                this.onReadDeliverables();
            },

            onFilterLinkList: function (sOpportunityID) {
                var oTemplate = this.getView().byId("linkListItem");
                var oSorter = new sap.ui.model.Sorter("linkName", true);
                var oFilter = new Filter("opptID_opportunityID", FilterOperator.EQ, sOpportunityID);
                this.getView().byId("linkList").bindAggregation("items", {
                    template: oTemplate,
                    path: "/opportunityLinks",
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

                if(oData.linkName && oData.link){
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

            }else this.ValueStateMethod(); 

            },

            // onBeforeRendering: function () {
            //     var that = this;
            //     sap.ui.require(["sap/ui/richtexteditor/RichTextEditor", "sap/ui/richtexteditor/library"],
            //         function (RTE, library) {
            //             //var EditorType = library.EditorType;
            //             that.oRichTextEditor = new RTE("myRTE", {
            //                 // editorType: bIsTinyMCE5 ? EditorType.TinyMCE5 : EditorType.TinyMCE6,
            //                 width: "100%",
            //                 value: "{noteText}",
            //                 height: "400px",
            //                 showGroupFont: true,
            //                 showGroupLink: true,
            //                 showGroupUndo: true,
            //                 editable: "{editModel>/editMode}",
            //                 id: "editRTE"

            //             });

            //             that.getView().byId("idSubSectionNotes").addBlock(that.oRichTextEditor);
            //             //that.oRichTextEditor.placeAt(that.getView().byId("idSubSectionNotes"))
            //         });
            // },

            // destroyRichTextEditor: function () {

            //    sap.ui.getCore().byId("editRTE").destroy(); 
            // },



            onTabItemSwitch: function (oEvent) {

                if (oEvent.mParameters.item) {
                    var sOpportunityID = oEvent.mParameters.item.getKey();
                    //this.getOwnerComponent.getModel("userModel").setProperty("/opportunityID", sOppt)

                } else var sOpportunityID = window.location.href.split('#')[1].split('/')[2];

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ObjectPage", {
                    opportunityID: sOpportunityID
                });
                sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched, this);

            },


            onPress: function (oEvent) {
                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TaskDetail", {
                    opportunityID: selectedItem.opportunityID
                });

            },

            onSetLayout: function () {

                var oLayout1 = this.getView().byId("TopicFiltersObject");
                var oTemplate1 = oLayout1.getBindingInfo("content").template;
                oLayout1.bindAggregation("content", {
                    path: '/opportunityTopicsVH',
                    template: oTemplate1,
                    sorter: new sap.ui.model.Sorter('topic', false)
                });
                // oLayout1.getBindingInfo('content').binding.refresh();

                var oLayout2 = this.getView().byId("DeliverablesFiltersObject");
                var oTemplate2 = oLayout2.getBindingInfo("content").template;
                oLayout2.bindAggregation("content", {
                    path: '/opportunityDeliverablesVH',
                    template: oTemplate2,
                    sorter: new sap.ui.model.Sorter('deliverable', false)
                });
                // oLayout2.getBindingInfo('content').binding.refresh();

            },

            onReadModelData: function (sOppID) {
                var oModel = this.getView().getModel();
                var sOpportunityID;
                if (sOppID) sOpportunityID = sOppID;
                else sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;

                var aFilters = [];
                aFilters.push(new Filter("opportunityID", FilterOperator.EQ, sOpportunityID));
                var oPageModel = this.getView().getModel("pageModel");
                oModel.read("/opportunityHeader", {
                    urlParameters: {
                        "$expand": "actionItems/subTasks,topics,deliverables,maturity"
                    },
                    filters: aFilters,
                    success: function (oResponse) {
                        var aTasks = oResponse.results[0].actionItems.results;
                        var aTopics = oResponse.results[0].topics.results;
                        var aDeliverables = oResponse.results[0].deliverables.results;
                        oPageModel.setProperty("/actionItems", aTasks);
                        oPageModel.setProperty("/topics", aTopics);
                        oPageModel.setProperty("/deliverables", aDeliverables);
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

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
                                else oRouter.navTo("MainReport");
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
                    else oRouter.navTo("MainReport");
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
                        oRouter.navTo("MainReport");
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
                if(oData.account && oData.marketUnit){

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

            },

            /* ------------------------------------------------------------------------------------------------------------
            DIALOG
            --------------------------------------------------------------------------------------------------------------*/


            onSubmitNewTask: function (oEvent) {

                var that = this;
                // var oDialog = oEvent.getSource().getParent().getParent();
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                if(oData.actionTask && oData.actionTitle){
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

            // onCreateRTE: function (fragmentName) {

            //     var that = this;
            //     if (!this._pRTE) {
            //         this._pRTE = Fragment.load({
            //             // id:"myDialog",
            //             name: fragmentName,
            //             controller: this
            //         }).then(function (_pRTE) {
            //             that.getView().addDependent(_pRTE);
            //             // _pRTE.setEscapeHandler(function () {
            //             //     that.onCloseDialog();
            //             // });
            //             return _pRTE;
            //         });
            //     }
            //     this._pRTE.then(function (_pRTE) {
            //         _pRTE.open();

            //     })
            // },

            // onCancelRTEPress: function (oEvent) {
            //     this._pRTE.then(function (_pRTE) {
            //         _pRTE.destroy();
            //     });
            //     this._pRTE = null;
            // },


            /* ------------------------------------------------------------------------------------------------------------
                 FAVORITE
                 --------------------------------------------------------------------------------------------------------------*/

            onFavoriteObjectPress: function (oEvent) {
                var that = this;
                var oView = this.getView();
                var oBinding = oView.getBindingContext();
                var sPath = oBinding.getPath();
                var oContext = oView.getBindingContext().getObject();

                var isFavorite = oContext.isFavorite;

                if (isFavorite === true) {
                    isFavorite = false;
                    // removeFavourite
                    that.postFavouriteCustomer(isFavorite, oContext, sPath);
                } else {
                    isFavorite = true;
                    // addFavourite
                    that.postFavouriteCustomer(isFavorite, oContext, sPath);
                }
            },

            postFavouriteCustomer: function (isFavorite, oContext, sPath) {
                //post isFavourite 
                var that = this;
                if (isFavorite === true) {
                    oContext.isFavorite = true;
                } else {
                    oContext.isFavorite = false;
                }

                var oPayload = { "isFavorite": oContext.isFavorite };

                var oModel = this.getView().getModel();
                oModel.update(sPath, oPayload, {
                    success: function () {
                        var sMessage = "";
                        if (isFavorite === true) {
                            sMessage = "'" + oContext.account + "' added to favorites";
                        } else {
                            sMessage = "'" + oContext.account + "' removed from favorites";
                        }
                        MessageToast.show(sMessage);
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageToast.show(sMessage);
                      }
                });

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

            onGridListItemPress: function (oEvent) {
                var selectedItem = oEvent.getSource().getBindingContext("pageModel").getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TaskDetail", {
                    ID: selectedItem.ID
                });
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

            onSearchTaskList: function (oEvent) {
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

                var oList = this.byId("gridList");
                var oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, FilterType.Application);

            },


            onGridListItemEdit: function (oEvent) {
                this._bEdit = true;
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddToDo");
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oEvent.getSource().getBindingContext("pageModel").getObject();
                if(oData.actionDueDate) oData.actionDueDate = new Date(oData.actionDueDate);
                oAddTaskModel.setData(oData);

            },

            onSubmitEditedTask: function () {
                var that = this;
                var oModel = this.getView().getModel();
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();
                var sGuid = oData.ID;
                var sDueDate; 

                var oPageModel = this.getView().getModel("pageModel");

                var sPriorityNumber;
                if (oData.actionPriority === 'High') sPriorityNumber = 1;
                else if (oData.actionPriority === 'Medium') sPriorityNumber = 2;
                else if (oData.actionPriority === 'Low') sPriorityNumber = 3;

                if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];

                var sUpdatedTask = {
                    actionDueDate: sDueDate,
                    actionOwner: oData.actionOwner,
                    actionPriority: oData.actionPriority,
                    actionPriorityNumber: sPriorityNumber,
                    actionProgress: oData.actionProgress,
                    actionTask: oData.actionTask,
                    actionTitle: oData.actionTitle,
                    actionTopic: oData.actionTopic
                }

                var sPath = "/opportunityActionItems(" + sGuid + ")";
                oModel.update(sPath, sUpdatedTask, {
                    success: function () {
                        MessageToast.show("Task updated successfully");
                        //close dialog
                        that.onCancelDialogPress();
                        oPageModel.updateBindings();
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);
                        
                    }
                });
            },

            onGridListItemDelete: function (oEvent) {
                var that = this;
                var oModel = this.getView().getModel();
                var oContext = oEvent.getParameters().listItem.getBindingContext("pageModel").getObject();
                MessageBox.warning("Are you sure you want to delete the Task '" + oContext.actionTitle + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {

                            that.getView().setBusy(true);
                            var sGuid = oContext.ID;
                            var sDeletePath = "/opportunityActionItems(" + sGuid + ")";

                            oModel.remove(sDeletePath, {
                                success: function (oData) {
                                    MessageToast.show("Task deleted");
                                    that.onReadModelData();
                                    that.getView().setBusy(false);
                                },
                                error: function (oError) {
                                    that.getView().setBusy(false);
                                }
                            });
                        }
                    }
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
            WIZARD
            --------------------------------------------------------------------------------------------------------------*/

            onWizardDialogPress: function (oEvent) {
                var oController = this;
                oController.getView().setBusy(true);
                if (!this._oDialog) {
                    this._oDialog = Fragment.load({ name: "opportunity.opportunity.view.fragments.WizardDialog", controller: this });
                }
                this._oDialog.then(function (_oDialog) {
                    oController.getView().addDependent(_oDialog);
                    _oDialog.open();

                    oController.onReadTopics();
                    oController.onReadDeliverables();

                    var oLayout1 = sap.ui.getCore().byId("TopicFilters");
                    var oTemplate1 = oLayout1.getBindingInfo("content").template;
                    oLayout1.bindAggregation("content", {
                        path: '/opportunityTopicsVH',
                        template: oTemplate1,
                        sorter: new sap.ui.model.Sorter('topic', false)
                    });
                    oLayout1.getBindingInfo('content').binding.refresh();

                    var oLayout2 = sap.ui.getCore().byId("DeliverablesFilters");
                    var oTemplate2 = oLayout2.getBindingInfo("content").template;
                    oLayout2.bindAggregation("content", {
                        path: '/opportunityDeliverablesVH',
                        template: oTemplate2,
                        sorter: new sap.ui.model.Sorter('deliverable', false)
                    });
                    oLayout2.getBindingInfo('content').binding.refresh();
                });
            },

            onSaveWizardPress: function (oEvent) {

                var that = this;
                that.getView().setBusy(true);
                var oViewModel = this.getView().getModel("viewModel");
                var oData = oViewModel.getData();

                var sDate, sDueDate, bCRM, sTodayDate;

                sTodayDate = new Date().toISOString().split("T")[0];
                if (oData.opportunityStartDate) sDate = new Date(oData.opportunityStartDate).toISOString().split("T")[0];
                if (oData.opportunityDueDate) sDueDate = new Date(oData.opportunityDueDate).toISOString().split("T")[0];

                if (oData.opportunityInCRM) bCRM = "Yes"
                else bCRM = "No"

                var sStatus = sap.ui.getCore().byId("segmentedStatus").getSelectedKey();

                var aTopics = [];
                var aTopicFilters = sap.ui.getCore().byId("TopicFilters").getContent();
                aTopicFilters.forEach(oItem => {
                    if (oItem.getPressed()) {
                        var oTopic = {
                            topic: oItem.getText()
                        };
                        aTopics.push(oTopic);
                    }
                });
                var aDeliverables = [];
                var aDeliverablesFilters = sap.ui.getCore().byId("DeliverablesFilters").getContent();
                aDeliverablesFilters.forEach(oItem => {
                    if (oItem.getPressed()) {
                        var oDeliverable = {
                            deliverable: oItem.getText()
                        };
                        aDeliverables.push(oDeliverable);
                    }
                })


                //add deliverable field to odata
                var oNewItem = {
                    account: oData.account,
                    topic: oData.topic,
                    marketUnit: oData.marketUnit,
                    opportunityStartDate: sDate,
                    opportunityStartDate: sDueDate,
                    opportunityValue: oData.opportunityValue,
                    opportunityInCRM: bCRM,
                    source: oData.source,
                    ssa: oData.ssa,
                    clientContactPerson: oData.clientContactPerson,
                    status: sStatus,
                    primaryContact: oData.primaryContact,
                    opportunityCreatedQuarter: oData.opportunityCreatedQuarter,
                    opportunityClosedQuarter: oData.opportunityClosedQuarter,
                    priority: oData.priority,
                    noteDate: sTodayDate,
                    noteText: oData.noteText,
                    progress: oData.progress,
                    topics: aTopics,
                    deliverables: aDeliverables
                };

                // 3. Use the `create` method of the OData model to create a new item in your service
                var oModel = this.getView().getModel();
                oModel.create("/opportunityHeader", oNewItem, {
                    success: function (oData, response) {

                        var oTabModel = that.getOwnerComponent().getModel("tabModel");
                        var aData = oTabModel.getData().tabs;
                        aData.push(oData);
                        oTabModel.setProperty("/tabs", aData);

                        MessageToast.show("New Opportunity created!");
                        that.onCloseWizardPress(oEvent);
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);
                        
                    }
                });

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

            onCloseWizardPress: function (oEvent) {
                var oWizardDialog = sap.ui.getCore().byId("myWizardDialog");
                oWizardDialog.close();
                var oDialog = sap.ui.getCore().byId("WizardDialog");
                oDialog.setCurrentStep("WizardStep1");
                this.getView().getModel("viewModel").setData({});
                this.getView().setBusy(false);
            },

            onCRMCheckboxSelect: function (oEvent) {
                var oCheckBox = oEvent.getSource();
                var bSelected = oCheckBox.getSelected();
                var sText = bSelected ? "Yes" : "No";
                oCheckBox.setText(sText);
            },

            onFullScreenButtonPress: function (oEvent) {
                var oDialog = oEvent.getSource().getParent().getParent();
                var pFullSize = oDialog.getContentWidth();
                if (pFullSize == "70%") {
                    oDialog.setContentWidth("100%");
                    oDialog.setContentHeight("100%");
                    oEvent.getSource().setIcon('sap-icon://exit-full-screen');

                } else {
                    oDialog.setContentWidth("70%");
                    oDialog.setContentHeight("80%");
                    oEvent.getSource().setIcon('sap-icon://full-screen');
                }
            },

            onPreviousStep: function (oEvent) {
                sap.ui.getCore().byId("WizardDialog").previousStep();

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

            onReadTopics: function () {
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
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });
            },
            onReadDeliverables: function () {
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
                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                        that.getView().setBusy(false);
                    }
                });
            },

            /* ------------------------------------------------------------------------------------------------------------
COMMENTS
   --------------------------------------------------------------------------------------------------------------*/


            onFilterComments(sOpportunityID) {
                var oList = this.getView().byId("opportunityComments")
                var commentTemp = this.getView().byId("commentItem");
                var oSorter = new sap.ui.model.Sorter("postedOn", true);

                var aCommentFilters = new Filter("opptID_opportunityID", FilterOperator.EQ, sOpportunityID);
                oList.bindAggregation("items", {
                    template: commentTemp,
                    path: "/opportunityComments",
                    sorter: oSorter,
                    filters: aCommentFilters
                });
                oList.updateBindings();

            },

            onPostComment: function (oEvent) {

                var that = this;
                var oValue = oEvent.mParameters.value;
                this.customerID = this.getView().getBindingContext().getObject().opportunityID;
                var sPostedBy = this.getOwnerComponent().getModel("user").getProperty("/firstname");


                var oPayload = {
                    comment: oValue,
                    postedBy: sPostedBy,
                    postedOn: UI5Date.getInstance(),
                    opptID_opportunityID: this.customerID
                }
                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/opportunityComments", oPayload, {
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

            onDeleteComment: function (oEvent) {
                var that = this;
                this.customerID = this.getView().getBindingContext().getObject().opportunityID;
                var sPath = oEvent.mParameters.listItem.getBindingContext().sPath;
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

                if(oData.deliverable){
                    this.resetValueState(); 

                this.sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                var sDate, sCompletedOn;
                var sCompleted = false; 
                if (oData.deliverableDate) sDate = new Date(oData.deliverableDate).toISOString().split("T")[0];
                if (oData.completedOn){
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

            }else this.ValueStateMethod(); 

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
                var oDialog = oEvent.getSource().getParent().getParent();
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

            onFilterNextSteps(sOpportunityID) {
                var oList = this.getView().byId("idTimeline")
                var commentTemp = this.getView().byId("timelineTasks");
                // var oSorter = new sap.ui.model.Sorter("postedOn", true);

                var aCommentFilters = new Filter("opptID_opportunityID", FilterOperator.EQ, sOpportunityID);
                oList.bindAggregation("content", {
                    template: commentTemp,
                    path: "/opportunityNextSteps",
                    //sorter: oSorter,
                    filters: aCommentFilters
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
                if(oData.nextStep){
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
            }else this.ValueStateMethod(); 

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
                if(oData.nextStep){
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
            }else this.ValueStateMethod(); 
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


            ValueStateMethod: function(oEvent){
                var oValueStateModel = this.getView().getModel("valueState"); 
                MessageToast.show("Please fill all mandatory fields");
                oValueStateModel.setProperty("/valueState", ValueState.Error);
                oValueStateModel.setProperty("/valueStateText", "This field is mandatory");

            },

            resetValueState: function(oEvent){
                var oValueStateModel = this.getView().getModel("valueState"); 
                oValueStateModel.setProperty("/valueState", ValueState.None);
                oValueStateModel.setProperty("/valueStateText", "");
            },

            onChangeValueState: function(oEvent){
                var sValue = oEvent.mParameters.newValue; 
                if(sValue) this.resetValueState(); 
            }

        });
    });
