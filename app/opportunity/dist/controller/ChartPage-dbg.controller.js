

sap.ui.define(
    [
        "sap/ui/core/mvc/Controller"
    ],
    function(Controller) {
      "use strict";
  
      return Controller.extend("opportunity.opportunity.controller.ChartPage", {
        onInit() {
        },


      onBeforeRebindChart: function(oEvent){
      
        var oBindingParams = oEvent.getParameter('bindingParams');
        var MUSorter = new sap.ui.model.Sorter('marketUnit', false);
        var ValueSorter = new sap.ui.model.Sorter('opportunityValue', true);
        oBindingParams.sorter.push(MUSorter);
        oBindingParams.sorter.push(ValueSorter);
        },

        onBeforeRebindQuarterChart: function(oEvent){
      
          var oBindingParams = oEvent.getParameter('bindingParams');
          var MUSorter = new sap.ui.model.Sorter('opportunityClosedQuarter', false);
         
          oBindingParams.sorter.push(MUSorter);

          
          },



        

    
      });
    }
  );
  