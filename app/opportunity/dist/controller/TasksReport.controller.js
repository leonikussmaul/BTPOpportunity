sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/MessageBox","sap/ui/core/Fragment","sap/ui/model/json/JSONModel","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/model/Sorter","sap/ui/core/message/Message","sap/m/MessageToast","sap/ui/core/ValueState","sap/ui/model/FilterType","../model/formatter"],function(e,t,o,a,n,i,s,r,c,l,u,p){"use strict";return e.extend("opportunity.opportunity.controller.TasksReport",{formatter:p,onInit:function(){var e=new a({});this.getView().setModel(e,"AddTaskModel");sap.ui.core.UIComponent.getRouterFor(this).getRoute("TasksReport").attachPatternMatched(this._onRoutePatternMatched,this);var t=new a({});this.getView().setModel(t,"actionItemModel")},onReadTasksData:function(){var e=this.getView().getModel();var t=this.getView().getModel("actionItemModel");e.read("/opportunityActionItems",{urlParameters:{$expand:"subTasks"},success:function(e){var o=e.results;var a=[];for(var n=0;n<o.length;n++){var i=o[n].subTasks.results;for(var s=0;s<i.length;s++){a.push(i[s])}}t.setProperty("/actionItems",o);t.setProperty("/subTasks",a)}.bind(this),error:function(e){console.log(e)}})},_onRoutePatternMatched:function(e){this.onReadTasksData()},onBeforeRebindTaskTable:function(e){var t=e.getParameter("bindingParams");var o=function(e){var t;t=e.getProperty("actionCustomer");return{key:t}};var a=new sap.ui.model.Sorter("actionCustomer",false,o);t.sorter.push(a)},onDeleteTableItem:function(e){var t=this.getView().byId("myTaskTable");var o=t.getTable().getSelectedItems();if(o.length===0){sap.m.MessageToast.show("Select at least one task to delete");return}var a=t.getModel();sap.m.MessageBox.warning("Are you sure you want to delete the selected tasks?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(e){if(e===sap.m.MessageBox.Action.YES){for(var t=o.length-1;t>=0;t--){var n=o[t].getBindingContext().getPath();a.remove(n,{success:function(){sap.m.MessageToast.show("Task deleted successfully.")},error:function(){sap.m.MessageToast.show("Failed to delete task.")}})}}}})},onAddToDoTablePress:function(){var e=this;this.onDialogOpen("opportunity.opportunity.view.fragments.AddToDoTask")},onSubmitNewTask:function(e){var t=this;var o=this.getView().getModel("AddTaskModel");var a=o.getData();var n=sap.ui.getCore().byId("accountComboBox").getSelectedItem();var i=n.getText();var s;if(a.actionDueDate)s=new Date(a.actionDueDate).toISOString().split("T")[0];var r;if(a.actionPriority==="High")r=1;else if(a.actionPriority==="Medium")r=2;else if(a.actionPriority==="Low")r=3;var l={actionDueDate:s,actionCustomer:i,actionOwner:a.actionOwner,actionProgress:a.actionProgress,actionTopic:a.actionTopic,actionTask:a.actionTask,actionTitle:a.actionTitle,actionPriority:a.actionPriority,actionPriorityNumber:r,opptID_opportunityID:a.account};var u="/opportunityActionItems";var p=this.getView().getModel();p.create(u,l,{success:function(e,o){c.show("New Task created!");t.onCancelDialogPress()},error:function(e){sap.m.MessageBox.error("Task could not be created, check your input and try again.")}})},onDialogOpen:function(e){var t=this;if(!this._pDialog){this._pDialog=o.load({name:e,controller:this}).then(function(e){t.getView().addDependent(e);e.setEscapeHandler(function(){t.onCloseDialog()});return e})}this._pDialog.then(function(e){e.open()})},onCancelDialogPress:function(e){this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;var t=this.getView().getModel("AddTaskModel");t.setData({})},onListItemPress:function(e){var t=e.getSource().getBindingContext().getObject();var o=sap.ui.core.UIComponent.getRouterFor(this);o.navTo("TaskDetail",{ID:t.ID})},onSearch:function(e){var t=[];var o=e.getSource().getValue();if(o&&o.length>0){var t=[new n({filters:[new n({path:"actionTitle",operator:i.Contains,value1:o,caseSensitive:false}),new n({path:"actionTask",operator:i.Contains,value1:o,caseSensitive:false}),new n({path:"actionCustomer",operator:i.Contains,value1:o,caseSensitive:false}),new n({path:"actionTopic",operator:i.Contains,value1:o,caseSensitive:false}),new n({path:"actionOwner",operator:i.Contains,value1:o,caseSensitive:false})],and:false})]}var a=this.byId("myTaskTable").getTable();var s=a.getBinding("items");s.filter(t,u.Application)},onPopoverPress:function(e){var t=e.getSource(),a=this.getView(),n=e.getSource().getBindingContext().sPath;this._pPopover=o.load({id:a.getId(),name:"opportunity.opportunity.view.fragments.TaskPopover",controller:this}).then(function(e){a.addDependent(e);e.bindElement({path:n,events:{change:function(){e.invalidate()}}});return e});this._pPopover.then(function(e){e.attachAfterClose(function(){e.destroy()}.bind(this));e.openBy(t)})},onBeforeExportTasks:function(e){var t=e.getParameter("exportSettings").workbook;t.columns.unshift({property:"actionPriority",label:"Priority"});t.columns[5].label="Progress"}})});