sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/m/MessageToast","../model/formatter","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/Fragment","sap/ui/model/FilterType","sap/ui/core/routing/History","sap/ui/core/date/UI5Date","sap/ui/core/format/DateFormat","sap/m/library","sap/ui/core/library"],function(e,t,o,i,a,r,n,s,l,u,c,d,g,p){"use strict";var v=this;var h=p.ValueState,y={valueState:h.None,valueStateText:""};return e.extend("opportunity.opportunity.controller.ObjectPage",{formatter:i,onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched,this);var e=new a({});this.getView().setModel(e,"pageModel");var t=new a({editMode:false});this.getView().setModel(t,"editModel");var o=new a({});this.getView().setModel(o,"AddTaskModel");var i=new a({});this.getView().setModel(i,"editPageModel");var r=this.getView();r.setModel(new a({}),"viewModel");r.setModel(new sap.ui.model.json.JSONModel({}),"localModel");r.setModel(new sap.ui.model.json.JSONModel(y),"valueState")},_onRoutePatternMatched:function(e){var t=this.getView().getModel();var o=e.getParameter("arguments").opportunityID;if(!o)var o=this.getOwnerComponent.getModel("userModel").getProperty("/opportunityID");this.getOwnerComponent().getModel("userModel").setProperty("/opportunityID",o);this.getView().bindElement({path:"/opportunityHeader/"+o,parameters:{expand:"actionItems,comments,deliverables,links"}});this.sOpportunityID=o;this.onFilterComments(o);this.onFilterLinkList(o);this.onFilterNextSteps(o);t.setDefaultBindingMode("TwoWay");this.onReadModelData(o);this.onSetLayout();var i=this.getView().byId("maturityTableID");if(i.isInitialised())i.rebindTable();var a=this.getView().byId("activitiesTableID");if(a.isInitialised())a.rebindTable();this.onReadTopics();this.onReadDeliverables()},onFilterLinkList:function(e){var t=this.getView().byId("linkListItem");var o=new sap.ui.model.Sorter("linkName",true);var i=new r("opptID_opportunityID",n.EQ,e);this.getView().byId("linkList").bindAggregation("items",{template:t,path:"/opportunityLinks",sorter:o,filters:i})},onDeleteLink:function(e){var o=this;var i=e.mParameters.listItem.getBindingContext();var a=i.getPath();var r=i.getObject("linkName");t.confirm("Are you sure you want to delete the link '"+r+"'?",function(e){if(e===t.Action.OK){o.getView().setBusy(true);var i=o.getView().getModel();i.remove(a,{success:function(){sap.m.MessageToast.show("Link deleted successfully.");o.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Link could not be deleted. Please try again.");o.getView().setBusy(false)}})}})},onAddNewLink:function(e){this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddLink")},onSubmitNewLink:function(e){var i=this;this.customerID=this.getView().getBindingContext().getObject().opportunityID;var a=this.customerID;var r=this.getView().getModel("localModel");var n=r.getData();if(n.linkName&&n.link){this.resetValueState();var s={linkName:n.linkName,linkDescription:n.linkDescription,link:n.link,opptID_opportunityID:this.customerID};i.getView().setBusy(true);var l=i.getView().getModel();l.create("/opportunityLinks",s,{success:function(e,t){o.show("New Link added!");i.getView().setBusy(false);i.onCancelDialogPress();i.onFilterLinkList(a)},error:function(e){i.getView().setBusy(false);t.error("Link could not be posted. Please try again.")}})}else this.ValueStateMethod()},onTabItemSwitch:function(e){if(e.mParameters.item){var t=e.mParameters.item.getKey()}else var t=window.location.href.split("#")[1].split("/")[2];var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("ObjectPage",{opportunityID:t});sap.ui.core.UIComponent.getRouterFor(this).getRoute("ObjectPage").attachPatternMatched(this._onRoutePatternMatched,this)},onPress:function(e){var t=e.getSource().getBindingContext().getObject();var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("TaskDetail",{opportunityID:t.opportunityID})},onSetLayout:function(){var e=this.getView().byId("TopicFiltersObject");var t=e.getBindingInfo("content").template;e.bindAggregation("content",{path:"/opportunityTopicsVH",template:t,sorter:new sap.ui.model.Sorter("topic",false)});var o=this.getView().byId("DeliverablesFiltersObject");var i=o.getBindingInfo("content").template;o.bindAggregation("content",{path:"/opportunityDeliverablesVH",template:i,sorter:new sap.ui.model.Sorter("deliverable",false)})},onReadModelData:function(e){var t=this.getView().getModel();var o;if(e)o=e;else o=this.getView().getBindingContext().getObject().opportunityID;var i=[];i.push(new r("opportunityID",n.EQ,o));var a=this.getView().getModel("pageModel");t.read("/opportunityHeader",{urlParameters:{$expand:"actionItems/subTasks,topics,deliverables,maturity"},filters:i,success:function(e){var t=e.results[0].actionItems.results;var o=e.results[0].topics.results;var i=e.results[0].deliverables.results;a.setProperty("/actionItems",t);a.setProperty("/topics",o);a.setProperty("/deliverables",i)}.bind(this),error:function(e){console.log(e)}})},_getText:function(e,t){return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(e,t)},onNavBackPress:function(e){var o=this.getView().getModel();var i=u.getInstance();var a=i.getPreviousHash();var r=this.getView().getModel("editModel");var n=r.getProperty("/editMode");if(n){t.confirm("Discard changes and navigate back?",{onClose:function(e){if(e===t.Action.OK){var i=sap.ui.core.UIComponent.getRouterFor(this);if(a!==undefined)window.history.go(-1);else i.navTo("MainReport");r.setProperty("/editMode",false);if(o.hasPendingChanges()){o.resetChanges();o.updateBindings()}}}.bind(this)})}else{var s=sap.ui.core.UIComponent.getRouterFor(this);if(a!==undefined)window.history.go(-1);else s.navTo("MainReport")}},onDeleteObjectPress:function(e){var o=this;var i=e.getSource();var a=i.getBindingContext();var r=a.getPath();var n=a.getObject("account");t.confirm("Do you want to delete this opportunity with "+n+"?",function(e){if(e===t.Action.OK){var i=sap.ui.core.UIComponent.getRouterFor(o);i.navTo("MainReport");o.getView().setBusy(true);var a=o.getView().getModel();a.remove(r,{success:function(){sap.m.MessageToast.show("Item deleted successfully.");o.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Item could not be deleted. Please try again.");o.getView().setBusy(false)}})}})},onSaveObjectPress:function(e){var t=this;this._bEdit=true;var i=this.getView().getModel();var a=this.getView().getModel("editModel");var r=this.getView().getModel("editPageModel");var n=this.getView().getModel("editPageModel").getData();if(n.account&&n.marketUnit){this.resetValueState();const e=["January","February","March","April","May","June","July","August","September","October","November","December"];const r=new Date;var s=e[r.getMonth()];var l={account:n.account,clientContactPerson:n.clientContactPerson,marketUnit:n.marketUnit,noteText:this.getView().byId("editRTE").getValue(),opportunityClosedQuarter:n.opportunityClosedQuarter,opportunityCreatedQuarter:n.opportunityCreatedQuarter,opportunityDueDate:n.opportunityDueDate,opportunityStartDate:n.opportunityStartDate,opportunityInCRM:n.opportunityInCRM,opportunityValue:n.opportunityValue,primaryContact:n.primaryContact,priority:n.priority,progress:n.progress,source:n.source,status:this.getView().byId("segmentedStatusObject").getSelectedKey(),ssa:n.ssa,topic:n.topic,valueMonth:s,valueYear:(new Date).getFullYear().toString(),adoption:n.adoption,consumption:n.consumption};var u=this.getView().getBindingContext().sPath;i.update(u,l,{success:function(){o.show("Changes saved successfully!");i.refresh();a.setProperty("/editMode",false);t.onReadModelData()},error:function(e){sap.m.MessageBox.error("Changes could not be saved. Details: "+e.message)}})}else this.ValueStateMethod()},onToggleButtonPressed:function(e){var t=this.getView().getModel("editModel");t.setProperty("/editMode",true)},onPressToggle1:function(e){var t=e.getSource();var i=t.getPressed();var a=t.getText();var r=this.getView().getBindingContext();var n=r.getPath();var s=this.getView().getModel();var l={topic:a,opptID_opportunityID:this.getView().getBindingContext().getObject().opportunityID};if(i){var u=n+"/topics";s.create(u,l,{success:function(e,t){o.show("'"+a+"' added!")},error:function(e){sap.m.MessageBox.error("Topic could not be added, try again.")}})}else{var c;var d=t.getCustomData()[0].getValue();var g=s.getProperty(n+"/topics");g.forEach(e=>{if(s.getProperty("/"+e)){var t=s.getProperty("/"+e).topic;if(t===d){c="/"+e}}});s.remove(c,{success:function(e,i){t.setEnabled(false);o.show("'"+d+"' removed!")},error:function(e){sap.m.MessageBox.error("Topic '"+d+"' could not be removed, try again.")}})}},onPressToggle2:function(e){var t=e.getSource();var i=t.getPressed();var a=t.getText();var r=this.getView().getBindingContext();var n=r.getPath();var s=this.getView().getModel();var l={deliverable:a,opptID_opportunityID:this.getView().getBindingContext().getObject().opportunityID};if(i){var u=n+"/deliverables";s.create(u,l,{success:function(e,t){o.show("'"+a+"' added!")},error:function(e){sap.m.MessageBox.error("Deliverable could not be added, try again.")}})}else{var c;var d=t.getCustomData()[0].getValue();var g=s.getProperty(n+"/deliverables");g.forEach(e=>{var t=s.getProperty("/"+e).deliverable;if(t===d){c="/"+e}});s.remove(c,{success:function(e,i){t.setEnabled(false);o.show("'"+d+"' removed!")},error:function(e){sap.m.MessageBox.error("Deliverable '"+d+"' could not be removed, try again.")}})}},onCRMCheckboxSelect:function(e){var t=e.getSource();var o=this.byId("opportunityInCRMText");var i=t.getSelected();var a=i?"Yes":"No";o.setText(a)},onCancelObjectPress:function(e){var t=this.getView().getModel("editModel");t.setProperty("/editMode",false);var o=this.getView().getModel();o.resetChanges();o.updateBindings()},onEditObjectPress:function(e){var t=this.getView().getModel("editModel");t.setProperty("/editMode",true);this.onSetEditPageModel();this.resetValueState()},onSetEditPageModel:function(e){var t=this.getView().getBindingContext().getObject();var o=this.getView().getModel("editPageModel");o.setData(t)},onSegmentPressed:function(e){this.onSetEditPageModel();var t=this.getView().getModel("editModel");t.setProperty("/editMode",true);var o=e.getSource().getSelectedKey();this.getView().getModel("editPageModel").getData().status=o},onSubmitNewTask:function(e){var t=this;var i=this.getView().getModel("AddTaskModel");var a=i.getData();if(a.actionTask&&a.actionTitle){this.resetValueState();if(this._bEdit){this._bEdit=false;this.onSubmitEditedTask()}else{var r=this.getView().getBindingContext().getObject().opportunityID;var n=this.getView().getBindingContext().getObject().account;var s;if(a.actionDueDate)s=new Date(a.actionDueDate).toISOString().split("T")[0];var l;if(a.actionPriority==="High")l=1;else if(a.actionPriority==="Medium")l=2;else if(a.actionPriority==="Low")l=3;var u={actionDueDate:s,actionCustomer:n,actionOwner:a.actionOwner,actionProgress:a.actionProgress,actionTopic:a.actionTopic,actionTask:a.actionTask,actionTitle:a.actionTitle,actionPriority:a.actionPriority,actionPriorityNumber:l,opptID_opportunityID:r};var c="/opportunityHeader("+r+")/actionItems";var d=this.getView().getModel();d.create(c,u,{success:function(e,i){o.show("New Task created!");t.onReadModelData();t.onCancelDialogPress()},error:function(e){sap.m.MessageBox.error("Task could not be created, check your input and try again.")}});this._bEdit=false}}else this.ValueStateMethod()},onAddTopicPress:function(){this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddTopic")},onAddDeliverablePress:function(){this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddDeliverable")},onAddToDoPress:function(){var e=this;this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddToDo")},onDialogOpen:function(e){this.resetValueState();var t=this;if(!this._pDialog){this._pDialog=s.load({name:e,controller:this}).then(function(e){t.getView().addDependent(e);e.setEscapeHandler(function(){t.onCloseDialog()});return e})}this._pDialog.then(function(e){e.open()})},onCancelDialogPress:function(e){this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;var t=this.getView().getModel("AddTaskModel");var o=this.getView().getModel("localModel");t.setData({});o.setData({})},onFavoriteObjectPress:function(e){var t=this;var o=this.getView();var i=o.getBindingContext();var a=i.getPath();var r=o.getBindingContext().getObject();var n=r.isFavorite;if(n===true){n=false;t.postFavouriteCustomer(n,r,a)}else{n=true;t.postFavouriteCustomer(n,r,a)}},postFavouriteCustomer:function(e,t,i){var a=this;if(e===true){t.isFavorite=true}else{t.isFavorite=false}var r={isFavorite:t.isFavorite};var n=this.getView().getModel();n.update(i,r,{success:function(){var i="";if(e===true){i="'"+t.account+"' added to favorites"}else{i="'"+t.account+"' removed from favorites"}o.show(i)},error:function(e){o.show(e.message)}})},beforeRebindChart:function(e){var t=this.getOwnerComponent().getModel("userModel").getProperty("/opportunityID");var o=e.getParameter("bindingParams");if(this.getView().getBindingContext()){var i=this.getView().getBindingContext().getObject().marketUnit;var a=new r("marketUnit",n.EQ,i);o.filters.push(a)}},onGridListItemPress:function(e){var t=e.getSource().getBindingContext("pageModel").getObject();var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("TaskDetail",{ID:t.ID})},onPopoverPress:function(e){var t=e.getSource(),o=this.getView(),i=e.getSource().getBindingContext("pageModel").sPath;this._pPopover=s.load({id:o.getId(),name:"opportunity.opportunity.view.fragments.taskPopover.TaskPopover3",controller:this}).then(function(e){o.addDependent(e);e.bindElement({path:"pageModel>"+i,events:{change:function(){e.invalidate()}}});return e});this._pPopover.then(function(e){e.attachAfterClose(function(){e.destroy()}.bind(this));e.openBy(t)})},onSearchTaskList:function(e){var t=[];var o=e.getSource().getValue();if(o&&o.length>0){var t=[new r({filters:[new r({path:"actionTitle",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionTask",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionCustomer",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionTopic",operator:n.Contains,value1:o,caseSensitive:false}),new r({path:"actionOwner",operator:n.Contains,value1:o,caseSensitive:false})],and:false})]}var i=this.byId("gridList");var a=i.getBinding("items");a.filter(t,l.Application)},onGridListItemEdit:function(e){this._bEdit=true;this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddToDo");var t=this.getView().getModel("AddTaskModel");var o=e.getSource().getBindingContext("pageModel").getObject();if(o.actionDueDate)o.actionDueDate=new Date(o.actionDueDate).toISOString().split("T")[0];t.setData(o)},onSubmitEditedTask:function(){var e=this;var i=this.getView().getModel();var a=this.getView().getModel("AddTaskModel");var r=a.getData();var n=r.ID;var s;var l=this.getView().getModel("pageModel");var u;if(r.actionPriority==="High")u=1;else if(r.actionPriority==="Medium")u=2;else if(r.actionPriority==="Low")u=3;if(r.actionDueDate)s=new Date(r.actionDueDate).toISOString().split("T")[0];var c={actionDueDate:s,actionOwner:r.actionOwner,actionPriority:r.actionPriority,actionPriorityNumber:u,actionProgress:r.actionProgress,actionTask:r.actionTask,actionTitle:r.actionTitle,actionTopic:r.actionTopic};var d="/opportunityActionItems("+n+")";i.update(d,c,{success:function(){o.show("Task updated successfully");e.onCancelDialogPress();l.updateBindings()},error:function(e){t.error("The task could not be updated: "+e.message)}})},onGridListItemDelete:function(e){var i=this;var a=this.getView().getModel();var r=e.getParameters().listItem.getBindingContext("pageModel").getObject();t.warning("Are you sure you want to delete the Task '"+r.actionTitle+"'?",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){i.getView().setBusy(true);var n=r.ID;var s="/opportunityActionItems("+n+")";a.remove(s,{success:function(e){o.show("Task deleted");i.onReadModelData();i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false)}})}}})},onCRMCheckboxSelect:function(e){this.onSetEditPageModel();var t=this.getView().getModel("editModel");var o=this.getView().getModel("editPageModel");var i=e.getSource();var a=i.getSelected();var r=a?"Yes":"No";i.setText(r);t.setProperty("/editMode",true);o.setProperty("/opportunityInCRM",r)},onWizardDialogPress:function(e){var t=this;t.getView().setBusy(true);if(!this._oDialog){this._oDialog=s.load({name:"opportunity.opportunity.view.fragments.WizardDialog",controller:this})}this._oDialog.then(function(e){t.getView().addDependent(e);e.open();t.onReadTopics();t.onReadDeliverables();var o=sap.ui.getCore().byId("TopicFilters");var i=o.getBindingInfo("content").template;o.bindAggregation("content",{path:"/opportunityTopicsVH",template:i,sorter:new sap.ui.model.Sorter("topic",false)});o.getBindingInfo("content").binding.refresh();var a=sap.ui.getCore().byId("DeliverablesFilters");var r=a.getBindingInfo("content").template;a.bindAggregation("content",{path:"/opportunityDeliverablesVH",template:r,sorter:new sap.ui.model.Sorter("deliverable",false)});a.getBindingInfo("content").binding.refresh()})},onSaveWizardPress:function(e){var t=this;t.getView().setBusy(true);var i=this.getView().getModel("viewModel");var a=i.getData();var r,n,s,l;l=(new Date).toISOString().split("T")[0];if(a.opportunityStartDate)r=new Date(a.opportunityStartDate).toISOString().split("T")[0];if(a.opportunityDueDate)n=new Date(a.opportunityDueDate).toISOString().split("T")[0];if(a.opportunityInCRM)s="Yes";else s="No";var u=sap.ui.getCore().byId("segmentedStatus").getSelectedKey();var c=[];var d=sap.ui.getCore().byId("TopicFilters").getContent();d.forEach(e=>{if(e.getPressed()){var t={topic:e.getText()};c.push(t)}});var g=[];var p=sap.ui.getCore().byId("DeliverablesFilters").getContent();p.forEach(e=>{if(e.getPressed()){var t={deliverable:e.getText()};g.push(t)}});var v={account:a.account,topic:a.topic,marketUnit:a.marketUnit,opportunityStartDate:r,opportunityStartDate:n,opportunityValue:a.opportunityValue,opportunityInCRM:s,source:a.source,ssa:a.ssa,clientContactPerson:a.clientContactPerson,status:u,primaryContact:a.primaryContact,opportunityCreatedQuarter:a.opportunityCreatedQuarter,opportunityClosedQuarter:a.opportunityClosedQuarter,priority:a.priority,noteDate:l,noteText:a.noteText,progress:a.progress,topics:c,deliverables:g};var h=this.getView().getModel();h.create("/opportunityHeader",v,{success:function(i,a){var r=t.getOwnerComponent().getModel("tabModel");var n=r.getData().tabs;n.push(i);r.setProperty("/tabs",n);o.show("New Opportunity created!");t.onCloseWizardPress(e);t.getView().setBusy(false)},error:function(e){t.getView().setBusy(false);sap.m.MessageBox.error("Opportunity could not be created. Double check your input.")}})},onSubmitTopic:function(e){var i=this;var a=sap.ui.getCore().byId("topicInput");var r=a.getValue();var n=this.getView().getModel("localModel").getData().topics;if(r!=""&&a!=null){this.resetValueState();t.warning("Are you sure you want to post the topic "+r+" to the DataBase? This action is not reversible.",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var s=n.some(e=>e.topic.toUpperCase()===r.toUpperCase());var l={topic:r};i.getView().setBusy(true);var u=i.getView().getModel();u.create("/opportunityTopicsVH",l,{success:function(e,t){o.show("New topic posted!");i.onCancelDialogPress();a.setValue("");i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false);t.error("Topic could not be posted. Please check your input.")}})}else{a.setValue("");i.getView().setBusy(false)}}})}else this.ValueStateMethod()},onSubmitDeliverable:function(e){var i=this;var a=sap.ui.getCore().byId("deliverableInput");var r=a.getValue();var n=this.getView().getModel("localModel").getData().deliverables;if(r!=""&&a!=null){this.resetValueState();t.warning("Are you sure you want to post the deliverable "+r+" to the DataBase? This action is not reversible.",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var n={deliverable:r};i.getView().setBusy(true);var s=i.getView().getModel();s.create("/opportunityDeliverablesVH",n,{success:function(e,t){o.show("New deliverable posted!");i.onCancelDialogPress();a.setValue("");i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false);t.error("Deliverable could not be posted. Please check your input.")}})}else{a.setValue("");i.getView().setBusy(false)}}})}this.ValueStateMethod()},onSelectAllTopicsPress:function(e){sap.ui.getCore().byId("TopicFilters").getContent().forEach(function(e){var t=e.getPressed();e.setPressed(!t)})},onSelectAllDeliverablesPress:function(e){sap.ui.getCore().byId("DeliverablesFilters").getContent().forEach(function(e){var t=e.getPressed();e.setPressed(!t)})},onCloseWizardPress:function(e){var t=sap.ui.getCore().byId("myWizardDialog");t.close();var o=sap.ui.getCore().byId("WizardDialog");o.setCurrentStep("WizardStep1");this.getView().getModel("viewModel").setData({});this.getView().setBusy(false)},onCRMCheckboxSelect:function(e){var t=e.getSource();var o=t.getSelected();var i=o?"Yes":"No";t.setText(i)},onFullScreenButtonPress:function(e){var t=e.getSource().getParent().getParent();var o=t.getContentWidth();if(o=="70%"){t.setContentWidth("100%");t.setContentHeight("100%");e.getSource().setIcon("sap-icon://exit-full-screen")}else{t.setContentWidth("70%");t.setContentHeight("80%");e.getSource().setIcon("sap-icon://full-screen")}},onPreviousStep:function(e){sap.ui.getCore().byId("WizardDialog").previousStep()},onToggleInCRM:function(e){var t=e.getSource().getPressed();var o=t?"Yes":"No";e.getSource().setText(o);var i=t?"Yes":"";var a=new r("opportunityInCRM",n.Contains,i);var s=this.getView().byId("mainTable");s.getBinding("items").filter(a)},onReadTopics:function(){var e=this;e.getView().setBusy(true);var t=e.getView().getModel("localModel");var o=e.getView().getModel();o.read("/opportunityTopics",{urlParameters:{$orderby:"topic"},success:function(e){var o=e.results;t.setProperty("/topics",o)}.bind(this),error:function(e){console.log(e)}})},onReadDeliverables:function(){var e=this;e.getView().setBusy(true);var t=e.getView().getModel("localModel");var o=e.getView().getModel();o.read("/opportunityDeliverables",{urlParameters:{$orderby:"deliverable"},success:function(o){var i=o.results;t.setProperty("/deliverables",i);e.getView().setBusy(false)}.bind(this),error:function(t){console.log(t);e.getView().setBusy(false)}})},onFilterComments(e){var t=this.getView().byId("opportunityComments");var o=this.getView().byId("commentItem");var i=new sap.ui.model.Sorter("postedOn",true);var a=new r("opptID_opportunityID",n.EQ,e);t.bindAggregation("items",{template:o,path:"/opportunityComments",sorter:i,filters:a});t.updateBindings()},onPostComment:function(e){var i=this;var a=e.mParameters.value;this.customerID=this.getView().getBindingContext().getObject().opportunityID;var r=this.getOwnerComponent().getModel("user").getProperty("/firstname");var n={comment:a,postedBy:r,postedOn:c.getInstance(),opptID_opportunityID:this.customerID};i.getView().setBusy(true);var s=i.getView().getModel();s.create("/opportunityComments",n,{success:function(e,t){o.show("New comment added!");i.getView().setBusy(false)},error:function(e){i.getView().setBusy(false);t.error("Comment could not be posted. Please check your input.")}})},onDeleteComment:function(e){var t=this;this.customerID=this.getView().getBindingContext().getObject().opportunityID;var o=e.mParameters.listItem.getBindingContext().sPath;t.getView().setBusy(true);var i=t.getView().getModel();i.remove(o,{success:function(){sap.m.MessageToast.show("Comment has been deleted");t.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Comment could not be deleted. Please try again.");t.getView().setBusy(false)}})},onBeforeRebindActivitiesTable:function(e){var t=e.getParameter("bindingParams");var o=new r("opptID_opportunityID",n.EQ,this.sOpportunityID);t.filters.push(o);var i=new sap.ui.model.Sorter("completed",true);t.sorter.push(i)},onActivityCompletedCheck:function(e){var i=e.mParameters.selected;var a=e.getSource().getBindingContext().sPath;var r=e.getSource().getBindingContext().getObject().deliverable;var n=this.getView().getModel();var s={completed:i,completedOn:new Date};n.update(a,s,{success:function(){if(i==true)o.show("'"+r+"' is completed");if(i!==true)o.show("'"+r+"' is uncompleted")},error:function(e){if(i==true)t.error("'"+r+"' could not be completed. Please try again.");if(i!==true)t.error("'"+r+"' could not be marked as uncompleted. Please try again.")}})},onBeforeRebindMaturityTable:function(e){var t=e.getParameter("bindingParams");var o=new r("opptID_opportunityID",n.EQ,this.sOpportunityID);t.filters.push(o);var i=new sap.ui.model.Sorter("topic",true);t.sorter.push(i)},onAddActivityPress:function(){this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddActivity")},onSubmitActivity:function(e){var i=this;var a=this.getView().getModel("AddTaskModel");var r=a.getData();if(r.deliverable){this.resetValueState();this.sOpportunityID=this.getView().getBindingContext().getObject().opportunityID;var n,s;var l=false;if(r.deliverableDate)n=new Date(r.deliverableDate).toISOString().split("T")[0];if(r.completedOn){s=new Date(r.completedOn).toISOString().split("T")[0];l=true}var u={deliverable:r.deliverable,deliverableDate:n,completed:l,completedOn:s,primaryContact:r.primaryContact,shortDescription:r.shortDescription,status:r.status,opptID_opportunityID:this.sOpportunityID};i.getView().setBusy(true);var c=i.getView().getModel();c.create("/opportunityDeliverables",u,{success:function(e,t){o.show("New activity added!");i.getView().setBusy(false);i.onCancelDialogPress()},error:function(e){i.getView().setBusy(false);t.error("Activity could not be posted. Please check your input.")}})}else this.ValueStateMethod()},onDeleteActivity:function(e){var o=this;var i=e.mParameters.listItem;var a=i.getBindingContext().getObject().deliverable;t.warning("Are you sure you want to delete the activity '"+a+"'?",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){var a=i.getBindingContextPath();o.getView().setBusy(true);var r=o.getView().getModel();r.remove(a,{success:function(){sap.m.MessageToast.show("Activity has been deleted");o.getView().setBusy(false)},error:function(){sap.m.MessageToast.show("Activity could not be deleted. Please try again.");o.getView().setBusy(false)}})}}})},onRatingChange:function(e){var i=e.getParameters().value;var a=e.getSource().getBindingContext().sPath;var r=e.getSource().getBindingContext().getObject().topic;var n=this.getView().getModel();var s={maturity:i};n.update(a,s,{success:function(){o.show("Maturity Rating for '"+r+"' updated")},error:function(e){t.error("Maturity Rating could not be updated for '"+r+"'. Please try again.")}})},onMaturityEdit:function(e){var t=this.getView().getModel("localModel");this.maturityObject=e.getSource().getBindingContext().getObject();t.setData(this.maturityObject);this.maturityPath=e.getSource().getBindingContext().sPath;this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditMaturity")},onSubmitMaturityComment:function(e){var i=this;var a=this.maturityPath;var r=this.getView().getModel("localModel");var n=r.getData();var s=this.maturityObject.topic;var l=this.getView().getModel();var u={comment:n.comment};l.update(a,u,{success:function(){o.show("Maturity Rating for '"+s+"' updated");r.setData({});i.onCancelDialogPress()},error:function(e){t.error("Maturity Rating could not be updated. Please try again.")}})},onSelectLink:function(e){var t=e.getSource().getBindingContext().getObject().link;g.URLHelper.redirect(t,true)},onEditActivityPress:function(e){var t=this.getView().getModel("localModel");this.deliverableObject=e.getSource().getBindingContext().getObject();t.setData(this.deliverableObject);this.deliverablePath=e.getSource().getBindingContext().sPath;this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditActivity")},onSubmitEditedActivity:function(e){var i=this;var a=e.getSource().getParent().getParent();var r=this.deliverablePath;var n=this.getView().getModel("localModel");var s=n.getData();var l=this.deliverableObject.deliverable;var u=this.getView().getModel();var c={deliverable:s.deliverable,deliverableDate:s.deliverableDate,status:s.status,completed:s.completed,completedOn:s.completedOn,shortDescription:s.shortDescription,primaryContact:s.primaryContact};u.update(r,c,{success:function(){o.show("Activity '"+l+"' updated");n.setData({});i.onCancelDialogPress()},error:function(e){t.error("Activity could not be updated. Please try again.")}})},onFilterNextSteps(e){var t=this.getView().byId("idTimeline");var o=this.getView().byId("timelineTasks");var i=new r("opptID_opportunityID",n.EQ,e);t.bindAggregation("content",{template:o,path:"/opportunityNextSteps",filters:i})},onAddNextStep:function(e){this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddNextStep")},onSubmitNextStep:function(e){var i=this;var a=this.getView().getModel("localModel");var r=a.getData();this.sOpportunityID=this.getView().getBindingContext().getObject().opportunityID;if(r.nextStep){this.resetValueState();var n={nextStep:r.nextStep,nextStepDescription:r.nextStepDescription,completed:r.completed,postedOn:new Date,opptID_opportunityID:this.sOpportunityID};i.getView().setBusy(true);var s=i.getView().getModel();s.create("/opportunityNextSteps",n,{success:function(e,t){o.show("Item added to Roadmap!");i.getView().setBusy(false);i.onCancelDialogPress()},error:function(e){i.getView().setBusy(false);t.error("Item could not be added to Roadmap. Please check your input.")}})}else this.ValueStateMethod()},onEditNextStep:function(e){var t=this.getView().getModel("localModel");this.nextStepObject=e.getSource().getBindingContext().getObject();t.setData(this.nextStepObject);this.nextStepPath=e.getSource().getBindingContext().sPath;this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditNextStep")},onSubmitEditedNextStep:function(e){var i=this;var a=this.nextStepPath;var r=this.getView().getModel("localModel");var n=r.getData();var s=this.nextStepObject.nextStep;if(n.nextStep){this.resetValueState();var l=this.getView().getModel();var u={nextStep:n.nextStep,nextStepDescription:n.nextStepDescription,completed:n.completed};l.update(a,u,{success:function(){o.show("Item '"+s+"' updated");i.onCancelDialogPress()},error:function(e){t.error("Item could not be updated. Please try again.")}})}else this.ValueStateMethod()},onDeleteNextStep:function(e){var o=this;var i=this.nextStepPath;t.warning("Are you sure you want to delete this item?",{actions:[t.Action.OK,t.Action.CANCEL],emphasizedAction:t.Action.OK,onClose:function(e){if(e===t.Action.OK){o.getView().setBusy(true);var a=o.getView().getModel();a.remove(i,{success:function(){sap.m.MessageToast.show("Item has been deleted from the roadmap");o.getView().setBusy(false);o.onCancelDialogPress()},error:function(){sap.m.MessageToast.show("Item could not be deleted from the roadmap. Please try again.");o.getView().setBusy(false)}})}}})},onHorizontalSwitch:function(e){var t=e.getParameters().state;if(t==true){this.getView().byId("idTimeline").setAxisOrientation("Horizontal")}else{this.getView().byId("idTimeline").setAxisOrientation("Vertical")}},ValueStateMethod:function(e){var t=this.getView().getModel("valueState");o.show("Please fill all mandatory fields");t.setProperty("/valueState",h.Error);t.setProperty("/valueStateText","This field is mandatory")},resetValueState:function(e){var t=this.getView().getModel("valueState");t.setProperty("/valueState",h.None);t.setProperty("/valueStateText","")},onChangeValueState:function(e){var t=e.mParameters.newValue;if(t)this.resetValueState()}})});