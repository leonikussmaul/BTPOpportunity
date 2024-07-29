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


        return Controller.extend("opportunity.opportunity.controller.GenieAIMain", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("GenieAIMain").attachPatternMatched(this._onRoutePatternMatched, this);

                this.getView().setModel(new JSONModel({
                    "isFavorite": false
                }), "favModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                    //"internal": false
                }), "viewModel");

                oView.setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");


            },

            getGroupHeader: function (oGroup) {
                return new SeparatorItem({
                    text: oGroup.key
                });
            },

            getGenieCount: function () {
                var oModel = this.getView().getModel();
                var oGenieModel = this.getOwnerComponent().getModel("genieModel");

                var aEndpoints = [
                    { key: "Workshops", endpoint: "/GenieAIWorkshops" },
                    { key: "Customer", endpoint: "/GenieAICustomer" },
                    { key: "Internal", endpoint: "/GenieAIInternal" },
                    { key: "Partner", endpoint: "/GenieAIPartner" }
                ];

                var aPromises = aEndpoints.map(function (oEndpoint) {
                    return new Promise(function (resolve, reject) {
                        oModel.read(oEndpoint.endpoint, {
                            success: function (oData) {
                                resolve({ key: oEndpoint.key, data: oData });
                            },
                            error: function (oError) {
                                reject(oError);
                            }
                        });
                    });
                });

                Promise.all(aPromises).then(function (aResults) {
                    aResults.forEach(function (oResult) {
                        oGenieModel.setProperty("/" + oResult.key, oResult.data.results.length);
                    });
                }).catch(function (oError) {
                    console.error("Error reading entities: ", oError);
                });
            },


            _onRoutePatternMatched: function (oEvent) {
                this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", true);
                this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", true);

                this.getOwnerComponent().getModel("global").setProperty("/layout", "OneColumn");
                this.getView().byId("mySmartTable").rebindTable();
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "GenieAI");

                var sKey = oEvent.getParameters().arguments.type;
                this.getOwnerComponent().getModel("genieModel").setProperty("/genieType", sKey);
                this.getView().byId("idIconTabBar").setSelectedKey(sKey);

                this.getGenieCount();
            },

            /* ------------------------------------------------------------------------------------------------------------
           TABLE
           --------------------------------------------------------------------------------------------------------------*/


            onSearch: function (oEvent) {
                var sQuery = oEvent.getSource().getValue();
                var aFilters = [];

                if (sQuery) {
                    aFilters = [
                        new Filter({ path: "name", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                        new Filter({ path: "city", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                        new Filter({ path: "country", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                        new Filter({ path: "status", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false })
                    ];

                    aFilters = [new Filter({ filters: aFilters, and: false })];
                }

                var oList = oEvent.getSource().getParent().getParent().getTable();
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters, FilterType.Application);
            },



            /* ------------------------------------------------------------------------------------------------------------
            Object Page FCL Implementation
            --------------------------------------------------------------------------------------------------------------*/

            onListItemPress: function (oEvent) {
                var selectedItem = oEvent.getParameters().listItem.getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var sKey = this.getView().byId("idIconTabBar").getSelectedKey();
                this.getOwnerComponent().getModel("genieModel").setProperty("/genieType", sKey);
                var sView; 
                if (sKey === "Workshops") {
                    sView = "GenieAIWorkshop";
                    oRouter.navTo(sView, {
                        type: sKey,
                        workshopType: oEvent.getParameters().listItem.getBindingContext().getObject().workshopType,
                        workshopID: selectedItem.workshopID,
                        layout: "TwoColumnsMidExpanded"
                    });
                }
                else {
                    sView = "GenieAIDetail";
                    oRouter.navTo(sView, {
                        type: sKey,
                        workshopID: selectedItem.workshopID,
                        layout: "TwoColumnsMidExpanded"
                    });
                }

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

            onCreateNewWorkshop: function (oEvent) {
                this.resetValueState();
                var oController = this;
                oController.getView().setBusy(true);
                if (!this._oDialog) {
                    this._oDialog = Fragment.load({ name: "opportunity.opportunity.view.fragments.CreateGenieWorkshop", controller: this });
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

                if (oData.name) {
                    this.resetValueState();
                    that.getView().setBusy(true);

                    var sEndPoint, sStartDate, sEndDate, bInternal, sTodayDate;

                    var sKey = sap.ui.getCore().byId("segmentedWorkshopBtn").getSelectedKey();
                    if (sKey === "Internal") {
                        oData.internal = true;
                        oData.type = "Internal"
                        sEndPoint = "/GenieAIInternal";
                    } else if (sKey === "Customer") {
                        oData.internal = false;
                        sEndPoint = "/GenieAICustomer";
                        oData.type = "Customer"
                        delete oData.functionalArea;
                        delete oData.orgArea;
                        delete oData.role;
                    } else if (sKey === "Partner") {
                        oData.internal = false;
                        oData.type = "Partner"
                        sEndPoint = "/GenieAIPartner";
                        delete oData.functionalArea;
                        delete oData.orgArea;
                        delete oData.role;
                    }

                    sTodayDate = new Date().toISOString().split("T")[0];
                    if (oData.workshopStartDate) sStartDate = new Date(oData.workshopStartDate).toISOString().split("T")[0];
                    if (oData.workshopEndDate) sEndDate = new Date(oData.workshopEndDate).toISOString().split("T")[0];

                    var sStatus = sap.ui.getCore().byId("segmentedStatus").getSelectedKey();

                    if (oData.country) oData.country = oData.country.toUpperCase();
                    oData.workshopStartDate = sStartDate;
                    oData.workshopEndDate = sEndDate;
                    oData.status = sStatus;
                    oData.isFavorite = false;
                    oData.internal = bInternal;

                    var oModel = this.getView().getModel();
                    //need to select which one to post to 
                    oModel.create(sEndPoint, oData, {
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

            onSaveGeniePress: function (oEvent) {
                var that = this;
                var oViewModel = this.getView().getModel("viewModel");
                var oData = oViewModel.getData();

                if (oData.name) {
                    this.resetValueState();
                    that.getView().setBusy(true);

                    var sStartDate, sEndDate, sTodayDate;

                    var sKey = sap.ui.getCore().byId("segmentedWorkshopBtn").getSelectedKey();
                    if (sKey === "Internal") {
                        oData.workshopType = "Internal"
                    } else if (sKey === "Customer") {
                        oData.workshopType = "Customer";
                    } else if (sKey === "Partner") {
                        oData.workshopType = "Partner"
                    }

                    sTodayDate = new Date().toISOString().split("T")[0];
                    if (oData.workshopStartDate) sStartDate = new Date(oData.workshopStartDate).toISOString().split("T")[0];
                    if (oData.workshopEndDate) sEndDate = new Date(oData.workshopEndDate).toISOString().split("T")[0];

                    var sStatus = sap.ui.getCore().byId("segmentedStatus").getSelectedKey();

                    if (oData.country) oData.country = oData.country.toUpperCase();
                    oData.workshopStartDate = sStartDate;
                    oData.workshopEndDate = sEndDate;
                    oData.status = sStatus;

                    //  delete oData.internal;
                    var oModel = this.getView().getModel();
                    oModel.create("/GenieAIWorkshops", oData, {
                        success: function (oData, response) {
                            MessageToast.show("New Genie AI Workshop created!");
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
                var sLead = oEvent.mParameters.listItem.getBindingContext().getObject().name;
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
                var bToggle = oBtn.getPressed();

                if (bToggle) {
                    oBtn.setIcon('sap-icon://favorite');
                } else {
                    oBtn.setIcon('sap-icon://unfavorite');
                }

                var aFilters = [];

                if (bToggle) {
                    aFilters.push(new sap.ui.model.Filter({
                        path: "isFavorite",
                        operator: sap.ui.model.FilterOperator.EQ,
                        value1: true
                    }));
                }

                var oList = oEvent.getSource().getParent().getParent().getTable();
                var oBinding = oList.getBinding("items");
                oBinding.filter(aFilters);
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

            // postFavouriteCustomer: function (isFavorite, oContext, sPath) {
            //     //post isFavorite 
            //     if (isFavorite === true) {
            //         oContext.isFavorite = true;
            //     } else {
            //         oContext.isFavorite = false;
            //     }
            //     delete oContext.links;
            //     delete oContext.__metadata;

            //     var oModel = this.getView().getModel();
            //     oModel.update(sPath, oContext, {
            //         success: function () {
            //             var sMessage = "";
            //             if (isFavorite === true) {
            //                 sMessage = "'" + oContext.name + "' added to favorites";
            //             } else {
            //                 sMessage = "'" + oContext.name + "' removed from favorites";
            //             }
            //             MessageToast.show(sMessage);
            //         },
            //         error: function (oError) {
            //             var sMessage = JSON.parse(oError.responseText).error.message.value;
            //             sap.m.MessageToast.show(sMessage);
            //         }
            //     });
            // },

            postFavouriteCustomer: function (isFavorite, oContext, sPath) {
                var oModel = this.getView().getModel();
                var sMessage = "'" + oContext.name + (isFavorite ? "' added to favorites" : "' removed from favorites");

                oModel.update(sPath, { "isFavorite": isFavorite }, {
                    success: function () {
                        sap.m.MessageToast.show(sMessage);
                    },
                    error: function (oError) {
                        var sErrorMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageToast.show(sErrorMessage);
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
                this.getOwnerComponent().getModel("genieModel").setProperty("/genieType", sKey);
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("GenieAIMain", {
                    type: sKey
                });
            },

            onBeforeExport: function (oEvent) {

                var oWorkbook = oEvent.getParameter("exportSettings").workbook;
                delete oWorkbook.columns[0];


            },



            onBeforeRebindTable: function (oEvent) {

                var oBindingParams = oEvent.getParameter("bindingParams");

                var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader = oContext.getProperty("status");
                    return {
                        key: sHeader,
                    };
                };
                var oGrouping = new sap.ui.model.Sorter("status", true, fnGroupHeaderFormatter);
                oBindingParams.sorter.push(oGrouping);

               
                var oSorter = new sap.ui.model.Sorter("name", false);
                oBindingParams.sorter.push(oSorter);

            },


        });
    });
