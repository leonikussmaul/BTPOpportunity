

sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(Controller) {
      "use strict";
  
      return Controller.extend("opportunity.opportunity.controller.ChartPage", {
        onInit() {

         sap.ui.core.UIComponent.getRouterFor(this).getRoute("ChartPage").attachPatternMatched(this._onRoutePatternMatched, this);
       },

        _onRoutePatternMatched: function (oEvent) {
      
          var oChart1 = this.getView().byId("smartChart1");
          if(oChart1.isInitialised())oChart1.rebindChart();

          var oChart1 = this.getView().byId("smartChart2");
          if(oChart1.isInitialised())oChart1.rebindChart();

          var oChart1 = this.getView().byId("smartChart3");
          if(oChart1.isInitialised())oChart1.rebindChart();

     },

     onBeforeRebindChart: function(oEvent){
      
     }


        

    
      });
    }
  );
  