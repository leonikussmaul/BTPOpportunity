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
    "../model/formatter",
    "sap/ui/core/routing/History",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, Sorter, Message, MessageToast, ValueState, Token, Spreadsheet, jQuery, FilterType, formatter, History) {
        "use strict";


        return Controller.extend("opportunity.opportunity.controller.TaskDetail", {
            formatter: formatter,
            onInit: function () {

                sap.ui.core.UIComponent.getRouterFor(this).getRoute("TaskDetail").attachPatternMatched(this._onRoutePatternMatched, this);

                var oEditModel = new JSONModel({
                    editMode: false
                });
                this.getView().setModel(oEditModel, "editModel");

                var oPageModel = new JSONModel({});
                this.getView().setModel(oPageModel, "subTaskModel");

                var AddSubTaskModel = new JSONModel({});
                this.getView().setModel(AddSubTaskModel, "AddSubTaskModel");

                var oEditPageModel = new JSONModel({});
                this.getView().setModel(AddSubTaskModel, "editPageModel");


            },

            _onRoutePatternMatched: function (oEvent) {
                var oModel = this.getView().getModel();
                this._sID = oEvent.getParameter("arguments").ID;

                this.getView().bindElement({
                    path: "/opportunityActionItems/" + this._sID,
                    parameters: {
                        expand: "subTasks"
                    }

                });
                oModel.setDefaultBindingMode("TwoWay");

                this.onReadSubTasksData(this._sID);

            },

            onReadSubTasksData: function (sthisID) {
                var oModel = this.getView().getModel();
                var oTable = this.getView().byId("subTaskTable");
                var sID;
                if (sthisID) sID = sthisID;
                else sID = this.getView().getBindingContext().getObject().ID;

                var aFilters = [];
                aFilters.push(new Filter("opptID_ID", FilterOperator.EQ, this._sID));

                //  var aFilters = [];
                //  aFilters.push(new Filter("ID", FilterOperator.EQ, sID));
                var oSubTaskModel = this.getView().getModel("subTaskModel");

                oModel.read("/opportunitySubTasks", {
                    //  urlParameters: {
                    //      "$expand": "subTasks"
                    //  },
                    filters: aFilters,
                    success: function (oResponse) {
                        var aTasks = oResponse.results;
                        oSubTaskModel.setProperty("/subtasks", aTasks);

                        var iCompletedCount = aTasks.reduce(function (iCount, oTask) {
                            return oTask.subTaskCompleted ? iCount : iCount + 1;
                        }, 0);
                        oSubTaskModel.setProperty("/completedCount", iCompletedCount);

                        oTable.updateBindings();
                        oTable.getItems().forEach(oItem => {
                            if(oItem.getSelected()) oItem.mAggregations.cells[0].addStyleClass("checkSubTask");
                            else if(!oItem.getSelected()) oItem.mAggregations.cells[0].removeStyleClass("checkSubTask");
                        });


                    }.bind(this),
                    error: function (oError) {
                        console.log(oError);
                    }
                });

            },

            onNavBackPress: function (oEvent) {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
                                 oEditModel.setProperty("/editMode", false);
                                 if (oModel.hasPendingChanges()) {
                                     oModel.resetChanges();
                                     oModel.updateBindings();
                                 }
    
                                if (sPreviousHash !== undefined) window.history.go(-1);
                                else oRouter.navTo("TasksReport");
                            }
                        }.bind(this)
                    });
                } else {
                    // If edit mode is disabled, directly navigate back
                    if (sPreviousHash !== undefined) window.history.go(-1);
                    else oRouter.navTo("TasksReport");
                }

            },

           

        

            onBeforeRebindSubTaskTable: function (oEvent) {
                var oBindingParams = oEvent.getParameter("bindingParams");
                oBindingParams.filters.push(new Filter("opptID_ID", sap.ui.model.FilterOperator.EQ, this._sID));

                var oTable = this.getView().byId("subTaskTable")

                var fnGroupHeaderFormatter = function (oContext) {
                    var sHeader = oContext.getProperty("subTaskOwner");
                    return {
                        key: sHeader,
                    };
                };
                var oGrouping = new sap.ui.model.Sorter("subTaskOwner", true, fnGroupHeaderFormatter);
                oBindingParams.sorter.push(oGrouping);
            },


            onAddSubTask: function () {
                var that = this;
                this.onDialogOpen("opportunity.opportunity.view.fragments.AddSubTask");

            },

            onSubmitNewSubTask: function (oEvent) {
                var that = this;
                var oDialog = oEvent.getSource().getParent().getParent();
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                var oData = oAddSubTaskModel.getData();

                var sID = this.getView().getBindingContext().getObject().ID;
                var sOpptID = this.getView().getBindingContext().getObject().opptID_opportunityID;
                var sCustomer = this.getView().getBindingContext().getObject().actionCustomer;
                var iOrder = this.getView().getModel("subTaskModel").getData().subtasks.length; 

                var subTaskStatus; 
                if(oData.subTaskStatus) subTaskStatus = oData.subTaskStatus;
                else subTaskStatus = "Not Started";

                var sDueDate;
                if (oData.subTaskDueDate) sDueDate = new Date(oData.subTaskDueDate).toISOString().split("T")[0];

                var oNewSubTask = {
                    subTask: oData.subTask,
                    subTaskOwner: oData.subTaskOwner,
                    subTaskDueDate: sDueDate,
                    opptID_ID: this._sID,
                    subTaskCompleted: false,
                    subTaskStatus: subTaskStatus,
                    subTaskOrder: iOrder 
                };

                that.getView().setBusy(true);
                var oModel = that.getView().getModel();
                oModel.create("/opportunitySubTasks", oNewSubTask, {
                    success: function (oData, response) {
                        MessageToast.show("New sub-task added!");
                        that.onReadSubTasksData();
                        that.getView().setBusy(false);
                        oDialog.close();
                        oAddSubTaskModel.setData({}); 
                    },
                    error: function (oError) {
                        that.getView().setBusy(false);
                        MessageBox.error("Sub-task could not be added. Please check your input.");
                    }
                });
            },

            onDialogOpen: function (fragmentName) {

                var that = this;
                if(!this._pDialog){
                    this._pDialog = Fragment.load({
                        //id:"myDialog",
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
                var oAddSubTaskModel = this.getView().getModel("AddSubTaskModel");
                oAddSubTaskModel.setData({}); 
          
        },


            onSelectSubTask: function (oEvent) {
                var that = this;
                that.getView().setBusy(true); 
                
                var aSelected = oEvent.mParameters.listItems; 
                aSelected.forEach(oItem =>{
                    var oData; 
                    var oContext = oItem.getBindingContext().getObject();
                    var isSelected = oItem.getSelected();
                    if(oItem.getBindingContext("subTaskModel")){
                        oData = oItem.getBindingContext("subTaskModel").getObject();
                        var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')"

                        if (isSelected === true) oContext.subTaskCompleted = true;
                        else oContext.subTaskCompleted = false;

                        // var iOrder = this.getView().getModel("subTaskModel").getData().subtasks.length; 

                        var oPayload = {
                            ID: oData.ID,
                            subTaskCompleted: oContext.subTaskCompleted,
                            // subTaskOrder: iOrder
                        }
        
                        var oModel = this.getView().getModel();
                        oModel.update(sPath, oPayload, {
                            success: function () {
                                if (isSelected === true) {
                                    MessageToast.show("Sub-Task Completed");
                                }
                                that.onReadSubTasksData();
                                that.getView().setBusy(false); 
                            },
                            error: function (oError) {
                                MessageToast.show(oError.message);
                                that.getView().setBusy(false); 
                            }
                        });
                    }
                });

            },

            onDeleteSubTasks: function(oEvent) {
                var that = this;
                var oTable = this.getView().byId("subTaskTable");
                var oSubTaskModel = this.getView().getModel("subTaskModel"); 
                var aSelectedItems = oTable.getSelectedItems();
              
                if (aSelectedItems.length === 0) {
                  sap.m.MessageToast.show("Complete at least one sub-task to delete");
                  return;
                }
                var oModel = this.getView().getModel();
              
                sap.m.MessageBox.warning("Are you sure you want to delete all the completed sub-tasks?", {
                  actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                  onClose: function(oAction) {
                    if (oAction === sap.m.MessageBox.Action.YES) {
                      var promises = []; // array to store promises
                      for (var i = aSelectedItems.length - 1; i >= 0; i--) {
                        var oData = aSelectedItems[i].getBindingContext("subTaskModel").getObject();
                        var sPath = "/opportunitySubTasks(guid'" + oData.ID + "')";
              
                        var promise = new Promise(function(resolve, reject) {
                          oModel.remove(sPath, {

                            
                            success: function() {
                                oModel.refresh(); 
                                that.onReadSubTasksData();
                                oSubTaskModel.updateBindings(); 
                                oTable.updateBindings(); 
                               
                                oTable.removeSelections(true);
                              resolve(); // resolve the promise on success
                              
                            },
                            error: function() {
                              reject(); // reject the promise on error
                            }
                          });
                        });
              
                        promises.push(promise); // add promise to the array
                      }
              
                      Promise.all(promises).then(function() {
                        sap.m.MessageToast.show("All Sub-Tasks Completed!");
                        that.onReadSubTasksData();
                        oSubTaskModel.updateBindings(); 
                        that.updateCurrentIndex();
                      }).catch(function() {
                        sap.m.MessageToast.show("Some Sub-Tasks could not be deleted. Please try again later.");
                        that.onReadSubTasksData();
                        oTable.removeSelections(true);
                      });
                    }
                  }
                });
              },
              

            onDeleteTaskObjectPress: function (oEvent) {
                var that = this;
                var oItem = oEvent.getSource();
                var oBindingContext = oItem.getBindingContext();
                var sPath = oBindingContext.getPath();


                MessageBox.warning("Are you sure you want to delete this task?", {
                    actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        if(sAction === MessageBox.Action.OK){
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(that);
                            oRouter.navTo("TasksReport");
                            that.getView().setBusy(true);
    
                            var oModel = that.getView().getModel();
                            oModel.remove(sPath, {
                                success: function () {
                                    sap.m.MessageToast.show("Task deleted successfully.");
                                    that.getView().setBusy(false);
                                },
                                error: function () {
                                    sap.m.MessageToast.show("Task could not be deleted. Please try again.");
                                    that.getView().setBusy(false);
                                }
                            });
                    } else{
                        that.getView().setBusy(false);
                    }
                    }
                });
            },


            /* ------------------------------------------------------------------------------------------------------------
            EDIT / CANCEL
            --------------------------------------------------------------------------------------------------------------*/


            onSaveObjectPress: function (oEvent) {
                var oModel = this.getView().getModel();
                var oEditModel = this.getView().getModel("editModel");
                var oEditPageModel = this.getView().getModel("editPageModel"); 
                var oData = oEditPageModel.getData();

                var oPayload ={
                    actionTask: oData.actionTask,
                    actionTitle: oData.actionTitle,
                    actionOwner: oData.actionOwner,
                    actionProgress: this.getView().byId("actionProgressSlider").getValue(),
                    actionDueDate: oData.actionDueDate,
                    actionPriority: oData.actionPriority,
                    actionPriorityNumber: oData.actionPriorityNumber
                }

                var sPath = this.getView().getBindingContext().sPath; 
                oModel.update(sPath, oPayload, {
                            success: function() {
                            MessageToast.show("Changes saved successfully!");                  
                            oEditModel.setProperty("/editMode", false);
                            },
                            error: function(oError) {
                            MessageBox.error("Your changes could not be saved. Please try again.");
                            }
                          });
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

            onSetEditPageModel: function(){
                var oData = this.getView().getBindingContext().getObject();
                var oEditPageModel = this.getView().getModel("editPageModel");
                oEditPageModel.setData(oData); 
            },
                

            onProgressSliderChange: function(oEvent){
                var oModel = this.getView().getModel(); 
                var oValue = oEvent.getParameter("value");
                var oContext = this.getView().getBindingContext();
                var sPath = oContext.getPath();
                oModel.setProperty(sPath + "/actionProgress", oValue);
            },

            onReorderUp: function(oEvent) {
                var oSubTaskModel = this.getView().getModel("subTaskModel");
                var aSubTasks = oSubTaskModel.getProperty("/subtasks").slice();
                var oItem = oEvent.getSource().getBindingContext("subTaskModel").getObject();
                var iIndex = oItem.subTaskOrder;
                var iNewIndex = iIndex - 1;
                [aSubTasks[iIndex], aSubTasks[iNewIndex]] = [aSubTasks[iNewIndex], aSubTasks[iIndex]];
                aSubTasks.forEach(function(oItem, iIndex) {
                    oItem.subTaskOrder = iIndex;
                });
                oSubTaskModel.setProperty("/subtasks", aSubTasks);
                oSubTaskModel.updateBindings();
            
                var oSubTaskTable = this.getView().byId("subTaskTable");
                var selectedGuid = oEvent.getSource().getBindingContext("subTaskModel").getObject().ID;
                var oModel = this.getView().getModel();
            
                oSubTaskTable.getItems().forEach(oItem => {
                    var guidJSON = oItem.getBindingContext("subTaskModel").getObject().ID;
                    var iOrder = oItem.getBindingContext("subTaskModel").getObject().subTaskOrder;
            
                    var subTasks = oModel.getProperty(oItem.getBindingContext().getPath()).subTasks.__list;
                    for (var i = 0; i < subTasks.length; i++) {
                        var guidOData = subTasks[i].split('guid')[1].slice(1, -2);
                        if (guidOData == guidJSON) {
                            var sPath = "/opportunitySubTasks(guid'" + guidJSON + "')";
                            var oData = { subTaskOrder: iOrder };
                            oModel.update(sPath, oData, {
                                success: function() {
                                    // MessageToast.show("success");
                                },
                                error: function(oError) {
                                    MessageToast.show(oError.message);
                                }
                            });
                            break;
                        }
                    }
                });
            },
            

             
            onReorderDown: function(oEvent) {
                var oSubTaskModel = this.getView().getModel("subTaskModel");
                var aSubTasks = oSubTaskModel.getProperty("/subtasks").slice();
              
                var oItem = oEvent.getSource().getBindingContext("subTaskModel").getObject();
                var iIndex = oItem.subTaskOrder;
                var iNewIndex = iIndex + 1;
              
                [aSubTasks[iIndex], aSubTasks[iNewIndex]] = [aSubTasks[iNewIndex], aSubTasks[iIndex]];
              
                aSubTasks.forEach(function(oItem, iIndex) {
                  oItem.subTaskOrder = iIndex;
                });
              
                oSubTaskModel.setProperty("/subtasks", aSubTasks);
                oSubTaskModel.updateBindings();
              
                var oSubTaskTable = this.getView().byId("subTaskTable");
                var selectedGuid = oEvent.getSource().getBindingContext("subTaskModel").getObject().ID; 
                var oModel = this.getView().getModel();
              
                var subTaskItems = oSubTaskTable.getItems().forEach(oItem =>{
                  var guidJSON = oItem.getBindingContext("subTaskModel").getObject().ID; 
                  var iOrder = oItem.getBindingContext("subTaskModel").getObject().subTaskOrder; 
              
                  var subTasks = oItem.getBindingContext().getObject().subTasks.__list; 
                  for(var i=0; i < subTasks.length; i++){
                    var guidOData = subTasks[i].split('guid')[1].slice(1,-2);
                    if(guidOData == guidJSON) {
                      console.log("success");
                      var sPath = "/opportunitySubTasks(guid'" + guidJSON + "')";
                      var oData = { subTaskOrder: iOrder};
                      oModel.update(sPath, oData, {
                        success: function() {
                        //   MessageToast.show("success");
                        },
                        error: function(oError) {
                          MessageToast.show(oError.message);
                        }
                      });
                    } 
                  }
                })
              },

            onPopoverPress: function (oEvent) {
                var oButton = oEvent.getSource(),
                    oView = this.getView(),
                    iIndex = oEvent.getSource().getBindingContext("subTaskModel").sPath;
            
                    this._pPopover = Fragment.load({
                        id: oView.getId(),
                        name: "opportunity.opportunity.view.fragments.TaskPopover2",
                        controller: this
                    }).then(function(oPopover) {
                        oView.addDependent(oPopover);
                        oPopover.bindElement({
                            path: "subTaskModel>" + iIndex, // set the binding path based on the clicked index
                            events: {
                                change: function() {
                                    oPopover.invalidate(); // invalidate the popover to force it to update with the new data
                                }
                            }
                        });
                       
                        return oPopover;
                    })
                
                this._pPopover.then(function(oPopover) {
                    oPopover.attachAfterClose(function() {
                        oPopover.destroy();
                    }.bind(this));
                    oPopover.openBy(oButton);
                });
            },

            onSubTaskStatusChange: function(oEvent){
                var oModel = this.getView().getModel(); 
                var selectedGuid = oEvent.getSource().getBindingContext("subTaskModel").getObject().ID; 
                var oNewStatus = oEvent.getSource().getText(); 

                var sPath = "/opportunitySubTasks(guid'" + selectedGuid + "')";
                var oData = { subTaskStatus: oNewStatus};
                oModel.update(sPath, oData, {
                  success: function() {
                    MessageToast.show("Status changed to " + oNewStatus);
                  },
                  error: function(oError) {
                    MessageToast.show(oError.message);
                  }
                });

                
            },

            updateCurrentIndex: function(oEvent){
                var oModel = this.getView().getModel();
                var oTable = this.getView().byId("subTaskTable");
               

               for(var i = 0; i < oTable.getItems().length; i++){

                var sGuid = oTable.getItems()[i].getBindingContext("subTaskModel").getObject().ID
                var sPath = "/opportunitySubTasks(guid'" + sGuid + "')";
                var oData = { subTaskOrder: i};
                oModel.update(sPath, oData, {
                  success: function() {
                    MessageToast.show("success");
                  },
                  error: function(oError) {
                    MessageToast.show(oError.message);
                  }
                });

               }
                
            },

              

            
              


        });
    });
