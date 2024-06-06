sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox',
  'sap/ui/core/date/UI5Date',
  "../model/formatter",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/core/library"
],
  function (Controller, JSONModel, MessageBox, UI5Date, formatter, Fragment, MessageToast, Filter, FilterOperator, CoreLibrary) {
    "use strict";
    var ValueState = CoreLibrary.ValueState,
      oValueState = {
        valueState: ValueState.None,
        valueStateText: ""
      };

    return Controller.extend("opportunity.opportunity.controller.Calendar", {
      formatter: formatter,
      onInit: function () {
        sap.ui.core.UIComponent.getRouterFor(this).getRoute("Calendar").attachPatternMatched(this._onRoutePatternMatched, this);

        this.getView().setModel(new sap.ui.model.json.JSONModel(oValueState), "valueState");

        var oCalendarModel = new JSONModel({});
        this.getView().setModel(oCalendarModel, "CalendarModel");
        oCalendarModel.setProperty("/legendShown", false);

        var startDate = UI5Date.getInstance();
        oCalendarModel.setProperty("/startDate", startDate);


        var oEditModel = new JSONModel({
          editMode: false
        });
        this.getView().setModel(oEditModel, "editModel");

        var legendItems = [
          // {
          //     text: "Public holiday",
          //     type: "Type07"
          // },
          // {
          //     text: "Team building",
          //     type: "Type08"
          // },
          // {
          //     text: "Work from office 1",
          //     type: "Type05",
          //     color: "#ff69b4"
          // },
          // {
          //     text: "Work from office 2",
          //     type: "Type04",
          //     color: "#add8e6"
          // }
        ];

        var legendAppointmentItems = [
          {
            text: "Sent for Proposal",
            type: "Type10"
          },
          {
            text: "RFP",
            type: "Type05"
          },
          {
            text: "On-Going",
            type: "Type01"
          },
          {
            text: "Go-Live",
            type: "Type08"
          },
          {
            text: "Past",
            type: "Type09"
          }
        ];

        oCalendarModel.setProperty("/legendItems", legendItems);
        oCalendarModel.setProperty("/legendAppointmentItems", legendAppointmentItems);

        var oLocalModel = new JSONModel({});
        this.getView().setModel(oLocalModel, "localModel");


      },

      _onRoutePatternMatched: function () {
        var oGlobalModel = this.getOwnerComponent().getModel("global");
        oGlobalModel.setProperty("/layout", "OneColumn");
        oGlobalModel.setProperty("/selectedKey", "Calendar");
      },

      handleAppointmentSelect: function (oEvent) {
        var oAppointment = oEvent.getParameter("appointment"),
          sSelected;
        if (oAppointment) {
          sSelected = oAppointment.getSelected() ? "selected" : "deselected";
          MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);
        } else {
          var aAppointments = oEvent.getParameter("appointments");
          var sValue = aAppointments.length + " Appointments selected";
          MessageBox.show(sValue);
        }
      },


      onProjectPopup: function (oEvent) {

        var oAppointment = oEvent.getParameter("appointment");
        var sPath = oEvent.getParameter("appointment").getBindingContext().sPath;
        var sProjectID = oEvent.getParameter("appointment").getBindingContext().getObject().projectID;

        this.inumber = oAppointment.getBindingContext().getObject().userID_inumber;
        this.sProjectID = sProjectID;
        this.onDialogOpen("opportunity.opportunity.view.fragments.ViewProject", sPath, sProjectID);

      },

      onDialogOpen: function (fragmentName, sPath, sProjectID) {
        this.resetValueState();

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
        this._pDialog.then(function (_pDialog) {
          _pDialog.close();
          _pDialog.destroy();
        });
        this._pDialog = null;
        var oLocalModel = this.getView().getModel("localModel");
        oLocalModel.setData({});
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
            // id: oView.getId(),
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

        var oPayload = {
          account: sap.ui.getCore().byId("projectAccount").getValue(),
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
          },
          error: function (oError) {
            that.getView().setBusy(false);
            var sMessage = JSON.parse(oError.responseText).error.message.value;
            sap.m.MessageToast.show(sMessage);

          }
        });

      },

      onAddVacation: function (oEvent) {
        this.onDialogOpen("opportunity.opportunity.view.fragments.addFragments.AddVacation");
      },


      onMemberChange: function (oEvent) {
        oEvent;
        this.resetValueState();
        var oLocalModel = this.getView().getModel("localModel");
        var sName = oEvent.mParameters.selectedItem.getText();
        oLocalModel.getData().firstName = sName;

      },
      onSubmitVacation: function (oEvent) {

        var that = this;
        var oLocalModel = this.getView().getModel("localModel");
        var oData = oLocalModel.getData();
        if (oData.firstName && oData.vacationStartDate && oData.vacationEndDate) {
          this.resetValueState();

          var sApproved;
          if (oData.approved == true) sApproved = "Yes";
          else if (oData.approved == false) sApproved = "No";

          var oPayload = {
            vacationStartDate: oData.vacationStartDate,
            vacationEndDate: oData.vacationEndDate,
            approved: sApproved,
            vacationComment: oData.vacationComment,
            primaryContact: oData.firstName,
            userID_inumber: oData.userID_inumber
          }

          that.getView().setBusy(true);
          var oModel = that.getView().getModel();
          oModel.create("/teamVacations", oPayload, {
            success: function (oData, response) {
              MessageToast.show("New vacation added!");
              that.onCancelDialogPress();
              that.getView().setBusy(false);
            },
            error: function (oError) {
              that.getView().setBusy(false);
              var sMessage = JSON.parse(oError.responseText).error.message.value;
              sap.m.MessageBox.error(sMessage);

            }
          });
          //}
        } else this.ValueStateMethod();

      },

      onDateChange: function (oEvent) {
        this.resetValueState();
        var oLocalModel = this.getView().getModel("localModel");
        var dateArray = oEvent.mParameters.newValue.split(' - ')
        var startDate = new Date(dateArray[0]);
        var endDate = new Date(dateArray[1]);
        var timeDiff = endDate - startDate;
        var daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log('Total vacation days:', daysDiff);
        oLocalModel.getData().totalDays = daysDiff;
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