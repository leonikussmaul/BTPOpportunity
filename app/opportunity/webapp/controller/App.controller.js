sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    'sap/m/library',
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/m/MessageBox',
  ],
  function (BaseController, library, Fragment, formatter, Filter, FilterOperator, FilterType, UIComponent, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("opportunity.opportunity.controller.App", {
      formatter: formatter,

      onInit() {

        var oLocalModel = new JSONModel({});
        this.getView().setModel(oLocalModel, "localModel");

        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);

      },


      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onHomeIconPressed: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("Overview");
        this.getView().byId("sideNavigation").setSelectedItem(null);
      },

      onOpenSAPOne: function () {
        var sUrlSAPOne = 'https://one.int.sap/home';
        library.URLHelper.redirect(sUrlSAPOne, true);
      },

      onOpenSharePoint: function () {
        var sUrlSharePoint = 'https://sap.sharepoint.com/sites/201967';
        library.URLHelper.redirect(sUrlSharePoint, true);
      },

      onOpenServiceCatalog: function () {
        var sUrlServiceCatalog = 'https://servicescatalog.cvdp3eof-dbsservic1-p1-public.model-t.cc.commerce.ondemand.com/';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenAnalyticsStore: function () {
        var sUrlAnalyticsStore = 'https://eas.sap.com/astore/ui/index.html#assets';
        library.URLHelper.redirect(sUrlAnalyticsStore, true);
      },


      onNavToTasksPage: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

        var oBtn = oEvent.getSource();

        var viewName = window.location.href.split('#')[1];
        if (viewName != '' && oBtn.getText() != "Go to Tasks") {
          oRouter.navTo("OpportunityReport");
          oBtn.setText("Go to Tasks");

        } else {
          oRouter.navTo("TasksReport");
          oBtn.setText("Go to Opportunities");
        }

      },

      onNavToOpportunities: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("OpportunityReport");
      },

      onNavToTeamEngagement: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TeamEngagement");
      },

      onNavToTasks: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TasksReport");
      },

      onToggleSideMenu: function (oEvent) {

        var oToolPage = this.byId("toolPage");
        var bSideExpanded = oToolPage.getSideExpanded();
        oToolPage.setSideExpanded(!bSideExpanded);
      },

      onOpenAbout: function (oEvent) {
        //sap.m.MessageToast.show("Details will come soon! Stay tuned.");
        this.onDialogOpen("opportunity.opportunity.view.fragments.InfoPopup");

      },

      onOpenTeamChart: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TeamChart");
      },


      onOpenPopover: function (oEvent, sFragment) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        if (!this._pPopover) {
          this._pPopover = Fragment.load({
            id: oView.getId(),
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


      onCancelDialogPress: function (oEvent) {
        this.editDialog = false;
        this._pDialog.then(function (_pDialog) {
          _pDialog.close();
          _pDialog.destroy();
        });
        this._pDialog = null;
        this.getView().getModel("localModel").setData({});

      },

      onOpenIndividualEngagement: function (oEvent) {
        // Adjusted function call with the correct fragment name and path
        this.onDialogOpen("opportunity.opportunity.view.fragments.TeamSelection");
    },
    
    onDialogOpen: function (fragmentName) {
        var that = this;
        if (!this._pDialog) {
            this._pDialog = Fragment.load({
                name: fragmentName,
                controller: this
            }).then(function (oDialog) {
                that.getView().addDependent(oDialog);
                oDialog.setEscapeHandler(function () {
                    that.onCloseDialog();
                });
                return oDialog;
            });
        }
        this._pDialog.then(function (oDialog) {
            oDialog.open();
        });
    },
    
    onCloseDialog: function () {
        this._pDialog.then(function (oDialog) {
            oDialog.close();
        });
        this.getOwnerComponent().getModel("global").setProperty("/selectedKey", "");
    },
    
      onOpenCalendar: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("Calendar");
      },

      onSelectTeamMember: function (oEvent) {
        var inumber = oEvent.getParameter("listItem").getBindingContext().getObject().inumber;

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("IndividualEngagement", {
          inumber: inumber
        }
        );
        this.onCloseDialog(); 

      },

      onSearchTeamMember: function (oEvent) {

        var aFilters = [];
        var sQuery = oEvent.getSource().getValue();
        if (sQuery && sQuery.length > 0) {
          var aFilters = [
            new Filter({
              filters: [
                new Filter({ path: "firstName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "lastName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
              ],
              and: false
            })
          ];
        }

        var oList = sap.ui.getCore().byId("teamMemberList").getBinding("items");
        oList.filter(aFilters, FilterType.Application);

      },

      onSubmitFeedback: function (oEvent) {
        var that = this;
        var oLocalModel = this.getView().getModel("localModel");

        var oData = oLocalModel.getData();
        if (oData.feedback) {

          var sPostedBy = this.getOwnerComponent().getModel("user").getProperty("/firstname");


          var bPositive;

          if (oData.positive === true) bPositive = true;
          else if (oData.negative === true) bPositive = false;

          var oPayload = {
            feedback: oData.feedback,
            positive: bPositive,
            postedBy: sPostedBy,
            postedOn: new Date()
          }

          that.getView().setBusy(true);
          var oModel = that.getView().getModel();
          oModel.create("/userFeedback", oPayload, {
            success: function (oData, response) {
              MessageToast.show("Your Feedback has been registered. Thank you!");
              that.getView().setBusy(false);
            },
            error: function (oError) {
              that.getView().setBusy(false);
              var sMessage = JSON.parse(oError.responseText).error.message.value;
              sap.m.MessageBox.error(sMessage);

            }
          });
        } else MessageToast.show("Please enter your feedback first");


      },
      onTogglePositiveFeedback: function () {
        var oLocalModel = this.getView().getModel("localModel");
        oLocalModel.setProperty("/positive", true);
        oLocalModel.setProperty("/negative", false);
      },

      onToggleNegativeFeedback: function () {
        var oLocalModel = this.getView().getModel("localModel");
        oLocalModel.setProperty("/positive", false);
        oLocalModel.setProperty("/negative", true);
      },

      onThemePicker: function (oEvent) {
        var sTheme = oEvent.getParameters().item.getKey();
        if (sTheme === "MorningHorizon") {
          sap.ui.getCore().applyTheme("sap_horizon");

        } else if (sTheme === "EveningHorizon") {
          sap.ui.getCore().applyTheme("sap_horizon_dark");

        }

      },
      onRouteMatched: function (oEvent) {
        var sRouteName = oEvent.getParameter("name"),
          oArguments = oEvent.getParameter("arguments");

        // Save the current route name
        this.currentRouteName = sRouteName;
        this.opportunityID = oArguments.opportunityID;
      },

      onStateChanged: function (oEvent) {
        var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
          sLayout = oEvent.getParameter("layout");

        // Replace the URL with the new layout if a navigation arrow was used
        if (bIsNavigationArrow) {
          this.oRouter.navTo(this.currentRouteName, { layout: sLayout, opportunityID: this.opportunityID }, true);
        }
      },

      onExit: function () {
        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
      }


    });
  }
);

