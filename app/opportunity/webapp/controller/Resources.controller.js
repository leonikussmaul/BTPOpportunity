sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/ui/core/Fragment",
  "../model/formatter",
  "sap/m/MessageToast"
],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, Fragment, formatter, MessageToast) {
    "use strict";



    return Controller.extend("opportunity.opportunity.controller.Resources", {
      formatter: formatter,
      onInit: function () {
        sap.ui.core.UIComponent.getRouterFor(this).getRoute("Resources").attachPatternMatched(this._onRoutePatternMatched, this);
        var oProjectModel = new JSONModel({});
        this.getView().setModel(oProjectModel, "ProjectModel");

      },

      _onRoutePatternMatched: function (oEvent) {
        var inumber = oEvent.getParameter("arguments").inumber;

        this.getView().bindElement({
          path: "/teamMembers/" + inumber,
          parameters: {
            expand: "skills,tools,projects"
          }
        });

        this.onStatusMethod(inumber);

      },

      onStatusMethod: function (inumber) {
        var that = this;
        var aStatus = [
          { status: "Sent for Proposal", name: "/sentForProposal" },
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


      onAddToDoPress: function (oEvent) {

      },

      onDropSentForProposal: function (oEvent) {

      },

      onDrop: function (oEvent) {

        var that = this;

        var oDropTarget = oEvent.getSource().getDropTarget();
        // i.e. = "/RFP"
        //var sPath = oEvent.getSource().getDropTarget().mBindingInfos.items.path;
        var sDropPath = oEvent.getSource().getDropTarget().mBindingInfos.items.path;
        var sNewStatus = sDropPath.substr(1);

        if (sNewStatus === "sentForProposal") sNewStatus = "Sent for Proposal";

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

      onDropSelected: function (oEvent) {
        alert("drop selected")

      },

      //right
      onRightSentForProposal: function(){
        var oTable = this.getView().byId("sentForProposalTable");
        this.onMoveSelectedRight(oTable); 
      },

      onRightRFP: function(){
        var oTable = this.getView().byId("RFPTable");
        this.onMoveSelectedRight(oTable); 
      },

      onRightOnGoing: function(){
        var oTable = this.getView().byId("OnGoingTable");
        this.onMoveSelectedRight(oTable); 
      },
      onRightGoLive: function(){
        var oTable = this.getView().byId("GoLiveTable");
        this.onMoveSelectedRight(oTable); 
      },

      // left
      onLeftPast: function(){
        var oTable = this.getView().byId("PastTable");
        this.onMoveSelectedLeft(oTable); 
      },

      onLeftRFP: function(){
        var oTable = this.getView().byId("RFPTable");
        this.onMoveSelectedLeft(oTable); 
      },

      onLeftOnGoing: function(){
        var oTable = this.getView().byId("OnGoingTable");
        this.onMoveSelectedLeft(oTable); 
      },
      onLeftGoLive: function(){
        var oTable = this.getView().byId("GoLiveTable");
        this.onMoveSelectedLeft(oTable); 
      },

      onMoveSelectedRight: function (oTable) {
        var oBinding = oTable.getSelectedItem().getBindingContext("ProjectModel");
        var oContext = oBinding.getObject();

        var sNewStatus; 
        if (oContext.status === "Sent for Proposal") {
          //update to RFP
          sNewStatus = "RFP";
        } else if(oContext.status  === "RFP"){
          sNewStatus = "On-Going"
        }else if(oContext.status  === "On-Going"){
          sNewStatus = "Go-Live"
        }else if(oContext.status  === "Go-Live"){
          sNewStatus = "Past"
        }
        this.onUpdateWithArrow(oContext,sNewStatus); 
      },

      onMoveSelectedLeft: function (oTable) {
        var oBinding = oTable.getSelectedItem().getBindingContext("ProjectModel");
        var oContext = oBinding.getObject();

        var sNewStatus; 
        if (oContext.status === "RFP") {
          sNewStatus = "Sent for Proposal";
        } else if(oContext.status  === "On-Going"){
          sNewStatus = "RFP"
        }else if(oContext.status  === "Go-Live"){
          sNewStatus = "On-Going"
        }else if(oContext.status  === "Past"){
          sNewStatus = "Go-Live"
        }
        this.onUpdateWithArrow(oContext,sNewStatus); 
      },


      onUpdateWithArrow: function(oContext,sNewStatus){
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

      }



    });
  });
