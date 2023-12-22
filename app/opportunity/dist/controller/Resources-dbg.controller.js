sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "../model/formatter",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/library"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Fragment, formatter, MessageToast, Filter, FilterOperator, CoreLibrary) {
    "use strict";
    var ValueState = CoreLibrary.ValueState,
      oValueState = {
        valueState: ValueState.None,
        valueStateText: ""
      };



    return Controller.extend("opportunity.opportunity.controller.Resources", {
      formatter: formatter,
      onInit: function () {
        sap.ui.core.UIComponent.getRouterFor(this).getRoute("Resources").attachPatternMatched(this._onRoutePatternMatched, this);
        var oProjectModel = new JSONModel({});
        this.getView().setModel(oProjectModel, "ProjectModel");

        var AddProjectModel = new JSONModel({});
        this.getView().setModel(AddProjectModel, "AddProjectModel");

        // const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // let sMonth = month[new Date().getMonth()];
        // AddProjectModel.setProperty("/month", sMonth);
        // AddProjectModel.setProperty("/year", new Date().getUTCFullYear());

        var oEditModel = new JSONModel({
          editMode: false
        });
        this.getView().setModel(oEditModel, "editModel");



        var oMessageModel = new JSONModel({
          message: {
            text: "Please bear in mind that the ideal utilization is at no more than 85%.",
            state: "Information"
          },
          highUtilizationMessage: {
            text: "Your utilization forecast or actual for this month is too high, please try to lower it or speak to the Resource Manager.",
            state: "Error"
          }
        });
        this.getView().setModel(oMessageModel, "messageModel");

        this.getView().setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");

        var oLocalModel = new JSONModel({});
        this.getView().setModel(oLocalModel, "localModel");



      },

      _onRoutePatternMatched: function (oEvent) {
        this.inumber = oEvent.getParameter("arguments").inumber;

        this.getView().bindElement({
          path: "/teamMembers/" + this.inumber,
          parameters: {
            expand: "skills,tools,projects"
          }
        });

        this.onStatusMethod(this.inumber);

        var oChart = this.getView().byId("smartChartTeamForecast");
        if (oChart.isInitialised()) oChart.rebindChart();

      },

      onStatusMethod: function (inumber) {
        var that = this;
        var aStatus = [
          { status: "New Requests", name: "/newRequests" },
          { status: "RFP", name: "/RFP" },
          { status: "On-Going", name: "/On-Going" },
          { status: "Go-Live", name: "/Go-Live" },
          { status: "Past", name: "/Past" },
        ];
        aStatus.forEach(oStatus => {
          that.onReadProjectData(oStatus.status, inumber, oStatus.name)
        });

      },

      onReadProjectData: function (oStatus, inumber, sName) {
        var aFilters = [];
        aFilters.push(new sap.ui.model.Filter("userID_inumber", "EQ", inumber));
        aFilters.push(new sap.ui.model.Filter("status", "EQ", oStatus));

        var oModel = this.getOwnerComponent().getModel();
        var oProjectModel = this.getView().getModel("ProjectModel");
        oModel.read("/teamProjects", {
          // urlParameters: {
          //     "$expand": "actionItems/subTasks,topics,deliverables"
          // },
          filters: aFilters,
          success: function (oResponse) {
            var aProjects = oResponse.results;
            oProjectModel.setProperty(sName, aProjects);
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          }
        });

      },

      onDrop: function (oEvent) {

        var that = this;

        var oDropTarget = oEvent.getSource().getDropTarget();
        // i.e. = "/RFP"
        //var sPath = oEvent.getSource().getDropTarget().mBindingInfos.items.path;
        var sDropPath = oEvent.getSource().getDropTarget().mBindingInfos.items.path;
        var sNewStatus = sDropPath.substr(1);

        if (sNewStatus === "newRequests") sNewStatus = "New Requests";

        // binding of dragged
        // i.e. "/onGoing/0"
        var oDragged = oEvent.getParameter("draggedControl");
        var sBinding = oDragged.getBindingContext("ProjectModel");
        var oContext = sBinding.getObject();
        var sProjectID = oContext.projectID;
        var inumber = oContext.userID_inumber;
        var sPreviousStatus = oContext.status

        //update Model with project ID and new status 
        var oPayload = {
          //ID: oData.ID,
          status: sNewStatus
          //lastUpdated: new Date().toISOString().split("T")[0]
        }

        var sPath = "/teamProjects(" + sProjectID + ")";

        var oModel = this.getView().getModel();
        oModel.update(sPath, oPayload, {
          success: function () {

            MessageToast.show(oContext.account + "' has been moved to '" + sNewStatus + "'");

            that.onStatusMethod(inumber);
            that.getView().getModel("ProjectModel").refresh();
            that.getView().setBusy(false);
          },
          error: function (oError) {
            MessageToast.show(oError.message);
            that.getView().setBusy(false);
          }
        });
      },

      //right
      onRightNewRequests: function () {
        var oTable = this.getView().byId("newRequestsTable");
        this.onMoveSelectedRight(oTable);
      },

      onRightRFP: function () {
        var oTable = this.getView().byId("RFPTable");
        this.onMoveSelectedRight(oTable);
      },

      onRightOnGoing: function () {
        var oTable = this.getView().byId("OnGoingTable");
        this.onMoveSelectedRight(oTable);
      },
      onRightGoLive: function () {
        var oTable = this.getView().byId("GoLiveTable");
        this.onMoveSelectedRight(oTable);
      },

      // left
      onLeftPast: function () {
        var oTable = this.getView().byId("PastTable");
        this.onMoveSelectedLeft(oTable);
      },

      onLeftRFP: function () {
        var oTable = this.getView().byId("RFPTable");
        this.onMoveSelectedLeft(oTable);
      },

      onLeftOnGoing: function () {
        var oTable = this.getView().byId("OnGoingTable");
        this.onMoveSelectedLeft(oTable);
      },
      onLeftGoLive: function () {
        var oTable = this.getView().byId("GoLiveTable");
        this.onMoveSelectedLeft(oTable);
      },

      onMoveSelectedRight: function (oTable) {
        var oBinding = oTable.getSelectedItem().getBindingContext("ProjectModel");
        var oContext = oBinding.getObject();

        var sNewStatus;
        if (oContext.status === "New Requests") {
          //update to RFP
          sNewStatus = "RFP";
        } else if (oContext.status === "RFP") {
          sNewStatus = "On-Going"
        } else if (oContext.status === "On-Going") {
          sNewStatus = "Go-Live"
        } else if (oContext.status === "Go-Live") {
          sNewStatus = "Past"
        }
        this.onUpdateWithArrow(oContext, sNewStatus);
      },

      onMoveSelectedLeft: function (oTable) {
        var oBinding = oTable.getSelectedItem().getBindingContext("ProjectModel");
        var oContext = oBinding.getObject();

        var sNewStatus;
        if (oContext.status === "RFP") {
          sNewStatus = "New Requests";
        } else if (oContext.status === "On-Going") {
          sNewStatus = "RFP"
        } else if (oContext.status === "Go-Live") {
          sNewStatus = "On-Going"
        } else if (oContext.status === "Past") {
          sNewStatus = "Go-Live"
        }
        this.onUpdateWithArrow(oContext, sNewStatus);
      },


      onUpdateWithArrow: function (oContext, sNewStatus) {
        var that = this;
        var oPayload = {
          status: sNewStatus
        }

        var oModel = this.getView().getModel();
        var sPath = "/teamProjects(" + oContext.projectID + ")";

        var oModel = this.getView().getModel();
        oModel.update(sPath, oPayload, {
          success: function () {

            MessageToast.show(oContext.account + "' has been moved to '" + sNewStatus + "'");

            that.onStatusMethod(oContext.userID_inumber);
            that.getView().getModel("ProjectModel").refresh();
            that.getView().setBusy(false);
          },
          error: function (oError) {
            MessageToast.show(oError.message);
            that.getView().setBusy(false);
          }
        });

      },

      onAddProjectPress: function (oEvent) {
        //status: "New Requests"
        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        var sPath = oEvent.getSource().getParent().getParent().mBindingInfos.items.path.substr(1);

        var sStatus;
        if (sPath === "newRequests") sStatus = "New Requests";
        else if (sPath === "RFP") sStatus = "RFP";
        else if (sPath === "On-Going") sStatus = "On-Going";
        else if (sPath === "Go-Live") sStatus = "Go-Live"
        else if (sPath === "Past") sStatus = "Past"

        oAddProjectModel.setProperty("/status", sStatus);
        oAddProjectModel.setProperty("/allProjects", false);
        this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddProject");

      },

      onSubmitNewProject: function (oEvent) {

        var that = this;
        //var oDialog = oEvent.getSource().getParent().getParent();
        var oAddProjectModel = this.getView().getModel("AddProjectModel");
        var oData = oAddProjectModel.getData();
        if (oData.account && oData.status) {
          this.resetValueState();

          var inumber = this.getView().getBindingContext().getObject().inumber;

          var sStartDate, sEndDate, sGoLiveDate;
          if (oData.projectStartDate) sStartDate = new Date(oData.projectStartDate).toISOString().split("T")[0];
          if (oData.projectEndDate) sEndDate = new Date(oData.projectEndDate).toISOString().split("T")[0];
          if (oData.goLive) sGoLiveDate = new Date(oData.goLive).toISOString().split("T")[0];

          var sType = this.getApptType(oData.status);

          var oPayload = {
            userID_inumber: inumber,
            primaryContact: this.getView().getBindingContext().getObject().firstName,
            projectContact: oData.projectContact,
            account: oData.account,
            priority: oData.priority,
            marketUnit: oData.marketUnit,
            topic: oData.topic,
            status: oData.status,
            projectStartDate: sStartDate,
            projectEndDate: sEndDate,
            descriptionText: oData.descriptionText,
            percentage: oData.percentage,
            goLive: sGoLiveDate,
            lastUpdated: new Date(),
            type: sType,
            appointmentCategory: "Customer Project",
            appointmentIcon: "sap-icon://business-card",
            projectValue: oData.projectValue
          };

          var sPath = "/teamProjects"

          var oModel = this.getView().getModel();
          oModel.create(sPath, oPayload, {
            success: function (oData, response) {
              MessageToast.show("New Project created!");
              // oDialog.close();
              that.onCancelDialogPress();
              that.onStatusMethod(inumber);
              that.getView().getModel("ProjectModel").refresh();

              //oAddProjectModel.setData({});
            },
            error: function (oError) {
              sap.m.MessageBox.error("Project could not be created, check your input and try again.");
            }
          });
        } else this.ValueStateMethod();

      },
      getApptType: function (sStatus) {
        switch (sStatus) {
          case "New Requests":
            return "Type10";
          case "RFP":
            return "Type05";
          case "On-Going":
            return "Type01";
          case "Go-Live":
            return "Type08";
          case "Past":
            return "Type09";
          default:
            return "Type11";
        }

      },




      /* ------------------------------------------------------------------------------------------------------------
          Dialogs
     --------------------------------------------------------------------------------------------------------------*/


      onDialogOpen: function (fragmentName, sPath, sProjectID) {
        this.resetValueState();
        var bEdit = this.editDialog;
        var oEditModel = this.getView().getModel("editModel");
        oEditModel.setProperty("/editMode", false);

        var that = this;
        if (!this._pDialog) {
          this._pDialog = Fragment.load({
            name: fragmentName,
            controller: this
          }).then(function (_pDialog) {
            that.getView().addDependent(_pDialog);
            _pDialog.setEscapeHandler(function () {
              that.onCloseDialog();
            });
            return _pDialog;
          });
        }
        this._pDialog.then(function (_pDialog) {
          if (sPath) {
            //change this bit
            _pDialog.setContentWidth("750px");
            _pDialog.setContentHeight("550px");
            _pDialog.bindElement({
              path: sPath,
              parameters: {
                expand: "comments,skills,tools"
              }
            })
            that.onFilterSkills(sProjectID);
            that.onFilterTools(sProjectID);
            that.onFilterTopics(sProjectID); 


          }
          if (bEdit) {
            that.onBindMonth();

          }

          _pDialog.open();

        })
      },

      onFilterSkills(sProjectID) {
        var oList = sap.ui.getCore().byId("skillTokens")
        var oTemplate = sap.ui.getCore().byId("skillItem");
        var oSorter = new sap.ui.model.Sorter("skill", false);

        var aFilters = new Filter("projectID_projectID", FilterOperator.EQ, sProjectID);
        oList.bindAggregation("tokens", {
          template: oTemplate,
          path: "/skills",
          sorter: oSorter,
          filters: aFilters
        });
        oList.updateBindings();
      },

      onFilterTools(sProjectID) {
        var oList = sap.ui.getCore().byId("toolTokens")
        var oTemplate = sap.ui.getCore().byId("toolItem");
        var oSorter = new sap.ui.model.Sorter("tool", false);

        var aFilters = new Filter("projectID_projectID", FilterOperator.EQ, sProjectID);
        oList.bindAggregation("tokens", {
          template: oTemplate,
          path: "/teamTools",
          sorter: oSorter,
          filters: aFilters
        });
        oList.updateBindings();

      },

      onFilterTopics(sProjectID) {
        var oList = sap.ui.getCore().byId("topicTokens")
        var oTemplate = sap.ui.getCore().byId("topicItem");
        var oSorter = new sap.ui.model.Sorter("topic", false);

        var aFilters = new Filter("projectID_projectID", FilterOperator.EQ, sProjectID);
        oList.bindAggregation("tokens", {
            template: oTemplate,
            path: "/topics",
            sorter: oSorter,
            filters: aFilters
        });
        oList.updateBindings();

    },



      onCancelDialogPress: function (oEvent) {

        this.editDialog = false;
        this._pDialog.then(function (_pDialog) {
          _pDialog.close();
          _pDialog.destroy();
        });
        this._pDialog = null;
        this.getView().getModel("AddProjectModel").setData({});

      },

      onProjectPopup: function (oEvent) {

        var oBinding = oEvent.getSource().getParent().getBindingContext("ProjectModel");
        var oContext = oBinding.getObject();
        var sProjectID = oContext.projectID;

        this.sProjectID = oContext.projectID;
        var sPath = "/teamProjects/" + sProjectID;


        this.onDialogOpen("opportunity.opportunity.view.fragments.ViewProject", sPath, sProjectID);

      },

      onDeleteProjectPress: function (oEvent) {
        var oTable = this.getView().byId("PastTable");
        if (oTable.getSelectedItem() != undefined) {
          var oBinding = oTable.getSelectedItem().getBindingContext("ProjectModel");
          var oContext = oBinding.getObject();

          var sPath = "/teamProjects/" + oContext.projectID;
          var inumber = oContext.userID_inumber

          this.onDeleteItem(sPath, inumber);

        } else MessageToast.show("Please select a Project to delete first")



      },

      onDeleteItem: function (sPath, inumber) {
        var that = this;
        //var sPath = oBinding.getPath(); 
        var oModel = this.getView().getModel();
        sap.m.MessageBox.warning("Are you sure you want to delete the selected Project?", {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {


              oModel.remove(sPath, {
                success: function () {
                  that.onStatusMethod(inumber);
                  that.getView().getModel("ProjectModel").refresh();
                  sap.m.MessageToast.show("Project deleted successfully.");
                },
                error: function () {
                  sap.m.MessageToast.show("Project could not be deleted. Please try again.");
                }
              });

            }
          }
        });
      },

      onDeleteToken: function (oEvent) {
        var sPath = oEvent.getParameter("token").getBindingContext().sPath;

        var that = this;
        var oModel = this.getView().getModel();
        sap.m.MessageBox.warning("Are you sure you want to delete this token for the project?", {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {


              oModel.remove(sPath, {
                success: function () {
                  //that.onStatusMethod(inumber);
                  sap.m.MessageToast.show("Token deleted successfully.");
                },
                error: function () {
                  sap.m.MessageToast.show("Token could not be deleted. Please try again.");
                }
              });

            }
          }
        });


      },

      onAddProjectSkill: function (oEvent) {
        this.onPopover("opportunity.opportunity.view.fragments.addFragments.AddSkill", oEvent);

      },
      onAddProjectTool: function (oEvent) {
        this.onToolsPopover("opportunity.opportunity.view.fragments.addFragments.AddTool", oEvent);
      },

      onAddProjectTopic: function (oEvent) {
        this.onToolsPopover("opportunity.opportunity.view.fragments.addFragments.AddProjectTopic", oEvent);
    },


      onPopover: function (sFragment, oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        if (!this._pPopover) {
          this._pPopover = Fragment.load({
            //id: oView.getId(),
            name: sFragment,
            controller: this
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }

        this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });

      },
      onToolsPopover: function (sFragment, oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        if (!this._tPopover) {
          this._tPopover = Fragment.load({
            //id: oView.getId(),
            name: sFragment,
            controller: this
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }

        this._tPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });

      },

      onSubmitSkill: function (oEvent) {
        var oLocalModel = this.getView().getModel("localModel");
        var oItem = oLocalModel.getProperty("/skill");
        var oPayload = {
          skill: oItem,
          userID_inumber: this.inumber,
          projectID_projectID: this.sProjectID
        };
        var oModel = this.getView().getModel();
        oModel.create("/skills", oPayload, {
          success: function (oData, response) {
            MessageToast.show("New Skill added");
            oLocalModel.setData({});
          },
          error: function (oError) {
            sap.m.MessageBox.error("Skill could not be added, check your input and try again.");
          }
        });
      },

      onSubmitTool: function (oEvent) {
        var oLocalModel = this.getView().getModel("localModel");
        var oItem = oLocalModel.getProperty("/tool");
        var oPayload = {
          tool: oItem,
          userID_inumber: this.inumber,
          projectID_projectID: this.sProjectID
        };
        var oModel = this.getView().getModel();
        oModel.create("/teamTools", oPayload, {
          success: function (oData, response) {
            MessageToast.show("New Tool added");
            oLocalModel.setData({});
          },
          error: function (oError) {
            sap.m.MessageBox.error("Tool could not be added, check your input and try again.");
          }
        });
      },

      onSubmitTopic: function (oEvent) {
        var oLocalModel = this.getView().getModel("localModel"); 
        var oItem = oLocalModel.getProperty("/topic");
        var oPayload = {
            topic: oItem,
            projectID_projectID: this.sProjectID
        };
        var oModel = this.getView().getModel();
        oModel.create("/topics", oPayload, {
            success: function (oData, response) {
                MessageToast.show("New Topic added");
               oLocalModel.setData({}); 
            },
            error: function (oError) {
                sap.m.MessageBox.error("Topic could not be added, check your input and try again.");
            }
        });
    },

      onEditProject: function (oEvent) {

        var oNavContainer = sap.ui.getCore().byId("navContainer");
        var oEditModel = this.getView().getModel("editModel");
        var bEdit = oEditModel.getProperty("/editMode");
        if (bEdit) {
          oEditModel.setProperty("/editMode", false);
          oNavContainer.to("dynamicPageId", "show");
        } else if (!bEdit) {
          oEditModel.setProperty("/editMode", true);
          oNavContainer.to("dynamicPage2", "show");
        }


      },

      onSaveProject: function (oEvent) {
        var that = this;

        var oContext = oEvent.getSource().getParent().getBindingContext().getObject();

        var sPath = oEvent.getSource().getParent().getBindingContext().sPath;

        var goLiveDate, startDate, endDate;
        var sGoLive = sap.ui.getCore().byId("goLiveDate").getValue();
        var sStartDate = sap.ui.getCore().byId("projectDates").getDateValue();
        var sEndDate = sap.ui.getCore().byId("projectDates").getSecondDateValue();

        if (sGoLive) goLiveDate = new Date(sGoLive).toISOString().split("T")[0];
        if (sStartDate) startDate = new Date(sStartDate).toISOString().split("T")[0];
        if (sEndDate) endDate = new Date(sEndDate).toISOString().split("T")[0];

        var sOwner = this.inumber;
        var oPayload = {
          goLive: goLiveDate,
          projectContact: sap.ui.getCore().byId("projectContact").getValue(),
          marketUnit: sap.ui.getCore().byId("projectMU").getValue(),
          topic: sap.ui.getCore().byId("projectTopic").getValue(),
          projectStartDate: sap.ui.getCore().byId("projectDates").getDateValue(),
          projectEndDate: sap.ui.getCore().byId("projectDates").getSecondDateValue(),
          descriptionText: sap.ui.getCore().byId("projectDesc").getValue(),
          percentage: sap.ui.getCore().byId("projectPercentage").getValue(),
          lastUpdated: new Date(),
          projectValue: sap.ui.getCore().byId("projectValue").getValue(),
        }


        var oModel = this.getView().getModel();
        oModel.update(sPath, oPayload, {
          success: function () {

            that.getView().setBusy(false);
            MessageToast.show(oContext.account + " updated successfully.")
            that.onEditProject();
            that.onStatusMethod(sOwner);
            that.onCancelDialogPress();
          },
          error: function (oError) {
            MessageToast.show(oError.message);
            that.getView().setBusy(false);
          }
        });

      },

      beforeRebindUtilizationChart: function (oEvent) {

        var oBindingParams = oEvent.getParameter('bindingParams');
        var oFilter = new Filter("userID_inumber", FilterOperator.EQ, this.inumber);
        oBindingParams.filters.push(oFilter);

        var oSorter = new sap.ui.model.Sorter("order", false);
        oBindingParams.sorter.push(oSorter);


      },

      onAddNewForecast: function (oEvent) {
        this.editDialog = false;

        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let sMonth = month[new Date().getMonth()];
        oAddProjectModel.setProperty("/month", sMonth);
        oAddProjectModel.setProperty("/year", new Date().getUTCFullYear());
        oAddProjectModel.setProperty("/forecast", 100);
        oAddProjectModel.setProperty("/actual", 100);


        this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddNewForecast");

      },

      onForecastEdit: function (oEvent) {
        this.editDialog = true;

        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        // const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        // let sMonth = month[new Date().getMonth()];
        // oAddProjectModel.setProperty("/month", sMonth);

        this.onDialogOpen("opportunity.opportunity.view.fragments.editFragments.EditForecast");

      },
      onBindMonth: function (oEvent) {

        var oTemplate = sap.ui.getCore().byId("monthItem");
        var oSorter = new sap.ui.model.Sorter("order", false);
        var ComboBox = sap.ui.getCore().byId("monthComboBox");

        var aFilters = [];
        var oFilter = new Filter("userID_inumber", FilterOperator.EQ, this.inumber);
        aFilters.push(oFilter);
        ComboBox.bindAggregation("items", {
          template: oTemplate,
          path: "/teamForecast",
          sorter: oSorter,
          filters: aFilters
        });


      },

      onSelectionChange: function (oEvent) {
        this.resetValueState();
        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        this.forecastPath = oEvent.mParameters.selectedItem.getBindingContext();
        var oData = oEvent.mParameters.selectedItem.getBindingContext().getObject();

        var oSelect = {
          userID_inumber: this.inumber,
          month: oData.month,
          year: oData.year,
          forecast: oData.forecast,
          actual: oData.actual,
          order: oData.order

        };

        oAddProjectModel.setData(oSelect);

      },

      onEditForecastSubmit: function (oEvent) {

        this.editDialog = false;
        var that = this;

        var oChart = this.getView().byId("smartChartTeamForecast");

        var that = this;
        var oAddProjectModel = this.getView().getModel("AddProjectModel");
        var oPayload = oAddProjectModel.getData();

        if (this.forecastPath) {
          this.resetValueState();
          that.getView().setBusy(true);
          var sPath = this.forecastPath.sPath;

          var oModel = this.getView().getModel();
          oModel.update(sPath, oPayload, {
            success: function (oData, response) {
              MessageToast.show("Forecast has been updated!");
              that.onCancelDialogPress();
              oChart.rebindChart();
              that.getView().setBusy(false);
            },
            error: function (oError) {
              sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");
              that.getView().setBusy(false);
            }
          });
        } else this.ValueStateMethod();

      },


      onSubmitNewForecast: function (oEvent) {

        var that = this;
        that.getView().setBusy(true);
        var oChart = this.getView().byId("smartChartTeamForecast");

        var that = this;
        var oAddProjectModel = this.getView().getModel("AddProjectModel");
        var oData = oAddProjectModel.getData();

        var sYear = this.getView().getModel("AddProjectModel").getProperty("/year");


        var sOrder = this.onMonthOrder(oData.month);

        var oPayload = {
          userID_inumber: this.inumber,
          month: oData.month,
          year: sYear,
          forecast: oData.forecast,
          actual: oData.actual,
          order: sOrder

        };

        var sPath = "/teamForecast"

        if (sYear && oData.month) {
          this.resetValueState();

          var oModel = this.getView().getModel();
          oModel.create(sPath, oPayload, {
            success: function (oData, response) {
              MessageToast.show("New Forecast has been added!");
              that.onCancelDialogPress();
              oChart.rebindChart();
              that.getView().setBusy(false);
            },
            error: function (oError) {
              sap.m.MessageBox.error("Forecast could not be updated, check your input and try again.");
              that.getView().setBusy(false);
            }
          });
        } else {
          this.ValueStateMethod();
          that.getView().setBusy(false);
        }

      },

      onMonthOrder(sDate) {
        switch (sDate) {
          case "January":
            return 1;
          case "February":
            return 2;
          case "March":
            return 3;
          case "April":
            return 4;
          case "May":
            return 5;
          case "June":
            return 6;
          case "July":
            return 7;
          case "August":
            return 8;
          case "September":
            return 9;
          case "October":
            return 10;
          case "November":
            return 11;
          case "December":
            return 12;
          default:
            return "";
        }

      },

      /* ------------------------------------------------------------------------------------------------------------
         VALUE STATE
         --------------------------------------------------------------------------------------------------------------*/


      ValueStateMethod: function (oEvent) {
        var oValueStateModel = this.getView().getModel("valueState");
        MessageToast.show("Please fill all mandatory fields");
        oValueStateModel.setProperty("/valueState", ValueState.Error);
        oValueStateModel.setProperty("/valueStateText", "This field is mandatory");

      },

      resetValueState: function (oEvent) {
        var oValueStateModel = this.getView().getModel("valueState");
        oValueStateModel.setProperty("/valueState", ValueState.None);
        oValueStateModel.setProperty("/valueStateText", "");
      },

      onChangeValueState: function (oEvent) {
        var sValue = oEvent.mParameters.newValue;
        if (sValue) this.resetValueState();
      }




    });
  });
