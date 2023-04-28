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
        }

        

    
      });
    }
  );
  