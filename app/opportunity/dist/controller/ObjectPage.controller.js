sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/m/MessageToast","../model/formatter","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/ui/model/FilterType","sap/ui/core/routing/History"],function(e,t,o,i,a,r,n,s,c,g){"use strict";var d=this;return e.extend("opportunity.opportunity.controller.ObjectPage",{formatter:i,onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched,this);var e=new a({});this.getView().setModel(e,"pageModel");var t=new a({editMode:false});this.getView().setModel(t,"editModel");var o=new a({});this.getView().setModel(o,"AddTaskModel");var i=new a({});this.getView().setModel(o,"editPageModel")},_onRoutePatternMatched:function(e){var t=this.getView().getModel();var o=e.getParameter("arguments").opportunityID;this.getView().bindElement({path:"/opportunityHeader/"+o,parameters:{expand:"actionItems"}});t.setDefaultBindingMode("TwoWay");this.onReadModelData(o);this.onSetLayout()},onPress:function(e){var t=e.getSource().getBindingContext().getObject();var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("TaskDetail",{opportunityID:t.opportunityID})},onSetLayout:function(){var e=this.getView().byId("TopicFiltersObject");var t=e.getBindingInfo("content").template;e.bindAggregation("content",{path:"/opportunityTopicsVH",template:t,sorter:new sap.ui.model.Sorter("topic",false)});e.getBindingInfo("content").binding.refresh();var o=this.getView().byId("DeliverablesFiltersObject");var i=o.getBindingInfo("content").template;o.bindAggregation("content",{path:"/opportunityDeliverablesVH",template:i,sorter:new sap.ui.model.Sorter("deliverable",false)});o.getBindingInfo("content").binding.refresh()},onReadModelData:function(e){var t=this.getView().getModel();var o;if(e)o=e;else o=this.getView().getBindingContext().getObject().opportunityID;var i=[];i.push(new r("opportunityID",n.EQ,o));var a=this.getView().getModel("pageModel");t.read("/opportunityHeader",{urlParameters:{$expand:"actionItems/subTasks,topics,deliverables"},filters:i,success:function(e){var t=e.results[0].actionItems.results;var o=e.results[0].topics.results;var i=e.results[0].deliverables.results;a.setProperty("/actionItems",t);a.setProperty("/topics",o);a.setProperty("/deliverables",i)}.bind(this),error:function(e){console.log(e)}})},_getText:function(e,t){return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(e,t)},onNavBackPress:function(e){var o=this.getView().getModel();var i=g.getInstance();var a=i.getPreviousHash();var r=this.getView().getModel("editModel");var n=r.getProperty("/editMode");if(n){t.confirm("Discard changes and navigate back?",{onClose:function(e){if(e===t.Action.OK){var i=sap.ui.core.UIComponent.getRouterFor(this);if(a!==undefined)window.history.go(-1);else i.navTo("MainReport");r.setProperty("/editMode",false);if(o.hasPendingChanges()){o.resetChanges();o.updateBindings()}}}.bind(this)})}else{var s=sap.ui.core.UIComponent.getRouterFor(this);if(a!==undefined)window.history.go(-1);else s.navTo("MainReport")}},onDeleteObjectPress:function(e){var o=this;var i=e.getSource();var a=i.getBindingContext();var r=a.getPath();var n=a.getObject("account");t.confirm("Do you want to delete this opportunity with "+n+"?",function(e){if(e===t.Action.OK){var i=sap.ui.core.UIComponent.getRouterFor(o);i.navTo("MainReport");o.getView().setBusy(true);var a=o.getView().getModel();a.remove(r,{success:function(){sap.m.MessageToast.show("Item deleted successfully.");o.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Item could not be deleted. Please try again.");o.getView().setBusy(false)}})}})},onSaveObjectPress:function(e){var t=this;this._bEdit=true;var i=this.getView().getModel();var a=this.getView().getModel("editModel");var r=this.getView().getModel("editPageModel");var n=this.getView().getModel("editPageModel").getData();var s={account:n.account,clientContactPerson:n.clientContactPerson,marketUnit:n.marketUnit,noteText:this.getView().byId("editRTE").getValue(),opportunityClosedQuarter:n.opportunityClosedQuarter,opportunityCreatedQuarter:n.opportunityCreatedQuarter,opportunityDueDate:n.opportunityDueDate,opportunityStartDate:n.opportunityStartDate,opportunityInCRM:n.opportunityInCRM,opportunityValue:n.opportunityValue,primaryContact:n.primaryContact,priority:n.priority,progress:n.progress,source:n.source,status:this.getView().byId("segmentedStatusObject").getSelectedKey(),ssa:n.ssa,topic:n.topic};var c=this.getView().getBindingContext().sPath;i.update(c,s,{success:function(){o.show("Changes saved successfully!");i.refresh();a.setProperty("/editMode",false);t.onReadModelData()},error:function(e){sap.m.MessageBox.error("Changes could not be saved. Details: "+e.message)}})},onToggleButtonPressed:function(e){var t=this.getView().getModel("editModel");t.setProperty("/editMode",true)},onPressToggle1:function(e){var t=e.getSource();var i=t.getPressed();var a=t.getText();var r=this.getView().getBindingContext();var n=r.getPath();var s=this.getView().getModel();var c={topic:a,opptID_opportunityID:this.getView().getBindingContext().getObject().opportunityID};if(i){var g=n+"/topics";s.create(g,c,{success:function(e,t){o.show("'"+a+"' added!")},error:function(e){sap.m.MessageBox.error("Topic could not be added, try again.")}})}else{var d;var u=t.getCustomData()[0].getValue();var l=s.getProperty(n+"/topics");l.forEach(e=>{if(s.getProperty("/"+e)){var t=s.getProperty("/"+e).topic;if(t===u){d="/"+e}}});s.remove(d,{success:function(e,i){t.setEnabled(false);o.show("'"+u+"' removed!")},error:function(e){sap.m.MessageBox.error("Topic '"+u+"' could not be removed, try again.")}})}},onPressToggle2:function(e){var t=e.getSource();var i=t.getPressed();var a=t.getText();var r=this.getView().getBindingContext();var n=r.getPath();var s=this.getView().getModel();var c={deliverable:a,opptID_opportunityID:this.getView().getBindingContext().getObject().opportunityID};if(i){var g=n+"/deliverables";s.create(g,c,{success:function(e,t){o.show("'"+a+"' added!")},error:function(e){sap.m.MessageBox.error("Deliverable could not be added, try again.")}})}else{var d;var u=t.getCustomData()[0].getValue();var l=s.getProperty(n+"/deliverables");l.forEach(e=>{var t=s.getProperty("/"+e).deliverable;if(t===u){d="/"+e}});s.remove(d,{success:function(e,i){t.setEnabled(false);o.show("'"+u+"' removed!")},error:function(e){sap.m.MessageBox.error("Deliverable '"+u+"' could not be removed, try again.")}})}},onCRMCheckboxSelect:function(e){var t=e.getSource();var o=this.byId("opportunityInCRMText");var i=t.getSelected();var a=i?"Yes":"No";o.setText(a)},onCancelObjectPress:function(e){var t=e.getSource();var o=this.getView().getModel("editModel");o.setProperty("/editMode",false);var i=this.getView().getModel();i.resetChanges();i.updateBindings()},onEditObjectPress:function(e){var t=e.getSource();var o=this.getView().getModel("editModel");o.setProperty("/editMode",true);this.onSetEditPageModel()},onSetEditPageModel:function(e){var t=this.getView().getBindingContext().getObject();var o=this.getView().getModel("editPageModel");o.setData(t)},onSegmentPressed:function(e){this.onSetEditPageModel();var t=this.getView().getModel("editModel");t.setProperty("/editMode",true);var o=e.getSource().getSelectedKey();this.getView().getModel("editPageModel").getData().status=o},onSubmitNewTask:function(e){var t=this;var i=e.getSource().getParent().getParent();var a=this.getView().getModel("AddTaskModel");var r=a.getData();if(this._bEdit){this._bEdit=false;this.onSubmitEditedTask()}else{var n=this.getView().getBindingContext().getObject().opportunityID;var s=this.getView().getBindingContext().getObject().account;var c;if(r.actionDueDate)c=new Date(r.actionDueDate).toISOString().split("T")[0];var g;if(r.actionPriority==="High")g=1;else if(r.actionPriority==="Medium")g=2;else if(r.actionPriority==="Low")g=3;var d={actionDueDate:c,actionCustomer:s,actionOwner:r.actionOwner,actionProgress:r.actionProgress,actionTopic:r.actionTopic,actionTask:r.actionTask,actionTitle:r.actionTitle,actionPriority:r.actionPriority,actionPriorityNumber:g,opptID_opportunityID:n};var u="/opportunityHeader("+n+")/actionItems";var l=this.getView().getModel();l.create(u,d,{success:function(e,r){o.show("New Task created!");t.onReadModelData();i.close();a.setData({})},error:function(e){sap.m.MessageBox.error("Task could not be created, check your input and try again.")}});this._bEdit=false}},onAddTopicPress:function(){this.onDialogOpen("opportunity.opportunity.view.fragments.AddTopic")},onAddDeliverablePress:function(){this.onDialogOpen("opportunity.opportunity.view.fragments.AddDeliverable")},onAddToDoPress:function(){var e=this;this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDo")},onDialogOpen:function(e){var t=this;if(!this._pDialog){this._pDialog=s.load({name:e,controller:this}).then(function(e){t.getView().addDependent(e);e.setEscapeHandler(function(){t.onCloseDialog()});return e})}this._pDialog.then(function(e){e.open()})},onCancelDialogPress:function(e){this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;var t=this.getView().getModel("AddTaskModel");t.setData({})},onSubmitTopic:function(e){var i=this;var a=sap.ui.getCore().byId("topicDialog");var r=sap.ui.getCore().byId("topicInput");var n=r.getValue();var s=this.getView().getModel("pageModel").getData().topics;if(n!=""&&r!=null){t.warning("Are you sure you want to post the topic "+n+" to the DataBase? This action is not reversible.",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var c=s.some(e=>e.topic.toUpperCase()===n.toUpperCase());if(c){t.error("This topic already exists!");r.setValue("");a.close()}else{var g={topic:n};i.getView().setBusy(true);var d=i.getView().getModel();d.create("/opportunityTopicsVH",g,{success:function(e,t){o.show("New topic posted!");a.close();r.setValue("");i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false);t.error("Topic could not be posted. Please check your input.")}})}}else{r.setValue("");i.getView().setBusy(false)}}})}else o.show("Enter a new topic first")},onSubmitDeliverable:function(e){var i=this;var a=sap.ui.getCore().byId("deliverableDialog");var r=sap.ui.getCore().byId("deliverableInput");var n=r.getValue();var s=this.getView().getModel("pageModel").getData().deliverables;if(n!=""&&r!=null){t.warning("Are you sure you want to post the deliverable "+n+" to the DataBase? This action is not reversible.",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var c=s.some(e=>e.deliverable.toUpperCase()===n.toUpperCase());if(c){t.error("This deliverable already exists!");r.setValue("");a.close()}else{var g={deliverable:n};i.getView().setBusy(true);var d=i.getView().getModel();d.create("/opportunityDeliverablesVH",g,{success:function(e,t){o.show("New deliverable posted!");a.close();r.setValue("");i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false);t.error("Deliverable could not be posted. Please check your input.")}})}}else{r.setValue("");i.getView().setBusy(false)}}})}else o.show("Enter a new deliverable first")},onFavoriteObjectPress:function(e){var t=this;var o=this.getView();var i=o.getBindingContext();var a=i.getPath();var r=o.getBindingContext().getObject();var n=r.isFavorite;if(n===true){n=false;t.postFavouriteCustomer(n,r,a)}else{n=true;t.postFavouriteCustomer(n,r,a)}},postFavouriteCustomer:function(e,t,i){var a=this;if(e===true){t.isFavorite=true}else{t.isFavorite=false}var r={isFavorite:t.isFavorite};var n=this.getView().getModel();n.update(i,r,{success:function(){var i="";if(e===true){i="'"+t.account+"' added to favorites"}else{i="'"+t.account+"' removed from favorites"}o.show(i)},error:function(e){o.show(e.message)}})},beforeRebindChart:function(e){var t=this.getView().getBindingContext().getObject().opportunityID;var o=e.getParameter("bindingParams");var i=new r("opportunityID",n.EQ,t);o.filters.push(i)},onGridListItemPress:function(e){var t=e.getSource().getBindingContext("pageModel").getObject();var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("TaskDetail",{ID:t.ID})},onPopoverPress:function(e){var t=e.getSource(),o=this.getView(),i=e.getSource().getBindingContext("pageModel").sPath;this._pPopover=s.load({id:o.getId(),name:"opportunity.opportunity.view.fragments.TaskPopover3",controller:this}).then(function(e){o.addDependent(e);e.bindElement({path:"pageModel>"+i,events:{change:function(){e.invalidate()}}});return e});this._pPopover.then(function(e){e.attachAfterClose(function(){e.destroy()}.bind(this));e.openBy(t)})},onSearchTaskList:function(e){var t=[];var o=e.getSource().getValue();if(o&&o.length>0){var t=[new r({filters:[new r({path:"actionTitle",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionTask",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionCustomer",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionTopic",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionOwner",operator:n.Contains,value1:o,caseSensitive:false})],and:false})]}var i=this.byId("gridList");var a=i.getBinding("items");a.filter(t,c.Application)},onGridListItemEdit:function(e){this._bEdit=true;this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDo");var t=this.getView().getModel("AddTaskModel");var o=e.getSource().getBindingContext("pageModel").getObject();o.actionDueDate=new Date(o.actionDueDate).toISOString().split("T")[0];t.setData(o)},onSubmitEditedTask:function(){var e=this;var i=this.getView().getModel();var a=this.getView().getModel("AddTaskModel");var r=a.getData();var n=r.ID;var s=this.getView().getModel("pageModel");var c;if(r.actionPriority==="High")c=1;else if(r.actionPriority==="Medium")c=2;else if(r.actionPriority==="Low")c=3;var g={actionDueDate:new Date(r.actionDueDate).toISOString().split("T")[0],actionOwner:r.actionOwner,actionPriority:r.actionPriority,actionPriorityNumber:c,actionProgress:r.actionProgress,actionTask:r.actionTask,actionTitle:r.actionTitle,actionTopic:r.actionTopic};var d="/opportunityActionItems("+n+")";i.update(d,g,{success:function(){o.show("success");e.onCancelDialogPress();s.updateBindings()},error:function(e){t.error("The task could not be updated: "+e.message)}})},onGridListItemDelete:function(e){var i=this;var a=this.getView().getModel();var r=e.getParameters().listItem.getBindingContext("pageModel").getObject();t.warning("Are you sure you want to delete the Task '"+r.actionTitle+"'?",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){i.getView().setBusy(true);var n=r.ID;var s="/opportunityActionItems("+n+")";a.remove(s,{success:function(e){o.show("Task deleted");i.onReadModelData();i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false)}})}}})},onCRMCheckboxSelect:function(e){this.onSetEditPageModel();var t=this.getView().getModel("editModel");var o=this.getView().getModel("editPageModel");var i=e.getSource();var a=i.getSelected();var r=a?"Yes":"No";i.setText(r);t.setProperty("/editMode",true);o.setProperty("/opportunityInCRM",r)}})});