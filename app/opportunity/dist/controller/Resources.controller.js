sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/core/Fragment","../model/formatter","sap/m/MessageToast","sap/ui/model/Filter","sap/ui/model/FilterOperator"],function(e,t,o,r,a,s,i){"use strict";return e.extend("opportunity.opportunity.controller.Resources",{formatter:r,onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).getRoute("Resources").attachPatternMatched(this._onRoutePatternMatched,this);var e=new t({});this.getView().setModel(e,"ProjectModel");var o=new t({});this.getView().setModel(o,"AddProjectModel");var r=new t({editMode:false});this.getView().setModel(r,"editModel");var a=new t({message:{text:"Please bear in mind that the ideal utilization is at no more than 85%.",state:"Information"},highUtilizationMessage:{text:"Your utilization forecast or actual for this month is too high, please try to lower it or speak to the Resource Manager.",state:"Error"}});this.getView().setModel(a,"messageModel")},_onRoutePatternMatched:function(e){this.inumber=e.getParameter("arguments").inumber;this.getView().bindElement({path:"/teamMembers/"+this.inumber,parameters:{expand:"skills,tools,projects"}});this.onStatusMethod(this.inumber);var t=this.getView().byId("smartChartTeamForecast");if(t.isInitialised())t.rebindChart()},onStatusMethod:function(e){var t=this;var o=[{status:"Sent for Proposal",name:"/sentForProposal"},{status:"RFP",name:"/RFP"},{status:"On-Going",name:"/On-Going"},{status:"Go-Live",name:"/Go-Live"},{status:"Past",name:"/Past"}];o.forEach(o=>{t.onReadProjectData(o.status,e,o.name)})},onReadProjectData:function(e,t,o){var r=[];r.push(new sap.ui.model.Filter("userID_inumber","EQ",t));r.push(new sap.ui.model.Filter("status","EQ",e));var a=this.getOwnerComponent().getModel();var s=this.getView().getModel("ProjectModel");a.read("/teamProjects",{filters:r,success:function(e){var t=e.results;s.setProperty(o,t)}.bind(this),error:function(e){console.log(e)}})},onDrop:function(e){var t=this;var o=e.getSource().getDropTarget();var r=e.getSource().getDropTarget().mBindingInfos.items.path;var s=r.substr(1);if(s==="sentForProposal")s="Sent for Proposal";var i=e.getParameter("draggedControl");var n=i.getBindingContext("ProjectModel");var c=n.getObject();var u=c.projectID;var l=c.userID_inumber;var d=c.status;var g={status:s};var p="/teamProjects("+u+")";var h=this.getView().getModel();h.update(p,g,{success:function(){a.show(c.account+"' has been moved to '"+s+"'");t.onStatusMethod(l);t.getView().getModel("ProjectModel").refresh();t.getView().setBusy(false)},error:function(e){a.show(e.message);t.getView().setBusy(false)}})},onRightSentForProposal:function(){var e=this.getView().byId("sentForProposalTable");this.onMoveSelectedRight(e)},onRightRFP:function(){var e=this.getView().byId("RFPTable");this.onMoveSelectedRight(e)},onRightOnGoing:function(){var e=this.getView().byId("OnGoingTable");this.onMoveSelectedRight(e)},onRightGoLive:function(){var e=this.getView().byId("GoLiveTable");this.onMoveSelectedRight(e)},onLeftPast:function(){var e=this.getView().byId("PastTable");this.onMoveSelectedLeft(e)},onLeftRFP:function(){var e=this.getView().byId("RFPTable");this.onMoveSelectedLeft(e)},onLeftOnGoing:function(){var e=this.getView().byId("OnGoingTable");this.onMoveSelectedLeft(e)},onLeftGoLive:function(){var e=this.getView().byId("GoLiveTable");this.onMoveSelectedLeft(e)},onMoveSelectedRight:function(e){var t=e.getSelectedItem().getBindingContext("ProjectModel");var o=t.getObject();var r;if(o.status==="Sent for Proposal"){r="RFP"}else if(o.status==="RFP"){r="On-Going"}else if(o.status==="On-Going"){r="Go-Live"}else if(o.status==="Go-Live"){r="Past"}this.onUpdateWithArrow(o,r)},onMoveSelectedLeft:function(e){var t=e.getSelectedItem().getBindingContext("ProjectModel");var o=t.getObject();var r;if(o.status==="RFP"){r="Sent for Proposal"}else if(o.status==="On-Going"){r="RFP"}else if(o.status==="Go-Live"){r="On-Going"}else if(o.status==="Past"){r="Go-Live"}this.onUpdateWithArrow(o,r)},onUpdateWithArrow:function(e,t){var o=this;var r={status:t};var s=this.getView().getModel();var i="/teamProjects("+e.projectID+")";var s=this.getView().getModel();s.update(i,r,{success:function(){a.show(e.account+"' has been moved to '"+t+"'");o.onStatusMethod(e.userID_inumber);o.getView().getModel("ProjectModel").refresh();o.getView().setBusy(false)},error:function(e){a.show(e.message);o.getView().setBusy(false)}})},onAddProjectPress:function(e){var t=this.getView().getModel("AddProjectModel");var o=e.getSource().getParent().getParent().mBindingInfos.items.path.substr(1);var r;if(o==="sentForProposal")r="Sent for Proposal";else if(o==="RFP")r="RFP";else if(o==="On-Going")r="On-Going";else if(o==="Go-Live")r="Go-Live";else if(o==="Past")r="Past";t.setProperty("/status",r);t.setProperty("/allProjects",false);this.onDialogOpen("opportunity.opportunity.view.fragments.AddProject")},onSubmitNewProject:function(e){var t=this;var o=this.getView().getModel("AddProjectModel");var r=o.getData();var s=this.getView().getBindingContext().getObject().inumber;var i,n,c;if(r.projectStartDate)i=new Date(r.projectStartDate).toISOString().split("T")[0];if(r.projectEndDate)n=new Date(r.projectEndDate).toISOString().split("T")[0];if(r.goLive)c=new Date(r.goLive).toISOString().split("T")[0];var u=this.getApptType(r.status);var l={userID_inumber:s,primaryContact:this.getView().getBindingContext().getObject().firstName,projectContact:r.projectContact,account:r.account,priority:r.priority,marketUnit:r.marketUnit,topic:r.topic,status:r.status,projectStartDate:i,projectEndDate:n,descriptionText:r.descriptionText,percentage:r.percentage,goLive:c,lastUpdated:new Date,type:u,appointmentCategory:"Customer Project",appointmentIcon:"sap-icon://business-card",projectValue:r.projectValue};var d="/teamProjects";var g=this.getView().getModel();g.create(d,l,{success:function(e,o){a.show("New Project created!");t.onCancelDialogPress();t.onStatusMethod(s);t.getView().getModel("ProjectModel").refresh()},error:function(e){sap.m.MessageBox.error("Project could not be created, check your input and try again.")}})},getApptType:function(e){switch(e){case"Sent for Proposal":return"Type10";case"RFP":return"Type05";case"On-Going":return"Type01";case"Go-Live":return"Type08";case"Past":return"Type09";default:return"Type11"}},onDialogOpen:function(e,t,r){var a=this.editDialog;var s=this.getView().getModel("editModel");s.setProperty("/editMode",false);var i=this;if(!this._pDialog){this._pDialog=o.load({name:e,controller:this}).then(function(e){i.getView().addDependent(e);e.setEscapeHandler(function(){i.onCloseDialog()});return e})}this._pDialog.then(function(e){if(t){e.setContentWidth("750px");e.setContentHeight("550px");e.bindElement({path:t,parameters:{expand:"comments,skills,tools"}});i.onFilterSkills(r);i.onFilterTools(r)}if(a){i.onBindMonth()}e.open()})},onFilterSkills(e){var t=sap.ui.getCore().byId("skillTokens");var o=sap.ui.getCore().byId("skillItem");var r=new sap.ui.model.Sorter("skill",false);var a=new s("projectID_projectID",i.EQ,e);t.bindAggregation("tokens",{template:o,path:"/skills",sorter:r,filters:a});t.updateBindings()},onFilterTools(e){var t=sap.ui.getCore().byId("toolTokens");var o=sap.ui.getCore().byId("toolItem");var r=new sap.ui.model.Sorter("tool",false);var a=new s("projectID_projectID",i.EQ,e);t.bindAggregation("tokens",{template:o,path:"/teamTools",sorter:r,filters:a});t.updateBindings()},onCancelDialogPress:function(e){this.editDialog=false;this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;this.getView().getModel("AddProjectModel").setData({})},onProjectPopup:function(e){var t=e.getSource().getParent().getBindingContext("ProjectModel");var o=t.getObject();var r=o.projectID;this.sProjectID=o.projectID;var a="/teamProjects/"+r;this.onDialogOpen("opportunity.opportunity.view.fragments.ViewProject",a,r)},onDeleteProjectPress:function(e){var t=this.getView().byId("PastTable");if(t.getSelectedItem()!=undefined){var o=t.getSelectedItem().getBindingContext("ProjectModel");var r=o.getObject();var s="/teamProjects/"+r.projectID;var i=r.userID_inumber;this.onDeleteItem(s,i)}else a.show("Please select a Project to delete first")},onDeleteItem:function(e,t){var o=this;o.getView().setBusy(true);var r=this.getView().getModel();sap.m.MessageBox.warning("Are you sure you want to delete the selected Project?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(a){if(a===sap.m.MessageBox.Action.YES){r.remove(e,{success:function(){o.onStatusMethod(t);o.getView().getModel("ProjectModel").refresh();o.getView().setBusy(false);sap.m.MessageToast.show("Project deleted successfully.")},error:function(){o.getView().setBusy(false);sap.m.MessageToast.show("Project could not be deleted. Please try again.")}})}}})},onDeleteToken:function(e){var t=e.getParameter("token").getBindingContext().sPath;var o=this;o.getView().setBusy(true);var r=this.getView().getModel();sap.m.MessageBox.warning("Are you sure you want to delete this token for the project?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(e){if(e===sap.m.MessageBox.Action.YES){r.remove(t,{success:function(){o.getView().setBusy(false);sap.m.MessageToast.show("Token deleted successfully.")},error:function(){o.getView().setBusy(false);sap.m.MessageToast.show("Token could not be deleted. Please try again.")}})}}})},onAddProjectSkill:function(e){this.onPopover("opportunity.opportunity.view.fragments.AddSkill",e)},onAddProjectTool:function(e){this.onPopover("opportunity.opportunity.view.fragments.AddTool",e)},onPopover:function(e,t){var r=t.getSource(),a=this.getView();this._pPopover=o.load({id:a.getId(),name:e,controller:this}).then(function(e){a.addDependent(e);return e});this._pPopover.then(function(e){e.openBy(r)})},onSubmitSkill:function(e){var t=this.getView().byId("skillInput");var o={skill:t.getValue(),userID_inumber:this.inumber,projectID_projectID:this.sProjectID};var r=this.getView().getModel();r.create("/skills",o,{success:function(e,o){a.show("New Skill added");t.setValue("")},error:function(e){sap.m.MessageBox.error("Skill could not be added, check your input and try again.")}})},onSubmitTool:function(e){var t=this.getView().byId("toolInput");var o={tool:t.getValue(),userID_inumber:this.inumber,projectID_projectID:this.sProjectID};var r=this.getView().getModel();r.create("/teamTools",o,{success:function(e,o){a.show("New Tool added");t.setValue("")},error:function(e){sap.m.MessageBox.error("Tool could not be added, check your input and try again.")}})},onEditProject:function(e){var t=sap.ui.getCore().byId("navContainer");var o=this.getView().getModel("editModel");var r=o.getProperty("/editMode");if(r){o.setProperty("/editMode",false);t.to("dynamicPageId","show")}else if(!r){o.setProperty("/editMode",true);t.to("dynamicPage2","show")}},onSaveProject:function(e){var t=this;var o=e.getSource().getParent().getBindingContext().getObject();var r=e.getSource().getParent().getBindingContext().sPath;var s,i,n;var c=sap.ui.getCore().byId("goLiveDate").getValue();var u=sap.ui.getCore().byId("projectDates").getDateValue();var l=sap.ui.getCore().byId("projectDates").getSecondDateValue();if(c)s=new Date(c).toISOString().split("T")[0];if(u)i=new Date(u).toISOString().split("T")[0];if(l)n=new Date(l).toISOString().split("T")[0];var d=this.inumber;var g={goLive:s,projectContact:sap.ui.getCore().byId("projectContact").getValue(),marketUnit:sap.ui.getCore().byId("projectMU").getValue(),topic:sap.ui.getCore().byId("projectTopic").getValue(),projectStartDate:sap.ui.getCore().byId("projectDates").getDateValue(),projectEndDate:sap.ui.getCore().byId("projectDates").getSecondDateValue(),descriptionText:sap.ui.getCore().byId("projectDesc").getValue(),percentage:sap.ui.getCore().byId("projectPercentage").getValue(),lastUpdated:new Date,projectValue:sap.ui.getCore().byId("projectValue").getValue()};var p=this.getView().getModel();p.update(r,g,{success:function(){t.getView().setBusy(false);a.show(o.account+" updated successfully.");t.onEditProject();t.onStatusMethod(d);t.onCancelDialogPress()},error:function(e){a.show(e.message);t.getView().setBusy(false)}})},beforeRebindUtilizationChart:function(e){var t=e.getParameter("bindingParams");var o=new s("userID_inumber",i.EQ,this.inumber);t.filters.push(o);var r=new sap.ui.model.Sorter("order",false);t.sorter.push(r)},onAddNewForecast:function(e){this.editDialog=false;this.onDialogOpen("opportunity.opportunity.view.fragments.AddNewForecast")},onForecastEdit:function(e){this.editDialog=true;this.onDialogOpen("opportunity.opportunity.view.fragments.EditForecast")},onBindMonth:function(e){var t=sap.ui.getCore().byId("monthItem");var o=new sap.ui.model.Sorter("order",false);var r=sap.ui.getCore().byId("monthComboBox");var a=[];var n=new s("userID_inumber",i.EQ,this.inumber);a.push(n);r.bindAggregation("items",{template:t,path:"/teamForecast",sorter:o,filters:a})},onSelectionChange:function(e){var t=this.getView().getModel("AddProjectModel");this.forecastPath=e.mParameters.selectedItem.getBindingContext();var o=e.mParameters.selectedItem.getBindingContext().getObject();var r={userID_inumber:this.inumber,month:o.month,year:o.year,forecast:o.forecast,actual:o.actual,order:o.order};t.setData(r)},onEditForecastSubmit:function(e){this.editDialog=false;var t=this;t.getView().setBusy(true);var o=this.getView().byId("smartChartTeamForecast");var t=this;var r=this.getView().getModel("AddProjectModel");var s=r.getData();var i=this.forecastPath.sPath;var n=this.getView().getModel();n.update(i,s,{success:function(e,r){a.show("Forecast has been updated!");t.onCancelDialogPress();o.rebindChart();t.getView().setBusy(false)},error:function(e){sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");t.getView().setBusy(false)}})},onSubmitNewForecast:function(e){var t=this;t.getView().setBusy(true);var o=this.getView().byId("smartChartTeamForecast");var t=this;var r=this.getView().getModel("AddProjectModel");var s=r.getData();var i=this.getView().getModel("AddProjectModel").getProperty("/year");var n=this.onMonthOrder(s.month);var c={userID_inumber:this.inumber,month:s.month,year:i,forecast:s.forecast,actual:s.actual,order:n};var u="/teamForecast";if(i&&s.month){var l=this.getView().getModel();l.create(u,c,{success:function(e,r){a.show("New Forecast has been added!");t.onCancelDialogPress();o.rebindChart();t.getView().setBusy(false)},error:function(e){sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");t.getView().setBusy(false)}})}else{a.show("Please select a Year and Month to continue");t.getView().setBusy(false)}},onMonthOrder(e){switch(e){case"January":return 1;case"February":return 2;case"March":return 3;case"April":return 4;case"May":return 5;case"June":return 6;case"July":return 7;case"August":return 8;case"September":return 9;case"October":return 10;case"November":return 11;case"December":return 12;default:return""}}})});