sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/model/json/JSONModel","../model/formatter","sap/m/library"],function(t,o,e,r){"use strict";return t.extend("opportunity.opportunity.controller.MasterTeam",{formatter:e,onInit(){this.oRouter=this.getOwnerComponent().getRouter();this.oRouter.attachRouteMatched(this.onRouteMatched,this)},onRouteMatched:function(t){var o=this.getOwnerComponent().getModel("FlexColLayoutModel");o.setProperty("/layout","TwoColumnsMidExpanded")}})});