sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","sap/ui/core/Fragment","../model/formatter","sap/m/MessageToast","sap/ui/model/Filter","sap/ui/model/FilterOperator","sap/ui/core/library"],function(e,t,o,a,r,s,i,n){"use strict";var l=n.ValueState,u={valueState:l.None,valueStateText:""};return e.extend("opportunity.opportunity.controller.ProjectOverview",{formatter:a,onInit:function(){sap.ui.core.UIComponent.getRouterFor(this).getRoute("ProjectOverview").attachPatternMatched(this._onRoutePatternMatched,this);var e=new t({});this.getView().setModel(e,"ProjectModel");var o=new t({});this.getView().setModel(o,"AddProjectModel");var a=new t({editMode:false});this.getView().setModel(a,"editModel");var r=new t({message:{text:"Please bear in mind that the ideal utilization is at no more than 85%.",state:"Information"},highUtilizationMessage:{text:"Your utilization forecast or actual for this month is too high, please try to lower it or speak to the Resource Manager.",state:"Error"}});this.getView().setModel(r,"messageModel");this.getView().setModel(new sap.ui.model.json.JSONModel(u),"valueState");var s=new t({});this.getView().setModel(s,"localModel")},_onRoutePatternMatched:function(e){this.getView().bindElement({path:"/teamProjects/",parameters:{expand:"skills,tools,comments"}});this.onStatusMethod()},onStatusMethod:function(e){var t=this;var o=[{status:"Sent for Proposal",name:"/sentForProposal"},{status:"RFP",name:"/RFP"},{status:"On-Going",name:"/On-Going"},{status:"Go-Live",name:"/Go-Live"},{status:"Past",name:"/Past"}];o.forEach(o=>{t.onReadProjectData(o.status,o.name,e)})},onReadProjectData:function(e,t,o){var a=[];a.push(new sap.ui.model.Filter("status","EQ",e));if(o){o.forEach(e=>{a.push(e)})}var r=this.getOwnerComponent().getModel();var s=this.getView().getModel("ProjectModel");r.read("/teamProjects",{urlParameters:{$expand:"skills,tools,comments"},filters:a,success:function(e){var o=e.results;s.setProperty(t,o)}.bind(this),error:function(e){console.log(e)}})},onDrop:function(e){var t=this;var o=this.aFilterbar;var a=e.getSource().getDropTarget();var s=e.getSource().getDropTarget().mBindingInfos.items.path;var i=s.substr(1);if(i==="sentForProposal")i="Sent for Proposal";var n=e.getParameter("draggedControl");var l=n.getBindingContext("ProjectModel");var u=l.getObject();var c=u.projectID;var d=u.userID_inumber;var g=u.status;var p={status:i,lastUpdated:new Date};var h="/teamProjects("+c+")";var v=this.getView().getModel();v.update(h,p,{success:function(){r.show(u.account+"' has been moved to '"+i+"'");t.onStatusMethod(o);t.getView().getModel("ProjectModel").refresh();t.getView().setBusy(false)},error:function(e){r.show(e.message);t.getView().setBusy(false)}})},onRightSentForProposal:function(){var e=this.getView().byId("sentForProposalTable");this.onMoveSelectedRight(e)},onRightRFP:function(){var e=this.getView().byId("RFPTable");this.onMoveSelectedRight(e)},onRightOnGoing:function(){var e=this.getView().byId("OnGoingTable");this.onMoveSelectedRight(e)},onRightGoLive:function(){var e=this.getView().byId("GoLiveTable");this.onMoveSelectedRight(e)},onLeftPast:function(){var e=this.getView().byId("PastTable");this.onMoveSelectedLeft(e)},onLeftRFP:function(){var e=this.getView().byId("RFPTable");this.onMoveSelectedLeft(e)},onLeftOnGoing:function(){var e=this.getView().byId("OnGoingTable");this.onMoveSelectedLeft(e)},onLeftGoLive:function(){var e=this.getView().byId("GoLiveTable");this.onMoveSelectedLeft(e)},onMoveSelectedRight:function(e){var t=e.getSelectedItem().getBindingContext("ProjectModel");var o=t.getObject();var a;if(o.status==="Sent for Proposal"){a="RFP"}else if(o.status==="RFP"){a="On-Going"}else if(o.status==="On-Going"){a="Go-Live"}else if(o.status==="Go-Live"){a="Past"}this.onUpdateWithArrow(o,a)},onMoveSelectedLeft:function(e){var t=e.getSelectedItem().getBindingContext("ProjectModel");var o=t.getObject();var a;if(o.status==="RFP"){a="Sent for Proposal"}else if(o.status==="On-Going"){a="RFP"}else if(o.status==="Go-Live"){a="On-Going"}else if(o.status==="Past"){a="Go-Live"}this.onUpdateWithArrow(o,a)},onUpdateWithArrow:function(e,t){var o=this.aFilterbar;var a=this;var s={status:t};var i=this.getView().getModel();var n="/teamProjects("+e.projectID+")";var i=this.getView().getModel();i.update(n,s,{success:function(){r.show(e.account+"' has been moved to '"+t+"'");a.onStatusMethod(o);a.getView().getModel("ProjectModel").refresh();a.getView().setBusy(false)},error:function(e){r.show(e.message);a.getView().setBusy(false)}})},onAddProjectPress:function(e){var t=this.getView().getModel("AddProjectModel");var o=e.getSource().getParent().getParent().mBindingInfos.items.path.substr(1);var a;if(o==="sentForProposal")a="Sent for Proposal";else if(o==="RFP")a="RFP";else if(o==="On-Going")a="On-Going";else if(o==="Go-Live")a="Go-Live";else if(o==="Past")a="Past";t.setProperty("/status",a);t.setProperty("/allProjects",true);this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddProject")},onSubmitNewProject:function(e){var t=this.aFilterbar;var o=this;var a=this.getView().getModel("AddProjectModel");var s=a.getData();if(s.firstName&&s.account&&s.status){this.resetValueState();var i,n,l;if(s.projectStartDate)i=new Date(s.projectStartDate).toISOString().split("T")[0];if(s.projectEndDate)n=new Date(s.projectEndDate).toISOString().split("T")[0];if(s.goLive)l=new Date(s.goLive).toISOString().split("T")[0];var u=this.getApptType(s.status);var c={userID_inumber:s.userID_inumber,primaryContact:s.firstName,projectContact:s.projectContact,account:s.account,priority:s.priority,marketUnit:s.marketUnit,topic:s.topic,status:s.status,projectStartDate:i,projectEndDate:n,descriptionText:s.descriptionText,percentage:s.percentage,goLive:l,lastUpdated:new Date,addedOn:new Date,type:u,appointmentCategory:"Customer Project",appointmentIcon:"sap-icon://business-card",projectValue:s.projectValue};var d="/teamProjects";var g=this.getView().getModel();g.create(d,c,{success:function(e,a){r.show("New Project created!");o.onCancelDialogPress();o.onStatusMethod(t);o.getView().getModel("ProjectModel").refresh()},error:function(e){sap.m.MessageBox.error("Project could not be created, check your input and try again.")}})}else this.ValueStateMethod()},getApptType:function(e){switch(e){case"Sent for Proposal":return"Type10";case"RFP":return"Type05";case"On-Going":return"Type01";case"Go-Live":return"Type08";case"Past":return"Type09";default:return"Type11"}},onDialogOpen:function(e,t,a){this.resetValueState();var r=this.editDialog;var s=this.getView().getModel("editModel");s.setProperty("/editMode",false);var i=this;if(!this._pDialog){this._pDialog=o.load({name:e,controller:this}).then(function(e){i.getView().addDependent(e);e.setEscapeHandler(function(){i.onCloseDialog()});return e})}this._pDialog.then(function(e){if(t){e.setContentWidth("750px");e.setContentHeight("550px");e.bindElement({path:t,parameters:{expand:"comments,skills,tools"}});i.onFilterSkills(a);i.onFilterTools(a)}if(r){i.onBindMonth()}e.open()})},onFilterSkills(e){var t=sap.ui.getCore().byId("skillTokens");var o=sap.ui.getCore().byId("skillItem");var a=new sap.ui.model.Sorter("skill",false);var r=new s("projectID_projectID",i.EQ,e);t.bindAggregation("tokens",{template:o,path:"/skills",sorter:a,filters:r});t.updateBindings()},onFilterTools(e){var t=sap.ui.getCore().byId("toolTokens");var o=sap.ui.getCore().byId("toolItem");var a=new sap.ui.model.Sorter("tool",false);var r=new s("projectID_projectID",i.EQ,e);t.bindAggregation("tokens",{template:o,path:"/teamTools",sorter:a,filters:r});t.updateBindings()},onCancelDialogPress:function(e){this.editDialog=false;this._pDialog.then(function(e){e.close();e.destroy()});this._pDialog=null;this.getView().getModel("AddProjectModel").setData({})},onProjectPopup:function(e){var t=e.getSource().getParent().getBindingContext("ProjectModel");var o=t.getObject();var a=o.projectID;this.inumber=o.userID_inumber;this.sProjectID=o.projectID;var r="/teamProjects/"+a;this.onDialogOpen("opportunity.opportunity.view.fragments.ViewProject",r,a)},onDeleteProjectPress:function(e){var t=this.getView().byId("PastTable");if(t.getSelectedItem()!=undefined){var o=t.getSelectedItem().getBindingContext("ProjectModel");var a=o.getObject();var s="/teamProjects/"+a.projectID;var i=a.userID_inumber;this.onDeleteItem(s,i)}else r.show("Please select a Project to delete first")},onDeleteItem:function(e,t){var o=this.aFilterbar;var a=this;var r=this.getView().getModel();sap.m.MessageBox.warning("Are you sure you want to delete the selected Project?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(t){if(t===sap.m.MessageBox.Action.YES){r.remove(e,{success:function(){a.onStatusMethod(o);a.getView().getModel("ProjectModel").refresh();sap.m.MessageToast.show("Project deleted successfully.")},error:function(){sap.m.MessageToast.show("Project could not be deleted. Please try again.")}})}}})},onDeleteToken:function(e){var t=e.getParameter("token").getBindingContext().sPath;var o=this;var a=this.getView().getModel();sap.m.MessageBox.warning("Are you sure you want to delete this token for the project?",{actions:[sap.m.MessageBox.Action.YES,sap.m.MessageBox.Action.NO],onClose:function(e){if(e===sap.m.MessageBox.Action.YES){a.remove(t,{success:function(){sap.m.MessageToast.show("Token deleted successfully.")},error:function(){sap.m.MessageToast.show("Token could not be deleted. Please try again.")}})}}})},onAddProjectSkill:function(e){this.onPopover("opportunity.opportunity.view.fragments.addFragments.AddSkill",e)},onAddProjectTool:function(e){this.onToolsPopover("opportunity.opportunity.view.fragments.addFragments.AddTool",e)},onPopover:function(e,t){var a=t.getSource(),r=this.getView();if(!this._pPopover){this._pPopover=o.load({name:e,controller:this}).then(function(e){r.addDependent(e);return e})}this._pPopover.then(function(e){e.openBy(a)})},onToolsPopover:function(e,t){var a=t.getSource(),r=this.getView();if(!this._tPopover){this._tPopover=o.load({name:e,controller:this}).then(function(e){r.addDependent(e);return e})}this._tPopover.then(function(e){e.openBy(a)})},onSubmitSkill:function(e){var t=this.getView().getModel("localModel");var o=t.getProperty("/skill");var a={skill:o,userID_inumber:this.inumber,projectID_projectID:this.sProjectID};var s=this.getView().getModel();s.create("/skills",a,{success:function(e,o){r.show("New Skill added");t.setData({})},error:function(e){sap.m.MessageBox.error("Skill could not be added, check your input and try again.")}})},onSubmitTool:function(e){var t=this.getView().getModel("localModel");var o=t.getProperty("/tool");var a={tool:o,userID_inumber:this.inumber,projectID_projectID:this.sProjectID};var s=this.getView().getModel();s.create("/teamTools",a,{success:function(e,o){r.show("New Tool added");t.setData({})},error:function(e){sap.m.MessageBox.error("Tool could not be added, check your input and try again.")}})},onEditProject:function(e){var t=sap.ui.getCore().byId("navContainer");var o=this.getView().getModel("editModel");var a=o.getProperty("/editMode");if(a){o.setProperty("/editMode",false);t.to("dynamicPageId","show")}else if(!a){o.setProperty("/editMode",true);t.to("dynamicPage2","show")}},onSaveProject:function(e){var t=this.aFilterbar;var o=this;var a=e.getSource().getParent().getBindingContext().getObject();var s=e.getSource().getParent().getBindingContext().sPath;var i,n,l;var u=sap.ui.getCore().byId("goLiveDate").getValue();var c=sap.ui.getCore().byId("projectDates").getDateValue();var d=sap.ui.getCore().byId("projectDates").getSecondDateValue();if(u)i=new Date(u).toISOString().split("T")[0];if(c)n=new Date(c).toISOString().split("T")[0];if(d)l=new Date(d).toISOString().split("T")[0];var g={goLive:i,projectContact:sap.ui.getCore().byId("projectContact").getValue(),marketUnit:sap.ui.getCore().byId("projectMU").getValue(),topic:sap.ui.getCore().byId("projectTopic").getValue(),projectStartDate:sap.ui.getCore().byId("projectDates").getDateValue(),projectEndDate:sap.ui.getCore().byId("projectDates").getSecondDateValue(),descriptionText:sap.ui.getCore().byId("projectDesc").getValue(),percentage:sap.ui.getCore().byId("projectPercentage").getValue(),lastUpdated:new Date,projectValue:sap.ui.getCore().byId("projectValue").getValue()};var p=this.getView().getModel();p.update(s,g,{success:function(){o.getView().setBusy(false);r.show(a.account+" updated successfully.");o.onEditProject();o.onStatusMethod(t);o.onCancelDialogPress()},error:function(e){r.show(e.message);o.getView().setBusy(false)}})},beforeRebindUtilizationChart:function(e){var t=e.getParameter("bindingParams");var o=new s("userID_inumber",i.EQ,this.inumber);t.filters.push(o);var a=new sap.ui.model.Sorter("order",false);t.sorter.push(a)},onAddNewForecast:function(e){this.editDialog=false;this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddNewForecast")},onForecastEdit:function(e){this.editDialog=true;this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditForecast")},onBindMonth:function(e){var t=sap.ui.getCore().byId("monthItem");var o=new sap.ui.model.Sorter("order",false);var a=sap.ui.getCore().byId("monthComboBox");var r=[];var n=new s("userID_inumber",i.EQ,this.inumber);r.push(n);a.bindAggregation("items",{template:t,path:"/teamForecast",sorter:o,filters:r})},onEditForecastSubmit:function(e){this.editDialog=false;var t=this;var o=this.getView().byId("smartChartTeamForecast");var t=this;var a=this.getView().getModel("AddProjectModel");var s=a.getData();if(oData.month){this.resetValueState();t.getView().setBusy(true);var i=this.forecastPath.sPath;var n=this.getView().getModel();n.update(i,s,{success:function(e,a){r.show("Forecast has been updated!");t.onCancelDialogPress();o.rebindChart();t.getView().setBusy(false)},error:function(e){sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");t.getView().setBusy(false)}})}else this.ValueStateMethod()},onSubmitNewForecast:function(e){var t=this;t.getView().setBusy(true);var o=this.getView().byId("smartChartTeamForecast");var t=this;var a=this.getView().getModel("AddProjectModel");var s=a.getData();var i=this.getView().getModel("AddProjectModel").getProperty("/year");var n=this.onMonthOrder(s.month);var l={userID_inumber:this.inumber,month:s.month,year:i,forecast:s.forecast,actual:s.actual,order:n};var u="/teamForecast";if(i&&s.month){var c=this.getView().getModel();c.create(u,l,{success:function(e,a){r.show("New Forecast has been added!");t.onCancelDialogPress();o.rebindChart();t.getView().setBusy(false)},error:function(e){sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");t.getView().setBusy(false)}})}else{r.show("Please select a Year and Month to continue");t.getView().setBusy(false)}},onMonthOrder(e){switch(e){case"January":return 1;case"February":return 2;case"March":return 3;case"April":return 4;case"May":return 5;case"June":return 6;case"July":return 7;case"August":return 8;case"September":return 9;case"October":return 10;case"November":return 11;case"December":return 12;default:return""}},onMemberChange:function(e){e;this.resetValueState();var t=this.getView().getModel("AddProjectModel");var o=e.mParameters.selectedItem.getText();var a=e.mParameters.selectedItem.getKey();this.inumber=a;t.getData().firstName=o},onSearch:function(e){var t=[];var o=this.getView().byId("multiComboBox1");o.getSelectedItems().forEach(e=>{var o=new sap.ui.model.Filter("primaryContact",sap.ui.model.FilterOperator.EQ,e.getKey());t.push(o)});var a=this.getView().byId("multiComboBox2");a.getSelectedItems().forEach(e=>{var o=new sap.ui.model.Filter("topic",sap.ui.model.FilterOperator.EQ,e.getKey());t.push(o)});var r=this.getView().byId("multiComboBox3");r.getSelectedItems().forEach(e=>{var o=new sap.ui.model.Filter("marketUnit",sap.ui.model.FilterOperator.EQ,e.getKey());t.push(o)});var s=this.getView().byId("startDate");if(s.getDateValue()){var s=new Date(this.getView().byId("startDate").getDateValue());var i=new Date(Date.UTC(s.getFullYear(),s.getMonth(),s.getDate(),0,0,0));var r=new sap.ui.model.Filter("projectStartDate",sap.ui.model.FilterOperator.GT,i);t.push(r)}var n=this.getView().byId("endDate");if(n.getDateValue()){var n=new Date(this.getView().byId("endDate").getDateValue());var l=new Date(Date.UTC(n.getFullYear(),n.getMonth(),n.getDate(),0,0,0));var r=new sap.ui.model.Filter("projectEndDate",sap.ui.model.FilterOperator.LT,l);t.push(r)}this.aFilterbar=t;this.onStatusMethod(t)},ValueStateMethod:function(e){var t=this.getView().getModel("valueState");r.show("Please fill all mandatory fields");t.setProperty("/valueState",l.Error);t.setProperty("/valueStateText","This field is mandatory")},resetValueState:function(e){var t=this.getView().getModel("valueState");t.setProperty("/valueState",l.None);t.setProperty("/valueStateText","")},onChangeValueState:function(e){var t=e.mParameters.newValue;if(t)this.resetValueState()}})});