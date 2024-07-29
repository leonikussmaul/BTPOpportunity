sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/ui/model/FilterType",
    "../model/formatter",
    "sap/ui/core/library",
    'sap/ui/core/SeparatorItem',
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, MessageToast, FilterType, formatter, CoreLibrary, SeparatorItem) {
        "use strict";
        var ValueState = CoreLibrary.ValueState,
            oValueState = {
                valueState: ValueState.None,
                valueStateText: ""
            };


        return Controller.extend("opportunity.opportunity.controller.OpportunityReport", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("OpportunityReport").attachPatternMatched(this._onRoutePatternMatched, this);

                this.getView().setModel(new JSONModel({
                    "isFavourite": false
                }), "favModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                    "progress": 0,
                    "adoption": 0,
                    "consumption": 0
                }), "viewModel");

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");

                oView.setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");
            },

            _getText: function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
            },

            getGroupHeader: function (oGroup) {
                return new SeparatorItem({
                    text: oGroup.key
                });
            },

            _onRoutePatternMatched: function (oEvent) {
                this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", true);
                this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", true);

                this.getOwnerComponent().getModel("global").setProperty("/layout", "OneColumn");
                this.getView().byId("mySmartTable").rebindTable();
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "Opportunities");
            },

            /* ------------------------------------------------------------------------------------------------------------
           TABLE
           --------------------------------------------------------------------------------------------------------------*/
            onSearch: function (oEvent) {
                var aFilters = [];
                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var aFilters = [
                        new Filter({
                            filters: [
                                new Filter({ path: "marketUnit", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "account", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "topic", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "status", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "primaryContact", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "ssa", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "opportunityClosedQuarter", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                            ],
                            and: false
                        })
                    ];
                }

                var oList = this.byId("mySmartTable").getTable();
                var oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, FilterType.Application);

            },

            /* ------------------------------------------------------------------------------------------------------------
            Object Page FCL Implementation
            --------------------------------------------------------------------------------------------------------------*/

            onListItemPress: function (oEvent) {
                var selectedItem = oEvent.getParameters().listItem.getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("OpportunityDetail", {
                    opportunityID: selectedItem.opportunityID,
                    layout: "TwoColumnsMidExpanded"
                });

                var userModel = this.getOwnerComponent().getModel("userModel");
                userModel.setProperty("/opportunityID", selectedItem.opportunityID);

            },
            /* ------------------------------------------------------------------------------------------------------------
            FCL Buttons
            --------------------------------------------------------------------------------------------------------------*/

            handleClose: function () {
                this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
                this.oFlexibleColumnLayout.setLayout("OneColumn");

                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);

                this.getView().byId("smartFilterBar").setVisible(true);
                this.getView().byId("mySmartTable").deactivateColumns();
            },

            handleFullScreen: function () {
                this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
                this.oFlexibleColumnLayout.setLayout("MidColumnFullScreen");

                this.byId("enterFullScreenBtn").setVisible(false);
                this.byId("exitFullScreenBtn").setVisible(true);
            },

            handleExitFullScreen: function () {
                this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
                this.oFlexibleColumnLayout.setLayout("TwoColumnsMidExpanded");

                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);
            },

            /* ------------------------------------------------------------------------------------------------------------
            WIZARD
            --------------------------------------------------------------------------------------------------------------*/

            onCreateOpportunityPress: function (oEvent) {
                this.resetValueState();
                var oController = this;
                oController.getView().setBusy(true);
                if (!this._oDialog) {
                    this._oDialog = Fragment.load({ name: "opportunity.opportunity.view.fragments.CreateOpportunity", controller: this });
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
                var oViewModel = this.getView().getModel("viewModel");
                var oData = oViewModel.getData();

                if (oData.account && oData.marketUnit) {
                    this.resetValueState();
                    that.getView().setBusy(true);

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

                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    const d = new Date();
                    var sMonth = monthNames[d.getMonth()];

                    var sAdoption = 0;
                    var sConsumption = 0;
                    var sProgress = 0;
                    if (oData.adoption) sAdoption = oData.adoption;
                    if (oData.consumption) sConsumption = oData.consumption;
                    if (oData.progress) sProgress = oData.progress;

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
                        progress: sProgress,
                        adoption: sAdoption,
                        consumption: sConsumption,
                        valueMonth: sMonth,
                        valueYear: new Date().getFullYear().toString(),
                        maturity: [{
                            topic: "Overall BTP Knowledge",
                        },
                        {
                            topic: "Integration",
                        }, {
                            topic: "Governance",
                        }, {
                            topic: "Extension",
                        }, {
                            topic: "Data",
                        }, {
                            topic: "Clean Core",
                        }, {
                            topic: "Automation / AI",
                        },
                        {
                            topic: "Analytics",
                        }],
                        topics: aTopics,
                        deliverables: aDeliverables
                    };

                    var oModel = this.getView().getModel();
                    oModel.create("/opportunityHeader", oNewItem, {
                        success: function (oData, response) {

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

                } else this.ValueStateMethod();

            },

            /* ------------------------------------------------------------------------------------------------------------
          ADD TOPIC
     --------------------------------------------------------------------------------------------------------------*/


            onSubmitTopic: function (oEvent) {
                var that = this;
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
                            } else {
                                oInput.setValue("");
                                that.getView().setBusy(false);
                            }
                        }
                    });
                } else this.ValueStateMethod();
            },

            onPostNewItem: function () {
                var that = this;
                var oPayload = {
                    marketUnit: "France"
                }
                var oModel = that.getView().getModel();
                oModel.create("/opportunityMarketUnitVH", oPayload, {
                    success: function (oData, response) {
                        MessageToast.show("New topic posted!");
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });

            },

            /* ------------------------------------------------------------------------------------------------------------
          ADD DELIVERABLE
     --------------------------------------------------------------------------------------------------------------*/

            onSubmitDeliverable: function (oEvent) {
                var that = this;
                var oInput = sap.ui.getCore().byId("deliverableInput");
                var oValue = oInput.getValue();

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
                            } else {
                                oInput.setValue("");
                                that.getView().setBusy(false);
                            }
                        }
                    });
                } else this.ValueStateMethod();
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
                var oCreateOpportunity = sap.ui.getCore().byId("myCreateOpportunity");
                oCreateOpportunity.close();
                var oDialog = sap.ui.getCore().byId("CreateOpportunity");
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

                var bPressed = oEvent.getSource().getPressed();
                if (bPressed) {
                    oDialog.setContentWidth("100%");
                    oDialog.setContentHeight("100%");
                    oEvent.getSource().setIcon('sap-icon://exit-full-screen');
                    sap.ui.getCore().byId("wizardRTE").setHeight("700px");

                } else {

                    oDialog.setContentWidth("1000px");
                    oDialog.setContentHeight("700px");
                    oEvent.getSource().setIcon('sap-icon://full-screen');
                    sap.ui.getCore().byId("wizardRTE").setHeight("350px");
                }


            },

            onPreviousStep: function (oEvent) {
                sap.ui.getCore().byId("CreateOpportunity").previousStep();

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


            /* ------------------------------------------------------------------------------------------------------------
            DELETE
            --------------------------------------------------------------------------------------------------------------*/


            onEditTable: function (oEvent) {
                var oSmartTable = this.getView().byId("mySmartTable").getTable();
                var oBtn = oEvent.getSource();
                var bToggle = oBtn.getPressed()
                if (bToggle) {
                    oBtn.setIcon('')
                    oBtn.setText("Cancel");
                    oSmartTable.setMode("Delete");
                } else {
                    oBtn.setIcon('sap-icon://edit')
                    oBtn.setText("Edit");
                    oSmartTable.setMode("None");
                }



            },
            onDeleteTableItem: function (oEvent) {
                var sAccount = oEvent.mParameters.listItem.getBindingContext().getObject().account;
                var oSmartTable = this.getView().byId("mySmartTable");
                var sPath = oEvent.mParameters.listItem.getBindingContext().sPath
                var oModel = oSmartTable.getModel();
                sap.m.MessageBox.warning("Are you sure you want to delete the opportunity '" + sAccount + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Item deleted successfully.");
                                },
                                error: function (oError) {
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageToast.show(sMessage);
                                }
                            });
                        }
                    }
                });
            },

            /* ------------------------------------------------------------------------------------------------------------
            SMARTFILTERBAR
            --------------------------------------------------------------------------------------------------------------*/
            onBeforeRebindTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                var oSmartFilterBar = this.getView().byId("smartFilterBar");

                var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader = oContext.getProperty("marketUnit");
                    return {
                        key: sHeader,
                    };
                };
                var oGrouping = new sap.ui.model.Sorter("marketUnit", true, fnGroupHeaderFormatter);
                oBindingParams.sorter.push(oGrouping);

                this.addFiltersForSelectedItems(oEvent, "marketUnit");
                this.addFiltersForSelectedItems(oEvent, "topic");
                this.addFiltersForSelectedItems(oEvent, "primaryContact");
                this.addFiltersForSelectedItems(oEvent, "status");
                this.addFiltersForSelectedItems(oEvent, "opportunityCreatedQuarter");
                this.addFiltersForSelectedItems(oEvent, "opportunityClosedQuarter");
                this.addFiltersForSelectedItems(oEvent, "priority");
                this.addFiltersForSelectedItems(oEvent, "ssa");

                // var oSwitch = oSmartFilterBar.getControlByKey("opportunityInCRM").getState();
                // var bSwitch = oSwitch ? "Yes" : "No";
                // if (bSwitch === "Yes") {
                //     oBindingParams.filters.push(new Filter("opportunityInCRM", sap.ui.model.FilterOperator.EQ, "Yes"));
                // }
            },

            addFiltersForSelectedItems: function (oEvent, filterKey) {
                var oSmartFilterBar = this.getView().byId("smartFilterBar");
                var oBindingParams = oEvent.getParameter("bindingParams");
                var selectedItems = oSmartFilterBar.getControlByKey(filterKey)?.getSelectedItems() || [];
                selectedItems.forEach(function (oToken) {
                    oBindingParams.filters.push(new Filter(filterKey, sap.ui.model.FilterOperator.EQ, oToken.getText()));
                })
            },


            onClearSmartFilterBar: function (oEvent) {
                var oSmartFilterBar = oEvent.getSource();
                oEvent.getParameters()[0].selectionSet.forEach(oSelect => {
                    if (oSelect.removeAllSelectedItems) {
                        oSelect.removeAllSelectedItems(true);

                    }
                })
                oSmartFilterBar.getControlByKey("opportunityInCRM").setState(false);
                MessageToast.show("All Cleared!");

            },


            /* ------------------------------------------------------------------------------------------------------------
                Dialogs
           --------------------------------------------------------------------------------------------------------------*/


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

            },

            onAddTopicPress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddTopic");
            },
            onAddDeliverablePress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddDeliverable");
            },



            /* ------------------------------------------------------------------------------------------------------------
            FAVOURITE
            --------------------------------------------------------------------------------------------------------------*/

            onFavoriteToolbarPress: function (oEvent) {
                var oBtn = oEvent.getSource();
                var bToggle = oBtn.getPressed()
                if (bToggle) {
                    oBtn.setIcon('sap-icon://favorite')
                } else oBtn.setIcon('sap-icon://unfavorite')

                var aFilters = [];
                var bFavorite = oEvent.getSource().getPressed();
                if (bFavorite) {
                    var aFilters = [
                        new Filter({
                            filters: [
                                new Filter({ path: "isFavorite", operator: FilterOperator.EQ, value1: true, }),
                            ],
                            and: false
                        })
                    ];
                }
                var oList = this.byId("mySmartTable").getTable();
                var oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, FilterType.Application);

            },

            onFavoritePress: function (oEvent) {
                var that = this;
                var oIcon = oEvent.getSource();
                var oBinding = oIcon.getBindingContext();
                var sPath = oBinding.getPath();
                var oContext = oIcon.getBindingContext().getObject();

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

                var oModel = this.getView().getModel();
                oModel.update(sPath, oContext, {
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



            onDeleteTopic: function () {

                var that = this;
                var oModel = this.getView().getModel();
                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/opportunitySubTaskStatus", oPayload, {
                    success: function (oData, response) {
                        MessageToast.show("New topic posted!");

                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);

                    }
                });
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


            onFavoriteValueDriverPress: function (oEvent) {
                var oController = this;
                var oIcon = oEvent.getSource();
                var userModel = this.getOwnerComponent().getModel("UserModel");

                var oBinding = oIcon.getBindingContext();
                var sPath = oBinding.getPath();
                var dataGoal = sap.ui.getCore().byId("GoalCatalogTable").getModel().getProperty(sPath);

                var isFavorite = dataGoal.isFavourite;
                var valueDriverID = dataGoal.valueDriverID;
                var valueDriverName = dataGoal.valueDriverDescription;
                var userID = userModel.getProperty("/username");

                if (isFavorite === true) {
                    console.log("Unfavorite");
                    isFavorite = false;
                    // removeFavourite
                    oController.postFavouriteValueDriver(valueDriverID, isFavorite, userID, valueDriverName);
                } else {
                    console.log("Favourite");
                    isFavorite = true;
                    // addFavourite
                    oController.postFavouriteValueDriver(valueDriverID, isFavorite, userID, valueDriverName);
                }
            },


            /* ------------------------------------------------------------------------------------------------------------
            EXPORT TO EXCEL
            --------------------------------------------------------------------------------------------------------------*/


            onBeforeExportOpportunities: function (oEvent) {
                var oWorkbook = oEvent.getParameter("exportSettings").workbook;
                
                // Find and remove the 'account' column if it already exists
                var accountColumnIndex = oWorkbook.columns.findIndex(function(column) {
                    return column.property === 'account';
                });
                if (accountColumnIndex !== -1) {
                    oWorkbook.columns.splice(accountColumnIndex, 1);
                }
            
                // Remove the first column
                delete oWorkbook.columns[0];
            
                // Add 'account' and 'marketUnit' columns at the beginning
                oWorkbook.columns.unshift({ property: 'marketUnit', label: "Market Unit" });
                oWorkbook.columns.unshift({ property: 'account', label: "Account", width: "30%" });
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
