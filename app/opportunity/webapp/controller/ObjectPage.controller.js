sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/formatter",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/core/Fragment",

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast, formatter, JSONModel, Filter, FilterOperator, Fragment) {
        "use strict";
        var _this = this;

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

            },
            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var sOpportunityID = oEvent.getParameter("arguments").opportunityID;
                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "actionItems"
                    }

                });
                oModel.setDefaultBindingMode("TwoWay");
                //oModel read for tasks deep entity 
                this.onReadModelData(sOpportunityID); 

                this.onSetLayout(); 
                

            },

            onSetLayout: function(){

                var oLayout1 = this.getView().byId("TopicFiltersObject");
                var oTemplate1 = oLayout1.getBindingInfo("content").template;
                oLayout1.bindAggregation("content", {
                    path: '/opportunityTopics',
                    template: oTemplate1,
                    sorter: new sap.ui.model.Sorter('topic', false)
                });
                oLayout1.getBindingInfo('content').binding.refresh();

                var oLayout2 = this.getView().byId("DeliverablesFiltersObject");
                var oTemplate2 = oLayout2.getBindingInfo("content").template;
                oLayout2.bindAggregation("content", {
                    path: '/opportunityDeliverables',
                    template: oTemplate2,
                    sorter: new sap.ui.model.Sorter('deliverable', false)
                });
                oLayout2.getBindingInfo('content').binding.refresh();

            },

            

            onReadModelData: function(sOppID){
                var oModel = this.getView().getModel();
                var sOpportunityID;
                if(sOppID) sOpportunityID = sOppID;
                else sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
    
                 var aFilters = [];
                 aFilters.push(new Filter("opportunityID", FilterOperator.EQ, sOpportunityID));
                 var oPageModel = this.getView().getModel("pageModel");
                 oModel.read("/opportunityHeader", {
                     urlParameters: {
                         "$expand": "actionItems,topics,deliverables"
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

                var oModel = this.getView().getModel();

                var oEditModel = this.getView().getModel("editModel");
                var bEditMode = oEditModel.getProperty("/editMode");
                if (bEditMode) {
                    MessageBox.confirm("Discard changes and navigate back?", {
                        onClose: function (oAction) {
                            if (oAction === MessageBox.Action.OK) {
                                // If user confirms, navigate back
                                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                oRouter.navTo("MainReport");
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
                    oRouter.navTo("MainReport");
                }


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
                            error: function () {
                                sap.m.MessageToast.show("Item could not be deleted. Please try again.");
                                that.getView().setBusy(false);
                            }
                        });
                    }
                });
            },


            /* ------------------------------------------------------------------------------------------------------------
            EDIT / CANCEL
            --------------------------------------------------------------------------------------------------------------*/

            onSaveObjectPress: function (oEvent) {
                var oModel = this.getView().getModel();
                var oEditModel = this.getView().getModel("editModel")

                if (oModel.hasPendingChanges()) {
                    oModel.submitChanges({
                        success: function () {
                            oModel.refresh();
                            MessageToast.show("Changes saved successfully!");
                            oModel.resetChanges();
                            oEditModel.setProperty("/editMode", false);
                        }.bind(this),
                        error: function (oError) {
                            MessageBox.success("Your changes could not be saved. Please try again.");
                            oModel.resetChanges();
                        }.bind(this)
                    });
                } else MessageToast.show("No changes detected")


                var sPath = this.getView().getBindingContext().sPath;
                var oObject = this.getView().getBindingContext().getObject();
            },


            onToggleButtonPressed: function (oEvent) {
                // var sSelectedTopic = oEvent.getSource().getText();
                // var oContext = oEvent.getSource().getBindingContext();
                // oContext.setProperty("topic", sSelectedTopic);
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

            },

            onCRMCheckboxSelect: function (oEvent) {
                var oCheckBox = oEvent.getSource();
                var oText = this.byId("opportunityInCRMText");
                var bSelected = oCheckBox.getSelected();
                var sText = bSelected ? "Yes" : "No";
                oText.setText(sText);
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

            },

            onSegmentPressed: function (oEvent) {
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

            },


            // onAddTopicPress: function() {
            //     var oController = this; 
            //     if (!this._addTopicDialog) {
            //       this._addTopicDialog = Fragment.load({ name: "opportunity.opportunity.view.fragments.AddTopic", controller: this });
            //     }
            //     this._addTopicDialog.then(function (_addTopicDialog) {
            //         oController.getView().addDependent(_addTopicDialog);
            //         _addTopicDialog.open();
            //     });

            //   },

            /* ------------------------------------------------------------------------------------------------------------
            DIALOG
            --------------------------------------------------------------------------------------------------------------*/


            onAddTopicPress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddTopic");
            },
            onAddDeliverablePress: function () {
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddDeliverable");
            },
            onAddToDoPress: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDo");
                
            },
            onSubmitNewTask: function(oEvent) {
                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent(); 
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();
                var sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                var sDueDate;
                if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];
              
                var oNewTask = {
                  actionDueDate: sDueDate,
                  actionOwner: oData.actionOwner,
                  actionProgress: oData.actionProgress,
                  actionTopic: oData.actionTopic,
                  actionTask: oData.actionTask,
                  actionTitle: oData.actionTitle,
                  actionPriority: oData.actionPriority
                };
              
                var sPath = "/opportunityHeader(" + sOpportunityID + "')/actionItems";
              
                var oModel = this.getView().getModel();
                oModel.create(sPath, oNewTask, {
                  success: function(oData, response) {
                    MessageToast.show("New Task created!");
                    that.onReadModelData();
                    oDialog.close(); 
                  },
                  error: function(oError) {
                    sap.m.MessageBox.error("Task could not be created, try again.");
                  }
                });
              },
              

             

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
                oEvent.getSource().getParent().getParent().close()
            },


            onDeleteToDo: function(oEvent){
                this.getView().setBusy(true); 
                var that = this; 
                var oModel = this.getView().getModel(); 
                var sPath = oEvent.getSource().getBindingContext().sPath;
                var oGridList = this.getView().byId("gridList");
                var aSelectedItems = oGridList.getSelectedItems();
                if(aSelectedItems.length > 0){
                    aSelectedItems.forEach(oItem => {
                        var aActionItems = oItem.getBindingContext().getProperty("actionItems"); 
                        var iSelectedIndex = oItem.getBindingContextPath().split('/')[2];
                        var oSelect = aActionItems[iSelectedIndex].split("'")[1]; 
                        var sDeletePath = sPath + "/actionItems(" + oSelect + ")";
                        oModel.setUseBatch(false);
                        oModel.remove(sDeletePath, {
                            success: function (oData) {
                                MessageToast.show("Task deleted");
                                oModel.resetChanges();
                                that.onReadModelData();
                                that.getView().setBusy(false); 
                                oGridList.removeSelections(); 
                            },
                            error: function (oError) {
                                oModel.resetChanges();
                                that.getView().setBusy(false); 
                            }
                        });
                    });
                }
            },



                  /* ------------------------------------------------------------------------------------------------------------
                ADD TOPIC
           --------------------------------------------------------------------------------------------------------------*/


           onSubmitTopic: function (oEvent) {
            var that = this;
            var oDialog = sap.ui.getCore().byId("topicDialog");
            var oInput = sap.ui.getCore().byId("topicInput");
            var oValue = oInput.getValue();
            var aTopics = this.getView().getModel("pageModel").getData().topics;

            if (oValue != "" && oInput != null) {
                MessageBox.warning("Are you sure you want to post the topic " + oValue + " to the DataBase? This action is not reversible.", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction === MessageBox.Action.OK){
                        var isMatch = aTopics.some(oItem => {
                            return oItem.topic.toUpperCase() === oValue.toUpperCase();
                        });
                        if (isMatch) {
                            //prevent POST call 
                            MessageBox.error("This topic already exists!");
                            oInput.setValue("");
                            oDialog.close();
                        }else {
                            // POST call 
                            var oNewTopic = {
                                topic: oValue
                            }
                            that.getView().setBusy(true);
                            var oModel = that.getView().getModel();
                            oModel.create("/opportunityTopics", oNewTopic, {
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
                        }
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
        var aDeliverables = this.getView().getModel("pageModel").getData().deliverables;

        if (oValue != "" && oInput != null) {
            MessageBox.warning("Are you sure you want to post the deliverable " + oValue + " to the DataBase? This action is not reversible.", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === MessageBox.Action.OK){
                    var isMatch = aDeliverables.some(oItem => {
                        return oItem.deliverable.toUpperCase() === oValue.toUpperCase();
                    });
                    if (isMatch) {
                        //prevent POST call 
                        MessageBox.error("This deliverable already exists!");
                        oInput.setValue("");
                        oDialog.close();
                    }else {
                        // POST call 
                        var oNewDeliverable = {
                            deliverable: oValue
                        }
                        that.getView().setBusy(true);
                        var oModel = that.getView().getModel();
                        oModel.create("/opportunityDeliverables", oNewDeliverable, {
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
                    }
                } else{
                    oInput.setValue("");
                    that.getView().setBusy(false);
                }
                }
            });
        } else MessageToast.show("Enter a new deliverable first");
    },


            /* ------------------------------------------------------------------------------------------------------------
            CHART
            --------------------------------------------------------------------------------------------------------------*/


            beforeRebindChart: function (oEvent) {
                var sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                var oBindingParams = oEvent.getParameter('bindingParams');

                var filterOpportunityID = new Filter("opportunityID", FilterOperator.EQ, sOpportunityID);
                oBindingParams.filters.push(filterOpportunityID);
            },







        });
    });
