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

],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, MessageToast, formatter, JSONModel, Filter, FilterOperator, Fragment, FilterType, History) {
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

                var oEditPageModel = new JSONModel({});
                this.getView().setModel(AddTaskModel, "editPageModel");

                var oView = this.getView();
                oView.setModel(new JSONModel({
                }), "viewModel");

                oView.setModel(new sap.ui.model.json.JSONModel({
                }), "localModel");


            },
            /* ------------------------------------------------------------------------------------------------------------
            ROUTE MATCHED
            --------------------------------------------------------------------------------------------------------------*/

    
        // onNotesSectionDestroy: function (oEvent) {
        //     this._pNotes = Fragment.load({
        //         id:"notesSection",
        //         name: "opportunity.opportunity.view.fragments.NotesSection",
        //         controller:this
        //     });
        //         this._pNotes.then(function(_pNotes){
        //             _pNotes.destroy();
        //         });
        //         this._pNotes = null;    
          
        // },
            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                var sOpportunityID = oEvent.getParameter("arguments").opportunityID;
                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "actionItems"
                    }

                });

                var aTabs = [];
                var oTabModel = this.getOwnerComponent().getModel("tabModel");
                if(oTabModel.getData().tabs.length < 1){
                    aTabs.push({"opportunityID": sOpportunityID, "account": "New Tab"});
                    oTabModel.setProperty("/tabs", aTabs);


                }
                
                oModel.setDefaultBindingMode("TwoWay");
                //oModel read for tasks deep entity 
                this.onReadModelData(sOpportunityID); 
                this.onSetLayout(); 

                this.getView().byId("myTabContainer").setSelectedItem(); 

                //this.onAddTabtoModel(); 
                

            },
            onTabItemSwitch: function(oEvent){
              
                this.getView().setBusy(true);
                var oModel = this.getView().getModel();
                //if(oEvent.mParameters.item){
                //var sOpportunityID = oEvent.mParameters.item.getKey();
                var sOpportunityID = window.location.href.split('#')[1].split('/')[2]; 
                this.getView().bindElement({
                    path: "/opportunityHeader/" + sOpportunityID,
                    parameters: {
                        expand: "actionItems"
                    }

                });
                this.getView().setBusy(false);
                 //oModel read for tasks deep entity 
                 this.onReadModelData(sOpportunityID); 
                 this.onSetLayout(); 

                
               
            //}

            },

            // onAddTabtoModel: function(oEvent){

            //    var sOpportunityID = window.location.href.split('#')[1].split('/')[2]; 
            //    var oContext = this.getView().getModel().getProperty("/opportunityHeader(" + sOpportunityID + ")");

            //    var oTabModel = this.getOwnerComponent().getModel("tabModel");
            //    var aData = oTabModel.getData().tabs; 
            //    aData.push(oContext); 
            //  oTabModel.setProperty("/tabs", aData); 


            // },

            onTabItemClose: function(oEvent) {
                var selectedItemKey = oEvent.getParameter('item').getKey();
              
                var oTabModel = this.getOwnerComponent().getModel("tabModel");
                var aData = oTabModel.getProperty("/tabs");
              
                // Remove the item from the array based on the specified value
                aData.forEach((oItem, index) => {
                    if (oItem.opportunityID.toString() === selectedItemKey) {
                      aData.splice(index, 1);
                    }
                  });
              
                oTabModel.setProperty("/tabs", aData);

                if(oTabModel.getData().tabs.length < 1){
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("MainReport");
                }
              },
              

            onOpenTab: function(selectedItem) {
                var oTabModel = this.getOwnerComponent().getModel("tabModel");
                var aData = oTabModel.getProperty("/tabs");
              
                // Check if opportunityID already exists in the array
                var isExisting = aData.some(function(item) {
                  return item.opportunityID === selectedItem.opportunityID;
                });
              
                if (!isExisting) {
                  aData.unshift(selectedItem);
                  oTabModel.setProperty("/tabs", aData);
                }
              },
              

            onPress: function(oEvent){
                var selectedItem = oEvent.getSource().getBindingContext().getObject();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("TaskDetail", {
                    opportunityID: selectedItem.opportunityID
                });

            },

            onSetLayout: function(){

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
                         "$expand": "actionItems/subTasks,topics,deliverables"
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
                    else  oRouter.navTo("MainReport");
                }

                //this.onNotesSectionDestroy(); 


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
                var that = this; 
                this._bEdit = true;
                var oModel = this.getView().getModel();
                var oEditModel = this.getView().getModel("editModel");
                var oEditPageModel = this.getView().getModel("editPageModel"); 

                var oData = this.getView().getModel("editPageModel").getData();


                var oPayload ={
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
                    topic: oData.topic
                }

                var sPath = this.getView().getBindingContext().sPath; 
                oModel.update(sPath, oPayload, {
                            success: function() {
                            MessageToast.show("Changes saved successfully!");
                            oModel.refresh();                                         
                            oEditModel.setProperty("/editMode", false);
                            that.onReadModelData(); 
                            },
                            error: function(oError) {
                                sap.m.MessageBox.error("Changes could not be saved. Details: " +  oError.message);
                            }
                          });
            
            },


            onToggleButtonPressed: function (oEvent) {
                // var sSelectedTopic = oEvent.getSource().getText();
                // var oContext = oEvent.getSource().getBindingContext();
                // oContext.setProperty("topic", sSelectedTopic);
                var oEditModel = this.getView().getModel("editModel");
                oEditModel.setProperty("/editMode", true);

            },

            onPressToggle1: function(oEvent){
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

                if(bPressed){
                    var sNewPath = sPath + "/topics";
                    oModel.create(sNewPath, oNewTopic, {
                        success: function(oData, response) {
                            MessageToast.show("'" + sTopic + "' added!");
                        },
                        error: function(oError) {
                            sap.m.MessageBox.error("Topic could not be added, try again.");
                        }
                    });
                }else{
                    var sTopicPath; 
                    var sSource = oButton.getCustomData()[0].getValue(); 
                    var aTopics = oModel.getProperty(sPath + "/topics");
                    aTopics.forEach(oItem =>{
                        if(oModel.getProperty("/" + oItem)){
                            var oTopic = oModel.getProperty("/" + oItem).topic;
                            if (oTopic === sSource){
                                sTopicPath = "/" + oItem; 
                            }
                        }
                    });

                oModel.remove(sTopicPath, {
                    success: function(oData, response) {
                        oButton.setEnabled(false); 
                        MessageToast.show("'" + sSource + "' removed!");
                        
                    },
                    error: function(oError) {
                        sap.m.MessageBox.error("Topic '" + sSource + "' could not be removed, try again.");
                    }
                });

                }
             
            },

            onPressToggle2: function(oEvent){
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

                if(bPressed){
                    var sNewPath = sPath + "/deliverables";
                    oModel.create(sNewPath, oNewDeliverable, {
                        success: function(oData, response) {
                            MessageToast.show("'" + sDeliverable + "' added!");
                        },
                        error: function(oError) {
                            sap.m.MessageBox.error("Deliverable could not be added, try again.");
                        }
                    });
                }else{
                    var sDeliverablePath; 
                    var sSource = oButton.getCustomData()[0].getValue(); 
                    var aDeliverables = oModel.getProperty(sPath + "/deliverables");
                    aDeliverables.forEach(oItem =>{
                        var oDeliverable = oModel.getProperty("/" + oItem).deliverable;
                        if (oDeliverable === sSource){
                            sDeliverablePath = "/" + oItem; 
                        }
                    })

                oModel.remove(sDeliverablePath, {
                    success: function(oData, response) {
                        oButton.setEnabled(false); 
                        MessageToast.show("'" + sSource + "' removed!");
                        
                    },
                    error: function(oError) {
                        sap.m.MessageBox.error("Deliverable '" + sSource + "' could not be removed, try again.");
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
                this.onSetEditPageModel(); 
            },

            onSetEditPageModel: function(oEvent){
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


            onSubmitNewTask: function(oEvent) {

                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent(); 
                var oAddTaskModel = this.getView().getModel("AddTaskModel");
                var oData = oAddTaskModel.getData();

                if(this._bEdit){
                    this._bEdit = false; 
                    this.onSubmitEditedTask(); 

                }else{

                var sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                var sCustomer = this.getView().getBindingContext().getObject().account; 
                var sDueDate;
                if (oData.actionDueDate) sDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];

                var sPriorityNumber; 
                if(oData.actionPriority === "High") sPriorityNumber = 1; 
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
                  success: function(oData, response) {
                    MessageToast.show("New Task created!");
                    that.onReadModelData();
                    oDialog.close(); 
                    oAddTaskModel.setData({}); 
                  },
                  error: function(oError) {
                    sap.m.MessageBox.error("Task could not be created, check your input and try again.");
                  }
                });
                    this._bEdit = false; 
                }
               
              },
             

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

            onDialogOpen: function (fragmentName) {

                    var that = this;
                    if(!this._pDialog){
                        this._pDialog = Fragment.load({
                           // id:"myDialog",
                            name: fragmentName,
                            controller:this
                        }).then(function(_pDialog){
                            that.getView().addDependent(_pDialog);
                            _pDialog.setEscapeHandler(function () {
                                that.onCloseDialog();
                            });
                            return _pDialog;
                        });
                    }
                    this._pDialog.then(function(_pDialog){                
                        _pDialog.open();
                        
                    })
            },


            onCancelDialogPress: function (oEvent) {
                    this._pDialog.then(function(_pDialog){
                        _pDialog.close();
                        _pDialog.destroy();
                    });
                    this._pDialog = null;    
                    var oAddTaskModel = this.getView().getModel("AddTaskModel");
                oAddTaskModel.setData({});
              
            },
            

           



                  /* ------------------------------------------------------------------------------------------------------------
                ADD TOPIC
           --------------------------------------------------------------------------------------------------------------*/


           onSubmitTopic: function (oEvent) {
            var that = this;
            // var oDialog = sap.ui.core.Fragment.byId("myDialog", "topicDialog");
            // var oInput = sap.ui.core.Fragment.byId("myDialog", "topicInput");
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
        // var oDialog = sap.ui.core.Fragment.byId("myDialog", "deliverableDialog");
        // var oInput = sap.ui.core.Fragment.byId("myDialog", "deliverableInput");

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

        var oPayload = {"isFavorite": oContext.isFavorite};

        var oModel = this.getView().getModel(); 
        oModel.update(sPath, oPayload, {
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


            /* ------------------------------------------------------------------------------------------------------------
            CHART
            --------------------------------------------------------------------------------------------------------------*/


            beforeRebindChart: function (oEvent) {
                var sOpportunityID = this.getView().getBindingContext().getObject().opportunityID;
                var oBindingParams = oEvent.getParameter('bindingParams');

                var filterOpportunityID = new Filter("opportunityID", FilterOperator.EQ, sOpportunityID);
                oBindingParams.filters.push(filterOpportunityID);
            },

            // onGridListItemDetailPress: function(oEvent){
            //         var selectedItem = oEvent.getSource().getBindingContext("pageModel").getObject();
            //         var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            //         oRouter.navTo("TaskDetail", {
            //             ID: selectedItem.ID
            //         });
            // },

            onGridListItemPress: function(oEvent){
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
                    name: "opportunity.opportunity.view.fragments.TaskPopover3",
                    controller: this
                }).then(function(oPopover) {
                    oView.addDependent(oPopover);
                    oPopover.bindElement({
                        path: "pageModel>" + iIndex,
                        events: {
                            change: function() {
                                oPopover.invalidate();  }
                        }
                    });
                   
                    return oPopover;
                })
            
            this._pPopover.then(function(oPopover) {
                oPopover.attachAfterClose(function() {
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
            this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDo");
            var oAddTaskModel = this.getView().getModel("AddTaskModel");
            var oData = oEvent.getSource().getBindingContext("pageModel").getObject();
            oData.actionDueDate = new Date(oData.actionDueDate).toISOString().split("T")[0];
            oAddTaskModel.setData(oData); 
            
        },

        onSubmitEditedTask: function(){
            var that = this;
            var oModel = this.getView().getModel(); 
            var oAddTaskModel =  this.getView().getModel("AddTaskModel");
            var oData = oAddTaskModel.getData(); 
            var sGuid = oData.ID; 

            var oPageModel = this.getView().getModel("pageModel");
            
            var sPriorityNumber; 
            if(oData.actionPriority === 'High') sPriorityNumber = 1; 
            else if(oData.actionPriority === 'Medium') sPriorityNumber = 2; 
            else if(oData.actionPriority === 'Low') sPriorityNumber = 3; 

            var sUpdatedTask = {
                actionDueDate: new Date(oData.actionDueDate).toISOString().split("T")[0], 
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
                success: function() {
                MessageToast.show("success");
                //close dialog
                that.onCancelDialogPress(); 
                oPageModel.updateBindings(); 
                },
                error: function(oError) {
                  MessageBox.error("The task could not be updated: " + oError.message);
                  //
                }
              });
        },

        onGridListItemDelete: function(oEvent){
            var that = this; 
            var oModel = this.getView().getModel(); 
            var oContext = oEvent.getParameters().listItem.getBindingContext("pageModel").getObject(); 
            MessageBox.warning("Are you sure you want to delete the Task '" + oContext.actionTitle + "'?", {
                actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                emphasizedAction: MessageBox.Action.OK,
                onClose: function (sAction) {
                    if(sAction === MessageBox.Action.OK){
    
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

        onCRMCheckboxSelect: function(oEvent){
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
                    // actionItems: [{
                    //     actionDueDate: sTodayDate,
                    //     actionOwner: oData.primaryContact,
                    //     actionProgress: oData.progress,
                    //     actionTopic: oData.topic,
                    //     actionTask: oData.account
                    // }],
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
                oDialog.setContentHeight("80%");
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


     

        });
    });
