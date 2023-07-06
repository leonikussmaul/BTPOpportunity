sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/m/MessageToast","sap/ui/core/ValueState","sap/ui/model/FilterType","../model/formatter","sap/ui/core/routing/History","sap/ui/core/date/UI5Date","sap/m/library"],function(e,t,s,o,a,i,n,r,u,d,l,g,c){"use strict";return e.extend("opportunity.opportunity.controller.TaskDetail",{formatter:d,onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).getRoute("TaskDetail").attachPatternMatched(this._onRoutePatternMatched,this);var e=new o({editMode:false});this.getView().setModel(e,"editModel");var t=new o({});this.getView().setModel(t,"subTaskModel");var s=new o({});this.getView().setModel(s,"AddSubTaskModel");var a=new o({});this.getView().setModel(s,"editPageModel");var i=new o({});this.getView().setModel(i,"localModel")},_onRoutePatternMatched:function(e){var t=this.getView().getModel();this._sID=e.getParameter("arguments").ID;this.getView().bindElement({path:"/opportunityActionItems/"+this._sID,parameters:{expand:"subTasks"}});t.setDefaultBindingMode("TwoWay");this.onReadSubTasksData(this._sID);this.onFilterLinkList(this._sID);this.onFilterComments(this._sID)},onReadSubTasksData:function(e){var t=this;var s=this.getView().getModel();var o;if(e)o=e;else o=this.getView().getBindingContext().getObject().ID;var n=[];n.push(new a("opptID_ID",i.EQ,this._sID));var r=this.getView().getModel("subTaskModel");s.read("/opportunitySubTasks",{filters:n,sorters:[new sap.ui.model.Sorter("subTaskOrder",false)],success:function(e){var s=e.results;r.setProperty("/subtasks",s);var o=s.reduce(function(e,t){return t.subTaskCompleted?e:e+1},0);r.setProperty("/completedCount",o);t.onCompleteItems();t.updateCurrentIndex(s)}.bind(this),error:function(e){console.log(e)}})},onCompleteItems:function(e){var t=this.getView().byId("subTaskTable");t.getItems().forEach(e=>{if(e.getSelected())e.mAggregations.cells[1].addStyleClass("checkSubTask");else if(!e.getSelected())e.mAggregations.cells[1].removeStyleClass("checkSubTask")})},onNavBackPress:function(e){var s=sap.ui.core.UIComponent.getRouterFor(this);var o=this.getView().getModel();var a=l.getInstance();var i=a.getPreviousHash();var n=this.getView().getModel("editModel");var r=n.getProperty("/editMode");if(r){t.confirm("Discard changes and navigate back?",{onClose:function(e){if(e===t.Action.OK){n.setProperty("/editMode",false);if(o.hasPendingChanges()){o.resetChanges();o.updateBindings()}if(i!==undefined)window.history.go(-1);else s.navTo("TasksReport")}}.bind(this)})}else{if(i!==undefined)window.history.go(-1);else s.navTo("TasksReport")}},onAddSubTask:function(){var e=this;this.onDialogOpen("opportunity.opportunity.view.fragments.AddSubTask")},onSubmitNewSubTask:function(e){var s=this;var o=this.getView().getModel("AddSubTaskModel");var a=o.getData();var i=this.getView().getModel("subTaskModel").getData().subtasks.length;var r;if(a.subTaskStatus)r=a.subTaskStatus;else r="Not Started";var u;if(a.subTaskDueDate)u=new Date(a.subTaskDueDate).toISOString().split("T")[0];var d={subTask:a.subTask,subTaskOwner:a.subTaskOwner,subTaskDueDate:u,opptID_ID:this._sID,subTaskCompleted:false,subTaskStatus:r,subTaskOrder:i};s.getView().setBusy(true);var l=s.getView().getModel();l.create("/opportunitySubTasks",d,{success:function(e,t){n.show("New sub-task added!");s.onReadSubTasksData();s.getView().setBusy(false);s.onCancelDialogPress()},error:function(e){s.getView().setBusy(false);t.error("Sub-task could not be added. Please check your input.")}})},onDialogOpen:function(e){var t=this;if(!this._pDialog){this._pDialog=s.load({name:e,controller:this}).then(function(e){t.getView().addDependent(e);e.setEscapeHandler(function(){t.onCloseDialog()});return e})}this._pDialog.then(function(e){e.open()})},onCancelDialogPress:function(e){this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;var t=this.getView().getModel("localModel");t.setData({});var s=this.getView().getModel("AddSubTaskModel");s.setData({})},onSelectSubTask:function(e){var t=this;t.getView().setBusy(true);var s=e.mParameters.listItems;s.forEach(e=>{var s;var o=e.getBindingContext().getObject();var a=e.getSelected();if(e.getBindingContext("subTaskModel")){s=e.getBindingContext("subTaskModel").getObject();var i="/opportunitySubTasks(guid'"+s.ID+"')";if(a===true){o.subTaskCompleted=true;o.subTaskStatus="Completed"}else{o.subTaskCompleted=false;o.subTaskStatus=s.subTaskStatus}var r={ID:s.ID,subTaskCompleted:o.subTaskCompleted,subTaskStatus:o.subTaskStatus};var u=this.getView().getModel();u.update(i,r,{success:function(){if(a===true){n.show("Sub-Task Completed")}t.onReadSubTasksData();t.getView().getModel("subTaskModel").refresh();t.getView().setBusy(false)},error:function(e){n.show(e.message);t.getView().setBusy(false)}})}})},onDeleteSubTasks:function(e){var t=this;var s=this.getView().byId("subTaskTable");var o=this.getView().getModel("subTaskModel");var a=s.getSelectedItems();if(a.length===0){sap.m.MessageToast.show("Complete at least one sub-task to delete");return}var i=this.getView().getModel();sap.m.MessageBox.warning("Are you sure you want to delete all the completed sub-tasks?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(e){if(e===sap.m.MessageBox.Action.YES){var n=[];for(var r=a.length-1;r>=0;r--){var u=a[r].getBindingContext("subTaskModel").getObject();var d="/opportunitySubTasks(guid'"+u.ID+"')";var l=new Promise(function(e,a){i.remove(d,{success:function(a,n){i.refresh();o.refresh();t.onReadSubTasksData();o.updateBindings();s.updateBindings();s.removeSelections(true);e()},error:function(){a()}})});n.push(l)}Promise.all(n).then(function(){sap.m.MessageToast.show("All Sub-Tasks Completed!");t.onReadSubTasksData()}).catch(function(){sap.m.MessageToast.show("Some Sub-Tasks could not be deleted. Please try again later.");s.removeSelections(true)})}}})},onDeleteTaskObjectPress:function(e){var s=this;var o=e.getSource();var a=o.getBindingContext();var i=a.getPath();t.warning("Are you sure you want to delete this task?",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var o=sap.ui.core.UIComponent.getRouterFor(s);o.navTo("TasksReport");s.getView().setBusy(true);var a=s.getView().getModel();a.remove(i,{success:function(){sap.m.MessageToast.show("Task deleted successfully.");s.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Task could not be deleted. Please try again.");s.getView().setBusy(false)}})}else{s.getView().setBusy(false)}}})},onSaveObjectPress:function(e){var s=this.getView().getModel();var o=this.getView().getModel("editModel");var a=this.getView().getModel("editPageModel");var i=a.getData();var r={actionTask:i.actionTask,actionTitle:i.actionTitle,actionOwner:i.actionOwner,actionProgress:this.getView().byId("actionProgressSlider").getValue(),actionDueDate:i.actionDueDate,actionPriority:i.actionPriority,actionPriorityNumber:i.actionPriorityNumber};var u=this.getView().getBindingContext().sPath;s.update(u,r,{success:function(){n.show("Changes saved successfully!");o.setProperty("/editMode",false)},error:function(e){t.error("Your changes could not be saved. Please try again.")}})},onCancelObjectPress:function(e){var t=e.getSource();var s=this.getView().getModel("editModel");s.setProperty("/editMode",false);var o=this.getView().getModel();o.resetChanges();o.updateBindings()},onEditObjectPress:function(e){var t=e.getSource();var s=this.getView().getModel("editModel");s.setProperty("/editMode",true);this.onSetEditPageModel()},onSetEditPageModel:function(){var e=this.getView().getBindingContext().getObject();var t=this.getView().getModel("editPageModel");t.setData(e)},onProgressSliderChange:function(e){var t=this.getView().getModel();var s=e.getParameter("value");var o=this.getView().getBindingContext();var a=o.getPath();t.setProperty(a+"/actionProgress",s)},onReorderUp:function(e){var t="Up";this.onReorderItems(e,t)},onReorderDown:function(e){var t="Down";this.onReorderItems(e,t)},onReorderItems:function(e,t){var s=this;var o=this.getView().getModel("subTaskModel");var a=o.getProperty("/subtasks");var i=e.getSource().getBindingContext("subTaskModel").getObject();var r=i.subTaskOrder;var u=r;if(t==="Up"&&r>0){u=r-1}else if(t==="Down"&&r<a.length-1){u=r+1}if(r!==u){a.splice(u,0,a.splice(r,1)[0]);a.forEach(function(e,t){if(e){e.subTaskOrder=t}});a=a.filter(function(e){return e!==undefined});o.setProperty("/subtasks",a);o.updateBindings();var d=this.getView().getModel();a.forEach(function(e,t){if(e){var o=e.ID;var i=e.subTaskOrder;var r="/opportunitySubTasks(guid'"+o+"')";var u={subTaskOrder:i};d.update(r,u,{success:function(){s.onCompleteItems();s.getView().getModel("subTaskModel").refresh()},error:function(e){n.show(e.message)}})}else{a.splice(t,1)}})}},onPopoverPress:function(e){var t=e.getSource(),o=this.getView(),a=e.getSource().getBindingContext("subTaskModel").sPath;this._pPopover=s.load({id:o.getId(),name:"opportunity.opportunity.view.fragments.TaskPopover2",controller:this}).then(function(e){o.addDependent(e);e.bindElement({path:"subTaskModel>"+a,events:{change:function(){e.invalidate()}}});return e});this._pPopover.then(function(e){e.attachAfterClose(function(){e.destroy()}.bind(this));e.openBy(t)})},onSubTaskStatusChange:function(e){var t=this;var s=this.getView().getModel();var o=e.getSource().getBindingContext("subTaskModel").getObject().ID;var a=e.getSource().getText();var i={subTaskStatus:a,subTaskCompleted:false};if(a==="Completed"){e.getSource().getParent().getParent().getParent().setSelected(true);i={subTaskStatus:a,subTaskCompleted:true}}var r="/opportunitySubTasks(guid'"+o+"')";s.update(r,i,{success:function(){n.show("Status changed to "+a);t.onCompleteItems();t.getView().getModel("subTaskModel").refresh()},error:function(e){n.show(e.message)}})},updateCurrentIndex:function(e){var t=this;var s=this.getView().getModel();var o=this.getView().byId("subTaskTable");var a=this.getView().getModel("subTaskModel");var e=this.getView().getModel("subTaskModel").getProperty("/subtasks");for(var i=0;i<e.length;i++){var r=e[i].ID;var u="/opportunitySubTasks(guid'"+r+"')";var d={subTaskOrder:i};s.update(u,d,{success:function(){o.updateBindings();a.updateBindings();s.refresh();t.getView().getModel("subTaskModel").refresh()},error:function(e){n.show(e.message)}})}},onGoToOpportunity:function(e){var t=this.getView().getBindingContext().getObject();var s=t.opptID_opportunityID;this.getOwnerComponent().getModel("userModel").setProperty("/opportunityID",s);var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("ObjectPage",{opportunityID:s})},onSubTaskFilter:function(){var e=this.byId("subTaskTable");var t=e.getBinding("items");var s=this.getView().byId("subTaskFilter").getSelectedKey();var o;if(s==="Open"){o=new sap.ui.model.Filter("subTaskCompleted",sap.ui.model.FilterOperator.EQ,false)}else if(s==="Completed"){o=new sap.ui.model.Filter("subTaskCompleted",sap.ui.model.FilterOperator.EQ,true)}else{o=null}t.filter(o,sap.ui.model.FilterType.Application);this.onReadSubTasksData()},onFilterComments(e){var t=this.getView().byId("idTimeline");var s=this.getView().byId("timelineTasks");var o=new a("opptID_ID",i.EQ,e);t.bindAggregation("content",{template:s,path:"/opportunityTasksComments",filters:o})},onPostComment:function(e){var s=this;var o=e.mParameters.value;this.taskID=this.getView().getBindingContext().getObject().ID;var a=this.getOwnerComponent().getModel("user").getProperty("/firstname");var i={opptID_ID:this.taskID,comment:o,postedBy:a,postedOn:g.getInstance()};s.getView().setBusy(true);var r=s.getView().getModel();r.create("/opportunityTasksComments",i,{success:function(e,t){n.show("New comment added!");s.getView().setBusy(false)},error:function(e){s.getView().setBusy(false);t.error("Comment could not be posted. Please check your input.")}})},onDeleteTaskComment:function(e){var t=this;this.taskID=this.getView().getBindingContext().getObject().ID;var s=e.getSource().getParent().getBindingContext().sPath;t.getView().setBusy(true);var o=t.getView().getModel();o.remove(s,{success:function(){sap.m.MessageToast.show("Comment has been deleted");t.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Comment could not be deleted. Please try again.");t.getView().setBusy(false)}})},onAddNewLink:function(e){this.onDialogOpen("opportunity.opportunity.view.fragments.AddLink")},onSubmitNewLink:function(e){var s=this;var o=this.getView().getBindingContext().getObject().ID;var a=this.getView().getModel("localModel");var i=a.getData();var r={linkName:i.linkName,linkDescription:i.linkDescription,link:i.link,opptID_ID:o};s.getView().setBusy(true);var u=s.getView().getModel();u.create("/opportunityTasksLinks",r,{success:function(e,t){n.show("New Link added!");s.getView().setBusy(false);s.onFilterLinkList(o)},error:function(e){s.getView().setBusy(false);t.error("Link could not be posted. Please try again.")}})},onFilterLinkList:function(e){var t=this.getView().byId("linkListItem");var s=new sap.ui.model.Sorter("linkName",true);var o=new a("opptID_ID",i.EQ,e);this.getView().byId("linkList").bindAggregation("items",{template:t,path:"/opportunityTasksLinks",sorter:s,filters:o})},onDeleteLink:function(e){var s=this;var o=e.mParameters.listItem.getBindingContext();var a=o.getPath();var i=o.getObject("linkName");t.confirm("Are you sure you want to delete the link '"+i+"'?",function(e){if(e===t.Action.OK){s.getView().setBusy(true);var o=s.getView().getModel();o.remove(a,{success:function(){sap.m.MessageToast.show("Link deleted successfully.");s.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Link could not be deleted. Please try again.");s.getView().setBusy(false)}})}})},onSelectLink:function(e){var t=e.getSource().getBindingContext().getObject().link;c.URLHelper.redirect(t,true)}})});