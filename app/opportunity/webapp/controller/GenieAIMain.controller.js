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
        var _bInitialLoad = true;


        return Controller.extend("opportunity.opportunity.controller.GenieAIMain", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("GenieAIMain").attachPatternMatched(this._onRoutePatternMatched, this);

                this.getView().setModel(new JSONModel({
                    "isFavorite": false
                }), "favModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                    "internal": false
                }), "viewModel");


                oView.setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");


                oView.setModel(new sap.ui.model.json.JSONModel({
                    // "countAll": 0,
                    // "countCustomer": 0,
                    // "countInternal": 0
                }), "genieModel");

            },

            _getText: function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
            },

            getGroupHeader: function (oGroup) {
                return new SeparatorItem({
                    text: oGroup.key
                });
            },

            getGenieCount: function () {
                var oModel = this.getView().getModel();
                var oGenieModel = this.getView().getModel("genieModel");
                var oEntitySet = "/GenieAIWorkshop";
                oModel.read(oEntitySet, {
                    success: function (oData) {


                        var countCustomer = oData.results.filter(function (item) {
                            return item.internal === false;
                        }).length;
                        var countInternal = oData.results.filter(function (item) {
                            return item.internal === true;
                        }).length;

                        oGenieModel.setProperty("/countAll", oData.results.length);
                        oGenieModel.setProperty("/countCustomer", countCustomer);
                        oGenieModel.setProperty("/countInternal", countInternal);

                    },
                    error: function (oError) {
                        console.error("Error reading entities: ", oError);
                    }
                });

            },

            _onRoutePatternMatched: function (oEvent) {
                this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", true);
                this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", true);

                this.getOwnerComponent().getModel("global").setProperty("/layout", "OneColumn");
                this.getView().byId("mySmartTable").rebindTable();
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "Genie AI");

                this.getGenieCount();
            },

            /* ------------------------------------------------------------------------------------------------------------
           TABLE
           --------------------------------------------------------------------------------------------------------------*/
            onSearch: function (oEvent) {
                var aFilters = [];

                // Get the selected key from the filter tab bar
                var sSelectedKey = this.byId("idIconTabBar").getSelectedKey();
                var bInternalValue = false;
                if (sSelectedKey === "Internal") bInternalValue = true;


                aFilters.push(new Filter({ path: "internal", operator: FilterOperator.EQ, value1: bInternalValue }));


                var sQuery = oEvent.getSource().getValue();
                if (sQuery && sQuery.length > 0) {
                    var aFilters = [
                        new Filter({
                            filters: [
                                new Filter({ path: "accountName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "contactName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "location", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                                new Filter({ path: "status", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false })
                            ],
                            and: false
                        })
                    ];
                }

                var oList = oEvent.getSource().getParent().getParent().getTable();
                var oBinding = oList.getBinding("items")
                oBinding.filter(aFilters, FilterType.Application);

            },

            /* ------------------------------------------------------------------------------------------------------------
            Object Page FCL Implementation
            --------------------------------------------------------------------------------------------------------------*/

            onListItemPress: function (oEvent) {
                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("GenieAIDetail", {
                    workshopID: selectedItem.workshopID,
                    layout: "TwoColumnsMidExpanded"
                });

                var userModel = this.getOwnerComponent().getModel("userModel");
                userModel.setProperty("/workshopID", selectedItem.workshopID);

            },
            /* ------------------------------------------------------------------------------------------------------------
            FCL Buttons
            --------------------------------------------------------------------------------------------------------------*/

            handleClose: function () {
                this.oFlexibleColumnLayout = this.byId("flexibleColumnLayout");
                this.oFlexibleColumnLayout.setLayout("OneColumn");

                this.byId("enterFullScreenBtn").setVisible(true);
                this.byId("exitFullScreenBtn").setVisible(false);

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

            onCreateGenieLead: function (oEvent) {
                this.resetValueState();
                var oController = this;
                oController.getView().setBusy(true);
                if (!this._oDialog) {
                    this._oDialog = Fragment.load({ name: "opportunity.opportunity.view.fragments.CreateGenieLead", controller: this });
                }
                this._oDialog.then(function (_oDialog) {
                    oController.getView().addDependent(_oDialog);
                    _oDialog.open();
                });
            },

            onSaveWizardPress: function (oEvent) {

                var that = this;
                var oViewModel = this.getView().getModel("viewModel");
                var oData = oViewModel.getData();

                if (oData.accountName) {
                    this.resetValueState();
                    that.getView().setBusy(true);

                    var sStartDate, sEndDate, bInternal, sTodayDate;

                    sTodayDate = new Date().toISOString().split("T")[0];
                    if (oData.opportunityStartDate) sStartDate = new Date(oData.workshopStartDate).toISOString().split("T")[0];
                    if (oData.opportunityDueDate) sEndDate = new Date(oData.workshopEndDate).toISOString().split("T")[0];

                    if (oData.internal) bInternal = true;
                    else bInternal = false;

                    var sStatus = sap.ui.getCore().byId("segmentedStatus").getSelectedKey();


                    oData.workshopStartDate = sStartDate;
                    oData.workshopEndDate = sEndDate;
                    oData.status = sStatus;
                    oData.isFavorite = false;
                    oData.internal = bInternal;


                    var oModel = this.getView().getModel();
                    oModel.create("/GenieAIWorkshop", oData, {
                        success: function (oData, response) {

                            MessageToast.show("New Genie AI Lead created!");
                            that.getGenieCount();
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


            onCloseWizardPress: function (oEvent) {
                var oCreateWizard = sap.ui.getCore().byId("myCreateWizard");
                oCreateWizard.close();
                var oDialog = sap.ui.getCore().byId("CreateWizard");
                oDialog.setCurrentStep("WizardStep1");
                this.getView().getModel("viewModel").setData({});
                this.getView().setBusy(false);
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
                sap.ui.getCore().byId("CreateWizard").previousStep();

            },


            /* ------------------------------------------------------------------------------------------------------------
            DELETE
            --------------------------------------------------------------------------------------------------------------*/


            onEditTable: function (oEvent) {
                var oSmartTable = oEvent.getSource().getParent().getParent().getTable();
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
                var that = this;
                var sLead = oEvent.mParameters.listItem.getBindingContext().getObject().accountName;
                var oSmartTable = oEvent.getSource().getParent().getTable();
                var sPath = oEvent.mParameters.listItem.getBindingContext().sPath
                var oModel = oSmartTable.getModel();
                sap.m.MessageBox.warning("Are you sure you want to delete the Genie AI Lead '" + sLead + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Item deleted successfully.");
                                    that.getGenieCount();
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




            // addFiltersForSelectedItems: function (oEvent, filterKey) {
            //     var oSmartFilterBar = this.getView().byId("smartFilterBar");
            //     var oBindingParams = oEvent.getParameter("bindingParams");
            //     var selectedItems = oSmartFilterBar.getControlByKey(filterKey)?.getSelectedItems() || [];
            //     selectedItems.forEach(function (oToken) {
            //         oBindingParams.filters.push(new Filter(filterKey, sap.ui.model.FilterOperator.EQ, oToken.getText()));
            //     })
            // },


            // onClearSmartFilterBar: function (oEvent) {
            //     var oSmartFilterBar = oEvent.getSource();
            //     oEvent.getParameters()[0].selectionSet.forEach(oSelect => {
            //         if (oSelect.removeAllSelectedItems) {
            //             oSelect.removeAllSelectedItems(true);

            //         }
            //     })
            //     oSmartFilterBar.getControlByKey("opportunityInCRM").setState(false);
            //     MessageToast.show("All Cleared!");

            // },


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



            /* ------------------------------------------------------------------------------------------------------------
            FAVOURITE
            --------------------------------------------------------------------------------------------------------------*/

            onFavoriteToolbarPress: function (oEvent) {
                var oBtn = oEvent.getSource();
                var sKey = this.getView().byId("idIconTabBar").getSelectedKey();
                var bInternal;
                if (sKey === "Internal") bInternal = true;
                else bInternal = false;


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
                                new Filter({ path: "internal", operator: FilterOperator.EQ, value1: bInternal, }),
                            ],
                            and: false
                        })
                    ];
                }
                var oList = oEvent.getSource().getParent().getParent().getTable();
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
                //post isFavorite 
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


            onFilterSelect: function (oEvent) {
                var sKey = oEvent.getParameter("key");
                var oTable = this.byId("mySmartTable").getTable(); // Get the inner table
                var oBinding = oTable.getBinding("items"); // Get the binding of the table
                var aFilters = [];

                if (sKey === "Internal") {
                    aFilters.push(new Filter("internal", FilterOperator.EQ, true));
                } else if (sKey === "Customer") {
                    aFilters.push(new Filter("internal", FilterOperator.EQ, false));
                } else aFilters = [];

                oBinding.filter(aFilters);
            },

            onBeforeRebindTableCustomer: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter("internal", sap.ui.model.FilterOperator.EQ, false));
            },

            onBeforeRebindTableInternal: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter("internal", sap.ui.model.FilterOperator.EQ, true));

            },



        });
    });
