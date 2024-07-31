sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "../model/formatter",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/library",
  'sap/m/MessageBox',
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Fragment, formatter, MessageToast, Filter, FilterOperator, CoreLibrary, MessageBox) {
    "use strict";
    var ValueState = CoreLibrary.ValueState,
      oValueState = {
        valueState: ValueState.None,
        valueStateText: ""
      };

    return Controller.extend("opportunity.opportunity.controller.IndividualEngagement", {
      formatter: formatter,
      onInit: function () {
        sap.ui.core.UIComponent.getRouterFor(this).getRoute("IndividualEngagement").attachPatternMatched(this._onRoutePatternMatched, this);
        var oProjectModel = new JSONModel({});
        this.getView().setModel(oProjectModel, "ProjectModel");

        var AddProjectModel = new JSONModel({});
        this.getView().setModel(AddProjectModel, "AddProjectModel");

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

        //yes, I am converting Date to String to int, but is there really a better way?
        let currentYear = parseInt(new Date().getFullYear().toString());
        const firstYear = 2022;

        //future-proofing
        let listYears = [];
        for (let i = firstYear; i <= currentYear; i++) {
          listYears.push({ "year": i });
        }

        var oYearModel = new JSONModel({
          filterYear: currentYear,
          listYears: listYears
        });
        this.getView().setModel(oYearModel, "oYearModel");
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

        var oGlobalModel = this.getOwnerComponent().getModel("global");
        oGlobalModel.setProperty("/layout", "OneColumn");
        oGlobalModel.setProperty("/selectedKey", "Engagement");
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

        //var oDropTarget = oEvent.getSource().getDropTarget();
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
          function(oError) {
            that.getView().setBusy(false);
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageToast.show(sMessage);
          }
        });
      },

      onAddProjectPress: function (oEvent) {
        var sTeamMember = this.getView().getBindingContext().getObject().inumber;
        var oAddProjectModel = this.getView().getModel("AddProjectModel");
        oAddProjectModel.setProperty("/userID_inumber", sTeamMember)
        // AddProjectModel>/userID_inumber
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
          const now = new Date().toISOString().split("T")[0];

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
            lastUpdated: now,
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
              var sMessage = JSON.parse(oError.responseText).error.message.value;
              sap.m.MessageBox.error(sMessage);

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
            _pDialog.setContentWidth("1000px");
            _pDialog.setContentHeight("650px");
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
          var bAddProjectDialog = sap.ui.getCore().byId("userComboBox");
          if (bAddProjectDialog) bAddProjectDialog.setEnabled(false);

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

        this.getView().byId("newRequestsTable").removeSelections(true);
        this.getView().byId("RFPTable").removeSelections(true);
        this.getView().byId("OnGoingTable").removeSelections(true);
        this.getView().byId("GoLiveTable").removeSelections(true);
        this.getView().byId("PastTable").removeSelections(true);

      },

      onProjectPopup: function (oEvent, oContext) {

        var oBinding = oEvent.getSource().getParent().getBindingContext("ProjectModel");
        // var oContext = oBinding.getObject();
        var sProjectID = oContext.projectID;

        this.sProjectID = oContext.projectID;
        var sPath = "/teamProjects/" + sProjectID;


        this.onDialogOpen("opportunity.opportunity.view.fragments.ProjectDetail", sPath, sProjectID);
        this.getView().setBusy(false);

      },

      onDeleteProjectPress: function (oEvent) {
        var oBinding = oEvent.getSource().getParent().getParent().getBindingContext();
        var oContext = oBinding.getObject();

        var sPath = "/teamProjects/" + oContext.projectID;
        var inumber = oContext.userID_inumber
        this.onDeleteItem(sPath, inumber);

      },

      onDeleteItem: function (sPath, inumber) {
        var that = this;
        //var sPath = oBinding.getPath(); 
        var oModel = this.getView().getModel();
        sap.m.MessageBox.warning("Are you sure you want to delete the selected Project?", {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {

              oModel.remove(sPath, {
                success: function () {
                  that.onStatusMethod(inumber);
                  that.getView().getModel("ProjectModel").refresh();
                  sap.m.MessageToast.show("Project deleted successfully");
                  that.onCancelDialogPress();
                },
                error: function (oError) {
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  sap.m.MessageToast.show(sMessage);
                }

              });

            }
          }
        });
      },

      onDeleteToken: function (oEvent) {
        var sPath = oEvent.getParameter("token").getBindingContext().sPath;
        var oModel = this.getView().getModel();
        sap.m.MessageBox.warning("Are you sure you want to delete this token for the project?", {
          actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
          emphasizedAction: MessageBox.Action.OK,
          onClose: function (sAction) {
            if (sAction === MessageBox.Action.OK) {


              oModel.remove(sPath, {
                success: function () {
                  //that.onStatusMethod(inumber);
                  sap.m.MessageToast.show("Token deleted successfully.");
                },
                error: function (oError) {
                  var sMessage = JSON.parse(oError.responseText).error.message.value;
                  sap.m.MessageToast.show(sMessage);
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
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageBox.error(sMessage);

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
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageBox.error(sMessage);

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
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageBox.error(sMessage);

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
        const now = new Date().toISOString().split("T")[0];
        var sOwner = this.inumber;
        var oPayload = {
          account: sap.ui.getCore().byId("projectAccount").getValue(),
          goLive: goLiveDate,
          projectContact: sap.ui.getCore().byId("projectContact").getValue(),
          marketUnit: sap.ui.getCore().byId("projectMU").getValue(),
          topic: sap.ui.getCore().byId("projectTopic").getValue(),
          projectStartDate: startDate,
          projectEndDate: endDate,
          percentage: sap.ui.getCore().byId("projectPercentage").getValue(),
          lastUpdated: now
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
            that.getView().setBusy(false);
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageToast.show(sMessage);
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

      onAddEditForecast: function (oEvent) {
        this.editDialog = false;

        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        let sMonth = month[new Date().getMonth()];
        oAddProjectModel.setProperty("/month", sMonth);
        oAddProjectModel.setProperty("/year", new Date().getUTCFullYear());
        oAddProjectModel.setProperty("/forecast", 100);
        oAddProjectModel.setProperty("/actual", 100);

        this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddEditForecast");

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
        this.getView().setBusy(true);
        this.resetValueState();
        var oAddProjectModel = this.getView().getModel("AddProjectModel");

        this.forecastPath = oEvent.mParameters.listItem.getBindingContext();
        var oData = oEvent.mParameters.listItem.getBindingContext().getObject();

        var oSelect = {
          userID_inumber: this.inumber,
          month: oData.month,
          year: oData.year,
          forecast: oData.forecast,
          actual: oData.actual,
          order: oData.order

        };

        oAddProjectModel.setData(oSelect);

        var oContext = oEvent.mParameters.listItem.getBindingContext("ProjectModel").getObject();
        this.onProjectPopup(oEvent, oContext);

      },

      onEditForecastSubmit: function (oEvent) {
        this.editDialog = false;
        var that = this;

        var oChart = this.getView().byId("smartChartTeamForecast");
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
              that.getView().setBusy(false);
              var sMessage = JSON.parse(oError.responseText).error.message.value;
              sap.m.MessageBox.error(sMessage);

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
        var oModel = this.getOwnerComponent().getModel();

        let aFilters = [];
        aFilters.push(new sap.ui.model.Filter("userID_inumber", "EQ", this.inumber));

        //getting the current forecasts for this user
        oModel.read(sPath, {
          filters: aFilters,
          success: function (oResponse) {
            let aCurrentForecasts = oResponse.results;
            let bFlagUpdate = false;
            let sUpdatePath = sPath + "/";

            //check if we have a forecast for this month && year
            aCurrentForecasts.forEach((forecast) => {
              if (forecast.month === oData.month && forecast.year === sYear) {
                bFlagUpdate = true;
                sUpdatePath += String(forecast.forecastID);
              }
            });

            if (sYear && oData.month) {
              this.resetValueState();

              //handle update
              if (bFlagUpdate) {
                oModel.update(sUpdatePath, oData, {
                  success: function () {
                    MessageToast.show("Forecast has been updated!");
                    that.onCancelDialogPress();
                    oChart.rebindChart();
                    that.getView().setBusy(false);
                  },
                  error: function () {
                    that.getView().setBusy(false);
                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(sMessage);
                  }
                });
              }

              //handle creation of new entry
              else {
                oModel.create(sPath, oPayload, {
                  success: function (oData, response) {
                    MessageToast.show("New Forecast has been added!");
                    that.onCancelDialogPress();
                    oChart.rebindChart();
                    that.getView().setBusy(false);
                  },
                  error: function (oError) {
                    that.getView().setBusy(false);
                    var sMessage = JSON.parse(oError.responseText).error.message.value;
                    sap.m.MessageBox.error(sMessage);
                  }
                });
              }
            }
            else {
              this.ValueStateMethod();
              that.getView().setBusy(false);
            }
          }.bind(this),
          error: function (oError) {
            console.log(oError);
          }
        });
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

      //for year filter
      handleSelectionChange: function (oEvent) {
        let selection = oEvent.getSource().getValue();
        let asString = selection.toString();
        let oYearModel = this.getView().getModel("oYearModel");
        let oFilterBar = this.getView().byId("smartFilterBar");
        let oFilterData = oFilterBar.getFilterData();

        oYearModel.setProperty("/filterYear", selection);

        oFilterData.year.ranges[0] = {
          exclude: false,
          keyField: "year",
          operation: "EQ",
          tokenText: "=" + selection[0] + "," + selection[1] + selection[2] + selection[3],
          value1: selection,
          value2: ""
        }

        oFilterBar.setFilterData(oFilterData, true);
        console.log(oFilterBar.getFilterData());

        this.getView().byId("smartChartTeamForecast").rebindChart();
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
