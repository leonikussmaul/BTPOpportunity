sap.ui.define(
    [
        "sap/ui/core/mvc/Controller",
        'sap/m/library'
    ],
    function(BaseController, library) {
      "use strict";
  
      return BaseController.extend("opportunity.opportunity.controller.App", {
        onInit() {
        },

       
        onHomeIconPressed: function(){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("MainReport");
          this.getOwnerComponent().getModel("globalModel").setProperty("/buttonText", "Go to Tasks");
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
          var sUrlServiceCatalog ='https://servicescatalog.cvdp3eof-dbsservic1-p1-public.model-t.cc.commerce.ondemand.com/';
          library.URLHelper.redirect(sUrlServiceCatalog, true);
        },

        onOpenAnalyticsStore: function(){
          var sUrlAnalyticsStore = 'https://eas.sap.com/astore/ui/index.html#assets';
          library.URLHelper.redirect(sUrlAnalyticsStore, true);
        },


        onNavToTasksPage: function(oEvent){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

          var oBtn = oEvent.getSource();

          var viewName = window.location.href.split('#')[1]; 
          if(viewName != '' && oBtn.getText() != "Go to Tasks"){
            oRouter.navTo("MainReport");
            oBtn.setText("Go to Tasks");

          } else{
            oRouter.navTo("TasksReport");
            oBtn.setText("Go to Opportunities");
          }
           

          // var oGlobalModel = this.getOwnerComponent().getModel("globalModel"); 
          // var sViewName = oGlobalModel.getProperty("/viewName");
         

      },

      onNavToOpportunities: function(oEvent){
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("MainReport");
        },

        onNavToTasks: function(oEvent){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("TasksReport");
          },


      onNavToChartPage: function(oEvent){
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
          oRouter.navTo("ChartPage");
        },

        onToggleSideMenu: function(oEvent){

          var oToolPage = this.byId("toolPage");
          var bSideExpanded = oToolPage.getSideExpanded();
          oToolPage.setSideExpanded(!bSideExpanded);
         // this.byId("sideNavigation").setVisible(!bSideExpanded);
        },

        onOpenAbout: function(oEvent){
          sap.m.MessageToast.show("Details will come soon! Stay tuned.")
        },

        onOpenTeam: function(oEvent){
          var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("Team");
          },

          onOpenResources: function(oEvent){
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
              oRouter.navTo("Resources");
            },

        

             
             
          

      });
    }
  );
  
