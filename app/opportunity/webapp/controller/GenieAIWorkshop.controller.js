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

        return Controller.extend("opportunity.opportunity.controller.GenieAIWorkshop", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("GenieAIWorkshop").attachPatternMatched(this._onRoutePatternMatched, this);

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

            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var sWorkshopID = oEvent.getParameter("arguments").workshopID || this.getOwnerComponent().getModel("userModel").getProperty("/workshopID");
                var sType = oEvent.getParameter("arguments").workshopType;
                this.getOwnerComponent().getModel("userModel").setProperty("/workshopID", sWorkshopID);

                var sKey = oEvent.getParameters().arguments.type;
                this.getOwnerComponent().getModel("genieModel").setProperty("/genieType", sKey);

                this.getView().bindElement({
                    path: "/GenieAIWorkshops/" + sWorkshopID,
                    parameters: {
                        expand: "links,internalAttendees,customerAttendees,partnerAttendees"
                    }
                });

                this.sWorkshopID = sWorkshopID;
                var oGlobalModel = this.getOwnerComponent().getModel("global");
                oGlobalModel.setProperty("/selectedKey", "GenieAI");
                oModel.setDefaultBindingMode("TwoWay");

                // wait for async calls 
                Promise.all([
                    this.onFilterLinkList(sWorkshopID),
                    this.onFilterParticipants(sWorkshopID, sType),
                ]).then(() => {

                    this.getOwnerComponent().getModel("global").setProperty("/layout", "TwoColumnsMidExpanded");
                    this.getOwnerComponent().getModel("global").setProperty("/columnsExpanded", false);
                    this.getOwnerComponent().getModel("global").setProperty("/filterbarExpanded", false);
                    this.getGenieCount();
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
                            path: "/GenieAICustomerLinks",
                            sorter: oSorter,
                            filters: oFilter
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },


            onFilterParticipants: function (sWorkshopID, sType) {
                return new Promise((resolve, reject) => {
                    try {
                        var bindingPaths = {
                            "Internal": "/GenieAIInternal",
                            "Customer": "/GenieAICustomer",
                            "Partner": "/GenieAIPartner"
                        };
                        var sBindingPath = bindingPaths[sType];

                        var oTemplate = new sap.m.ColumnListItem({
                            type: "Active",
                            // press: this.onSelectParticipant.bind(this),
                            cells: [
                                new sap.m.Text({ text: "{name}" }),
                                new sap.m.Text({ text: "{type}" })
                            ]
                        });

                        var oSorter = new sap.ui.model.Sorter("name", false);
                        var oFilter = new sap.ui.model.Filter("ID_workshopID", sap.ui.model.FilterOperator.EQ, sWorkshopID);

                        this.getView().byId("participantTable").bindAggregation("items", {
                            path: sBindingPath,
                            template: oTemplate,
                            sorter: oSorter,
                            filters: oFilter
                        });
                        resolve();
                    } catch (error) {
                        reject(error);
                    }
                });
            },

            onDeleteParticipant: function (oEvent) {
                var that = this;
                var oBindingContext = oEvent.getParameter("listItem").getBindingContext();
                var sPath = oBindingContext.getPath();
                var sName = oBindingContext.getProperty("name");

                MessageBox.warning("Are you sure you want to remove the participant '" + sName + "'?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if (sAction === MessageBox.Action.OK) {
                            that.getView().setBusy(true);
                            var oModel = that.getView().getModel();
                            var oData = {
                                ID_workshopID: null
                            }
                            //  oData.ID_workshopID = null; 
                            oModel.update(sPath, oData, {
                                success: function () {
                                    // that.onCancelDialogPress();
                                    oModel.refresh();
                                    that.getView().setBusy(false);
                                    MessageToast.show("Participant removed successfully.");
                                },
                                error: function (oError) {
                                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                                    sap.m.MessageBox.error(sMessage);
                                    that.getView().setBusy(false);

                                }
                            });
                        }
                    }
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
            onAddParticipant: function (oEvent) {
                this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddParticipant");
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
                    oModel.create("/GenieAICustomerLinks", oPayload, {
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
            onSubmitNewParticipant: function (oEvent) {
                var that = this;
                var oData = this.getView().getModel("editPageModel").getData();
                var sKey = sap.ui.getCore().byId("segmentedWorkshopBtn").getSelectedKey();
                var oObject, sPath;

                this.getView().setBusy(true);

                switch (sKey) {
                    case "Internal":
                        oObject = sap.ui.getCore().byId("selectParticipant").getBindingContext().getObject();
                        oData.ID_workshopID = oObject.workshopID;
                        sPath = "/GenieAIInternal(guid'" + oData.workshopID + "')";
                        break;
                    case "Customer":
                        oObject = sap.ui.getCore().byId("selectCustomer").getBindingContext().getObject();
                        oData.ID_workshopID = oObject.workshopID;
                        sPath = "/GenieAICustomer(guid'" + oData.workshopID + "')";
                        break;
                    case "Partner":
                        oObject = sap.ui.getCore().byId("selectPartner").getBindingContext().getObject();
                        oData.ID_workshopID = oObject.workshopID;
                        sPath = "/GenieAIPartner(guid'" + oData.workshopID + "')";
                        break;
                }

                delete oData.ID;

                this.getView().getModel().update(sPath, oData, {
                    success: function () {
                        that.onCancelDialogPress();
                        that.getView().getModel().refresh();
                        that.getView().setBusy(false);
                        MessageToast.show("Participant has been added!");
                    },
                    error: function (oError) {
                        var sMessage = JSON.parse(oError.responseText).error.message.value;
                        sap.m.MessageBox.error(sMessage);
                        that.getView().setBusy(false);
                    }
                });
            },


            /* ------------------------------------------------------------------------------------------------------------
            DELETE
            --------------------------------------------------------------------------------------------------------------*/

            onDeleteObjectPress: function (oEvent) {
                var that = this;
                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath();
                var sDeletedAccount = oBindingContext.getObject("name");
                var sKey = this.getOwnerComponent().getModel("genieModel").getProperty("/genieType");

                MessageBox.confirm("Do you want to delete this Genie AI Lead with " + sDeletedAccount + "?", function (oAction) {
                    if (oAction === MessageBox.Action.OK) {
                        var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                        oRouter.navTo("GenieAIMain", {
                            type: sKey
                        });
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

                if (oData.name) {
                    this.resetValueState();
                    that.getView().setBusy(true);


                    var sStartDate, sEndDate, sTodayDate;
                    var workshopStartDate, workshopEndDate;

                    sTodayDate = new Date().toISOString().split("T")[0];
                    sStartDate = this.getView().byId("DRS3").getDateValue();
                    sEndDate = this.getView().byId("DRS3").getSecondDateValue();
                    if (sStartDate) workshopStartDate = new Date(sStartDate).toISOString().split("T")[0];
                    if (sEndDate) workshopEndDate = new Date(sEndDate).toISOString().split("T")[0];

                    const monthNames = ["January", "February", "March", "April", "May", "June",
                        "July", "August", "September", "October", "November", "December"
                    ];

                    var sMonth;
                    if (sStartDate) sMonth = monthNames[sStartDate.getMonth()];
                    // oData.country = this.getFlagMethod(oData.country.toUpperCase());
                    if (oData.country) oData.country = oData.country.toUpperCase();
                    oData.workshopStartDate = workshopStartDate;
                    oData.workshopEndDate = workshopEndDate;
                    oData.month = sMonth;
                    oData.notes = this.getView().byId("editRTE").getValue();
                    oData.status = this.getView().byId("segmentedStatusObject").getSelectedKey();
                    delete oData.links;
                    delete oData.__metadata;
                    delete oData.customerAttendees;
                    delete oData.internalAttendees;
                    delete oData.partnerAttendees;

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
                var oLocalModel = this.getView().getModel("localModel");
                oLocalModel.setData({});

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
                var sKey = this.getOwnerComponent().getModel("genieModel").getProperty("/genieType");
                oRouter.navTo("GenieAIMain", {
                    type: sKey
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
                        sEndPoint = "/GenieAIInternal";
                    } else if (sKey === "Customer") {
                        oData.internal = false;
                        sEndPoint = "/GenieAICustomer";
                        delete oData.functionalArea;
                        delete oData.orgArea;
                        delete oData.role;
                    } else if (sKey === "Partner") {
                        oData.internal = false;
                        sEndPoint = "/GenieAIPartner";
                        delete oData.functionalArea;
                        delete oData.orgArea;
                        delete oData.role;
                    }

                    sTodayDate = new Date().toISOString().split("T")[0];
                    if (oData.opportunityStartDate) sStartDate = new Date(oData.workshopStartDate).toISOString().split("T")[0];
                    if (oData.opportunityDueDate) sEndDate = new Date(oData.workshopEndDate).toISOString().split("T")[0];

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

            onSelectLink: function (oEvent) {
                var sLink = oEvent.getSource().getBindingContext().getObject().link;
                library.URLHelper.redirect(sLink, true);
            },

            onTypeSelectionChange: function (oEvent) {
                var sKey = oEvent.getParameters().item.getKey();
                if (sKey === "Customer") {
                    sap.ui.getCore().byId("selectCustomer").setVisible(true);
                    sap.ui.getCore().byId("selectParticipant").setVisible(false);
                    sap.ui.getCore().byId("selectPartner").setVisible(false);
                } else if (sKey === "Partner") {
                    sap.ui.getCore().byId("selectCustomer").setVisible(false);
                    sap.ui.getCore().byId("selectParticipant").setVisible(false);
                    sap.ui.getCore().byId("selectPartner").setVisible(true);
                } else if (sKey === "Internal") {
                    sap.ui.getCore().byId("selectCustomer").setVisible(false);
                    sap.ui.getCore().byId("selectParticipant").setVisible(true);
                    sap.ui.getCore().byId("selectPartner").setVisible(false);
                }

            },


            onBeforeRebindTable: function (oEvent) {

                var oBindingParams = oEvent.getParameter("bindingParams");
                var oSorter = new sap.ui.model.Sorter("name", false);
                oBindingParams.sorter.push(oSorter);

            },

        });
    });
