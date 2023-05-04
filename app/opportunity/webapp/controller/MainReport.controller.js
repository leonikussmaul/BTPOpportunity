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


        return Controller.extend("opportunity.opportunity.controller.MainReport", {
            formatter: formatter,
            onInit: function () {

                this.getView().setModel(new JSONModel({
                    "isFavourite": false
                }), "favModel");
                var oFavModel = this.getView().getModel("favModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                }), "viewModel");

                // var aDeliverables = [
                //     { "deliverable": "BTP Adoption Class" },
                //     { "deliverable": "BTP AD&A" },
                //     { "deliverable": "BTP Masterclass" }
                // ];
                // oView.setModel(new sap.ui.model.json.JSONModel({
                //     "deliverables": aDeliverables
                // }), "deliverableModel");

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");
            },

            _getText: function (sTextId, aArgs) {
                return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);

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


            onListItemPress: function (oEvent) {

                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("ObjectPage", {
                    opportunityID: selectedItem.opportunityID
                });
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

                // var sTopic, sDeliverable;
                // //push into array once deep create supported
                // sap.ui.getCore().byId("TopicFilters").getContent().forEach(oBtn => {
                //     if (oBtn.getPressed()) sTopic = oBtn.getText();
                // });
                // sap.ui.getCore().byId("DeliverablesFilters").getContent().forEach(oBtn => {
                //     if (oBtn.getPressed()) sDeliverable = oBtn.getText();
                // });

                var sStatus = sap.ui.getCore().byId("segmentedStatus").getSelectedKey();

                var aTopics = [];
                var aTopicFilters = sap.ui.getCore().byId("TopicFilters").getContent(); 
                aTopicFilters.forEach(oItem =>{
                    if (oItem.getPressed()) {
                        var oTopic = {
                            topic: oItem.getText()
                        };
                        aTopics.push(oTopic);
                    }
                });
                var aDeliverables = [];
                var aDeliverablesFilters = sap.ui.getCore().byId("DeliverablesFilters").getContent(); 
                aDeliverablesFilters.forEach(oItem =>{
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
                    actionItems: [{
                        actionDueDate: sTodayDate,
                        actionOwner: oData.primaryContact,
                        actionProgress: oData.progress,
                        actionTopic: oData.topic,
                        actionTask: oData.account
                    }],
                    topics: aTopics,
                    deliverables: aDeliverables
                };

                // 3. Use the `create` method of the OData model to create a new item in your service
                var oModel = this.getView().getModel();
                oModel.create("/opportunityHeader", oNewItem, {
                    success: function (oData, response) {

                        MessageToast.show("New Opportunity created!");
                        that.onCloseWizardPress(oEvent);
                        that.getView().setBusy(false);
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        sap.m.MessageBox.error("Opportunity could not be created. Double check your input.");
                    }
                });

            },

                  /* ------------------------------------------------------------------------------------------------------------
                ADD TOPIC
           --------------------------------------------------------------------------------------------------------------*/


            onSubmitTopic: function (oEvent) {
                var that = this;
                var oDialog = sap.ui.getCore().byId("topicDialog");
                var oInput = sap.ui.getCore().byId("topicInput");
                var oValue = oInput.getValue();
                var aTopics = this.getView().getModel("localModel").getData().topics;

                if (oValue != "" && oInput != null) {
                    MessageBox.warning("Are you sure you want to post the topic " + oValue + " to the DataBase? This action is not reversible.", {
                        actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {
                            if(sAction === MessageBox.Action.OK){
                            var isMatch = aTopics.some(oItem => {
                                return oItem.topic.toUpperCase() === oValue.toUpperCase();
                            });
                            // if (isMatch) {
                            //     //prevent POST call 
                            //     MessageBox.error("This topic already exists!");
                            //     oInput.setValue("");
                            //     oDialog.close();
                            // }else {
                                // POST call 
                                var oNewTopic = {
                                    topic: oValue
                                }
                                that.getView().setBusy(true);
                                var oModel = that.getView().getModel();
                                oModel.create("/opportunityTopicsVH", oNewTopic, {
                                    success: function (oData, response) {
                                        MessageToast.show("New topic posted!");
                                        oDialog.close();
                                        oInput.setValue("");
                                        that.getView().setBusy(false);
                                    },
                                    error: function (oError) {
                                        that.getView().setBusy(false);
                                        MessageBox.error("Topic could not be posted. Please check your input.");
                                    }
                                });
                            //}
                        } else{
                            oInput.setValue("");
                            that.getView().setBusy(false);
                        }
                        }
                    });
                } else MessageToast.show("Enter a new topic first");
            },

                  /* ------------------------------------------------------------------------------------------------------------
                ADD DELIVERABLE
           --------------------------------------------------------------------------------------------------------------*/

           onSubmitDeliverable: function (oEvent) {
            var that = this;
            var oDialog = sap.ui.getCore().byId("deliverableDialog");
            var oInput = sap.ui.getCore().byId("deliverableInput");
            var oValue = oInput.getValue();
            var aDeliverables = this.getView().getModel("localModel").getData().deliverables;

            if (oValue != "" && oInput != null) {
                MessageBox.warning("Are you sure you want to post the deliverable " + oValue + " to the DataBase? This action is not reversible.", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction === MessageBox.Action.OK){
                        // var isMatch = aDeliverables.some(oItem => {
                        //     return oItem.deliverable.toUpperCase() === oValue.toUpperCase();
                        // });
                        // if (isMatch) {
                        //     //prevent POST call 
                        //     MessageBox.error("This deliverable already exists!");
                        //     oInput.setValue("");
                        //     oDialog.close();
                        // }else {
                            // POST call 
                            var oNewDeliverable = {
                                deliverable: oValue
                            }
                            that.getView().setBusy(true);
                            var oModel = that.getView().getModel();
                            oModel.create("/opportunityDeliverablesVH", oNewDeliverable, {
                                success: function (oData, response) {
                                    MessageToast.show("New deliverable posted!");
                                    oDialog.close();
                                    oInput.setValue("");
                                    that.getView().setBusy(false);
                                },
                                error: function (oError) {
                                    that.getView().setBusy(false);
                                    MessageBox.error("Deliverable could not be posted. Please check your input.");
                                }
                            });
                        //}
                    } else{
                        oInput.setValue("");
                        that.getView().setBusy(false);
                    }
                    }
                });
            } else MessageToast.show("Enter a new deliverable first");
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
                    oDialog.setContentHeight("70%");
                    oEvent.getSource().setIcon('sap-icon://full-screen');
                }
            },

            onPreviousStep: function (oEvent) {
                sap.ui.getCore().byId("WizardDialog").previousStep();

            },

            // onNextStep: function(oEvent){
            //     sap.ui.getCore().byId("WizardDialog").nextStep(); 
            // },

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

            onDeleteTableItem: function (oEvent) {
                var oSmartTable = this.getView().byId("mySmartTable");
                var aSelectedItems = oSmartTable.getTable().getSelectedItems();

                if (aSelectedItems.length === 0) {
                    sap.m.MessageToast.show("Select at least one item to delete");
                    return;
                }
                var oModel = oSmartTable.getModel();
                sap.m.MessageBox.warning("Are you sure you want to delete the selected items?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                                var sPath = aSelectedItems[i].getBindingContext().getPath();
                                oModel.remove(sPath, {
                                    success: function () {
                                        sap.m.MessageToast.show("Item deleted successfully.");
                                    },
                                    error: function () {
                                        sap.m.MessageToast.show("Failed to delete item.");
                                    }
                                });
                            }
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
              
                var oSwitch = oSmartFilterBar.getControlByKey("opportunityInCRM").getState();
                var bSwitch = oSwitch ? "Yes" : "No";
                if (bSwitch === "Yes") {
                  oBindingParams.filters.push(new Filter("opportunityInCRM", sap.ui.model.FilterOperator.EQ, "Yes"));
                }
              },

            addFiltersForSelectedItems: function (oEvent, filterKey) {
                var oSmartFilterBar =  this.getView().byId("smartFilterBar");
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
            },

            onAddTopicPress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddTopic");
            },
            onAddDeliverablePress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddDeliverable");
            },



            /* ------------------------------------------------------------------------------------------------------------
            FAVOURITE
            --------------------------------------------------------------------------------------------------------------*/

            onFavoriteToolbarPress: function (oEvent) {
                var oBtn = oEvent.getSource(); 
                var bToggle = oBtn.getPressed()
                if(bToggle) {
                    oBtn.setIcon('sap-icon://favorite')
                } else oBtn.setIcon('sap-icon://unfavorite')

                var aFilters = [];
                var bFavorite = oEvent.getSource().getPressed();
                if (bFavorite) {
                    var aFilters = [
                        new Filter({
                          filters: [
                            new Filter({ path: "isFavorite", operator: FilterOperator.EQ, value1: true,}),
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
                    success: function() {
                    var sMessage = "";
                    if (isFavorite === true) {
                        sMessage = "'" + oContext.account + "' added to favorites";
                    } else {
                        sMessage = "'" + oContext.account + "' removed from favorites";
                    }
                    MessageToast.show(sMessage);
                    },
                    error: function(oError) {
                      MessageToast.show(oError.message);
                    }
                  });

            },


           
            onDeleteTopic: function(){
                var oModel = this.getView().getModel();
                var sPath = "/opportunityDeliverables(97b6f518-1f80-4bd5-a4b5-0b8c9f0c5598)"

                oModel.remove(sPath, {
                    success: function () {
                        sap.m.MessageToast.show("Item deleted successfully.");
                    },
                    error: function () {
                        sap.m.MessageToast.show("Failed to delete item.");
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




        });
    });
