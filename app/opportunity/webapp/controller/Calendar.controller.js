sap.ui.define([
  'sap/ui/core/mvc/Controller',
  'sap/ui/model/json/JSONModel',
  'sap/m/MessageBox',
  'sap/ui/core/date/UI5Date',
  "../model/formatter",
  "sap/ui/core/Fragment",
  "sap/m/MessageToast",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
],
  function (Controller, JSONModel, MessageBox, UI5Date, formatter, Fragment, MessageToast, Filter, FilterOperator) {
    "use strict";

    return Controller.extend("opportunity.opportunity.controller.Calendar", {
      formatter: formatter,
      onInit: function () {
        sap.ui.core.UIComponent.getRouterFor(this).getRoute("Calendar").attachPatternMatched(this._onRoutePatternMatched, this);
        // create model

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


      onCancelDialogPress: function (oEvent) {
        this._pDialog.then(function (_pDialog) {
          _pDialog.close();
          _pDialog.destroy();
        });
        this._pDialog = null;

      },

      onDeleteToken: function (oEvent) {
        var sPath = oEvent.getParameter("token").getBindingContext().sPath;

        var that = this;
        that.getView().setBusy(true);
        var oModel = this.getView().getModel();
        sap.m.MessageBox.warning("Are you sure you want to delete this token for the project?", {
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          onClose: function (oAction) {
            if (oAction === sap.m.MessageBox.Action.YES) {


              oModel.remove(sPath, {
                success: function () {
                  //that.onStatusMethod(inumber);
                  that.getView().setBusy(false);
                  sap.m.MessageToast.show("Token deleted successfully.");
                },
                error: function () {
                  that.getView().setBusy(false);
                  sap.m.MessageToast.show("Token could not be deleted. Please try again.");
                }
              });

            }
          }
        });


      },

      onAddProjectSkill: function (oEvent) {
        this.onPopover("opportunity.opportunity.view.fragments.AddSkill", oEvent);

      },
      onAddProjectTool: function (oEvent) {
        this.onPopover("opportunity.opportunity.view.fragments.AddTool", oEvent);
      },


      onPopover: function (sFragment, oEvent) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        //if (!this._pPopover) {
        this._pPopover = Fragment.load({
          id: oView.getId(),
          name: sFragment,
          controller: this
        }).then(function (oPopover) {
          oView.addDependent(oPopover);
          return oPopover;
        });
        // }

        this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });

      },

      onSubmitSkill: function (oEvent) {
        var oInput = this.getView().byId("skillInput");
        var oPayload = {
          skill: oInput.getValue(),
          userID_inumber: this.inumber,
          projectID_projectID: this.sProjectID
        };
        var oModel = this.getView().getModel();
        oModel.create("/skills", oPayload, {
          success: function (oData, response) {
            MessageToast.show("New Skill added");
            oInput.setValue("");
          },
          error: function (oError) {
            sap.m.MessageBox.error("Skill could not be added, check your input and try again.");
          }
        });
      },

      onSubmitTool: function (oEvent) {
        var oInput = this.getView().byId("toolInput");
        var oPayload = {
          tool: oInput.getValue(),
          userID_inumber: this.inumber,
          projectID_projectID: this.sProjectID
        };
        var oModel = this.getView().getModel();
        oModel.create("/teamTools", oPayload, {
          success: function (oData, response) {
            MessageToast.show("New Tool added");
            oInput.setValue("");
          },
          error: function (oError) {
            sap.m.MessageBox.error("Tool could not be added, check your input and try again.");
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
          goLive: goLiveDate,
          projectContact: sap.ui.getCore().byId("projectContact").getValue(),
          marketUnit: sap.ui.getCore().byId("projectMU").getValue(),
          topic: sap.ui.getCore().byId("projectTopic").getValue(),
          projectStartDate: sap.ui.getCore().byId("projectDates").getDateValue(),
          projectEndDate: sap.ui.getCore().byId("projectDates").getSecondDateValue(),
          descriptionText: sap.ui.getCore().byId("projectDesc").getValue(),
          percentage: sap.ui.getCore().byId("projectPercentage").getValue(),
          // lastUpdated: new Date().toISOString().split("T")[0]
        }


        var oModel = this.getView().getModel();
        oModel.update(sPath, oPayload, {
          success: function () {

            that.getView().setBusy(false);
            MessageToast.show(oContext.account + " updated successfully.")
            that.onEditProject();
          },
          error: function (oError) {
            MessageToast.show(oError.message);
            that.getView().setBusy(false);
          }
        });

      },

      onAddVacation: function (oEvent) {
        this.onDialogOpen("opportunity.opportunity.view.fragments.AddVacation");
      },


      onMemberChange: function(oEvent){
        oEvent; 
        var oLocalModel = this.getView().getModel("localModel");
        var sName = oEvent.mParameters.selectedItem.getText();
        oLocalModel.getData().firstName = sName; 

      },
      onSubmitVacation: function (oEvent) {
        var oDialog = oEvent.getSource().getParent(); 

        var that = this; 
        var oLocalModel = this.getView().getModel("localModel");
        var oData = oLocalModel.getData();

        var sApproved; 
        if(oData.approved == true) sApproved = "Yes"; 
        else if(oData.approved == false) sApproved = "No"; 

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
               
                oDialog.close();
                oLocalModel.setData({}); 
                that.getView().setBusy(false);
            },
            error: function (oError) {
                that.getView().setBusy(false);
                MessageBox.error("Vacation could not be added. Please refresh and try again.");
            }
        });
        //}

      },

      onDateChange: function (oEvent) {
        var oLocalModel = this.getView().getModel("localModel");
        var dateArray = oEvent.mParameters.newValue.split(' - ')
        var startDate = new Date(dateArray[0]);
        var endDate = new Date(dateArray[1]);
        var timeDiff = endDate - startDate;
        var daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        console.log('Total vacation days:', daysDiff);
        oLocalModel.getData().totalDays = daysDiff; 
      },

      onIntervalSelect: function(oEvent){
        this.onPopover("opportunity.opportunity.view.fragments.AddTool", oEvent);

      }






    });

  });