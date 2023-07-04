

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

          var oChart2 = this.getView().byId("smartChart2");
          if(oChart2.isInitialised())oChart2.rebindChart();
          //oChart2.attachBeforeRebindChart(this.onRebindUtilizationChart, this);

          var oChart3 = this.getView().byId("smartChart3");
          if(oChart3.isInitialised())oChart3.rebindChart();

     },

     onRebindUtilizationChart: function(oEvent){

      var oBindingParams = oEvent.getParameter('bindingParams');
      var oSorter = new sap.ui.model.Sorter("order", false);
      oBindingParams.sorter.push(oSorter);

     },

     onBeforeRebindChart: function(oEvent){

      var oBindingParams = oEvent.getParameter('bindingParams');
      var oSorter = new sap.ui.model.Sorter("marketUnit", false);
      oBindingParams.sorter.push(oSorter);

     },



        

    
      });
    }
  );
  