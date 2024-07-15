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

        return Controller.extend("opportunity.opportunity.controller.GenieAIDetail", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("GenieAIDetail").attachPatternMatched(this._onRoutePatternMatched, this);

                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "pageModel");

                var oEditModel = new JSONModel({
                    editMode: false
                });
                this.getView().setModel(oEditModel, "editModel");


                var oEditPageModel = new JSONModel({});
                this.getView().setModel(oEditPageModel, "editPageModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                }), "viewModel");

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");

                oView.setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");

                oView.setModel(new sap.ui.model.json.JSONModel({
                    "countAll": 0,
                    "countCustomer": 0,
                    "countInternal": 0
                }), "genieModel");
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
            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();


                var sWorkshopID = oEvent.getParameter("arguments").workshopID || this.getOwnerComponent().getModel("userModel").getProperty("/workshopID");
                this.getOwnerComponent().getModel("userModel").setProperty("/workshopID", sWorkshopID);

                this.getView().bindElement({
                    path: "/GenieAIWorkshop/" + sWorkshopID,
                    parameters: {
                        expand: "links"
                    }
                });

                this.sWorkshopID = sWorkshopID;
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "Opportunities");
                oModel.setDefaultBindingMode("TwoWay");

                // wait for async calls 
                   Promise.all([
                // this.onFilterComments(sOpportunityID),
                this.onFilterLinkList(sWorkshopID),
                // this.onFilterNextSteps(sOpportunityID),
                // this.onReadModelData(sWorkshopID),
                // this.onSetLayout(),
                // this.onReadTopics(),
                // this.onReadDeliverables()
                  ]).then(() => {

                this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");
                this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", false);
                this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", false);
                  this.getGenieCount();

                // var oMaturityTable = this.getView().byId("maturityTableID");
                // if (oMaturityTable.isInitialised()) oMaturityTable.rebindTable();

                // var oActivitiesTable = this.getView().byId("activitiesTableID");
                // if (oActivitiesTable.isInitialised()) oActivitiesTable.rebindTable();

                // set segmented button text for current status of opportunity
                    this.setSegButtonText();
                }).catch(err => {
                    console.error("Error with route:", err);
                });
            },

            onFilterLinkList: function (sWorkshopID) {
                return new Promise((resolve, reject) => {
                    try {
                        var oTemplate = this.getView().byId("linkListItem");
                        var oSorter = new sap.ui.model.Sorter("linkName", true);
                        var oFilter = new Filter("linkID_workshopID", FilterOperator.EQ, sWorkshopID);
                        this.getView().byId("linkList").bindAggregation("items", {
                            template: oTemplate,
                            path: "/GenieAILinks",
                            sorter: oSorter,
                            filters: oFilter
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },


            // onReadModelData: function (sOppID) {
            //     return new Promise((resolve, reject) => {
            //         var oModel = this.getView().getModel();
            //         var sWorkshopID = sOppID || this.getView().getBindingContext().getObject().workshopID;
            //         var aFilters = [new Filter("workshopID", FilterOperator.EQ, sWorkshopID)];
            //         var oPageModel = this.getView().getModel("pageModel");

            //         oModel.read("/GenieAIWorkshop", {
            //             filters: aFilters,
            //             success: function (oResponse) {

            //                 resolve();
            //             }.bind(this),
            //             error: function (oError) {
            //                 console.log(oError);
            //                 reject(oError);
            //             }
            //         });
            //     });
            // },


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
                this.workshopID = this.getView().getBindingContext().getObject().workshopID;
                var sWorkshopID = this.workshopID;

                var oLocalModel = this.getView().getModel("localModel");
                var oData = oLocalModel.getData();

                if (oData.linkName && oData.link) {
                    this.resetValueState();

                    var oPayload = {
                        linkName: oData.linkName,
                        linkDescription: oData.linkDescription,
                        link: oData.link,
                        linkID_workshopID: this.workshopID
                    }
                    that.getView().setBusy(true);
                    var oModel = that.getView().getModel();
                    oModel.create("/GenieAILinks", oPayload, {
                        success: function (oData, response) {
                            MessageToast.show("New Link added!");
                            that.getView().setBusy(false);
                            //oDialog.close();
                            that.onCancelDialogPress();
                            //oLocalModel.setData({});
                            that.onFilterLinkList(sWorkshopID);
                        },
                        error: function (oError) {
                            that.getView().setBusy(false);
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);

                        }
                    });

                } else this.ValueStateMethod();

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
                                else oRouter.navTo("GenieAIMain");
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
                    else oRouter.navTo("GenieAIMain");
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
                var sDeletedAccount = oBindingContext.getObject("accountName");

                MessageBox.confirm("Do you want to delete this Genie AI Lead with " + sDeletedAccount + "?", function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("GenieAIMain");
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
                var oEditModel = this.getView().getModel("editModel");
                var oModel = this.getView().getModel();

                var oData = this.getView().getModel("editPageModel").getData();

                if (oData.accountName) {
                    this.resetValueState();
                    that.getView().setBusy(true);

                    var sStartDate, sEndDate, bInternal;

                    //sTodayDate = new Date().toISOString().split("T")[0];
                    if (oData.workshopStartDate) sStartDate = new Date(oData.workshopStartDate).toISOString().split("T")[0];
                    if (oData.workshopEndDate) sEndDate = new Date(oData.workshopEndDate).toISOString().split("T")[0];

                    if (oData.internal) bInternal = true;
                    else bInternal = false;

                    var sStatus = this.getView().byId("segmentedStatusObject").getSelectedKey();

                    oData.workshopStartDate = sStartDate;
                    oData.workshopEndDate = sEndDate;
                    oData.status = sStatus;
                    oData.isFavorite = false;
                    oData.internal = bInternal;
                    oData.notes = this.getView().byId("editRTE").getValue();
                    oData.status = this.getView().byId("segmentedStatusObject").getSelectedKey();
                   delete oData.links

                    var sPath = this.getView().getBindingContext().sPath;
                    oModel.update(sPath, oData, {
                        success: function () {
                            MessageToast.show("Changes saved successfully!");
                            oModel.refresh();
                            oEditModel.setProperty("/editMode", false);
                            //that.onReadModelData();
                            that.getView().setBusy(false);
                        },
                        error: function (oError) {
                            var sMessage = JSON.parse(oError.responseText).error.message.value;
                            sap.m.MessageBox.error(sMessage);
                            that.getView().setBusy(false);

                        }
                    });

                } else this.ValueStateMethod();

            },




            onToggleButtonPressed: function (oEvent) {
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

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
               // var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oLocalModel = this.getView().getModel("localModel");
                //oAddTaskModel.setData({});
                oLocalModel.setData({});

            },

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
                //post isFavorite 
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


            //checkbox
            // onCRMCheckboxSelect: function (oEvent) {
            //     this.onSetEditPageModel();
            //     var oEditModel = this.getView().getModel("editModel");
            //     var oEditPageModel = this.getView().getModel("editPageModel")
            //     var oCheckBox = oEvent.getSource();
            //     var bSelected = oCheckBox.getSelected();
            //     var sText = bSelected ? "Yes" : "No";
            //     oCheckBox.setText(sText);
            //     oEditModel.setProperty("/editMode", true);
            //     oEditPageModel.setProperty("/opportunityInCRM", sText);
            // },

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
                sap.ui.getCore().byId("CreateOpportunity").previousStep();

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
                oRouter.navTo("GenieAIMain", {
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

                    var sStatus = sap.ui.getCore().byId("segmentedStatusObject").getSelectedKey();


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

            onSelectLink: function (oEvent) {
                var sLink = oEvent.getSource().getBindingContext().getObject().link;
                library.URLHelper.redirect(sLink, true);
            },


        });
    });
