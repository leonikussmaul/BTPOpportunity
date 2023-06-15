sap.ui.define(["sap/ui/core/mvc/Controller","sap/m/library"],function(e,t){"use strict";return e.extend("opportunity.opportunity.controller.App",{onInit(){},onHomeIconPressed:function(){var e=sap.ui.core.UIComponent.getRouterFor(this);e.navTo("MainReport");this.getOwnerComponent().getModel("globalModel").setProperty("/buttonText","Go to Tasks")},onOpenSAPOne:function(){var e="https://one.int.sap/home";t.URLHelper.redirect(e,true)},onOpenSharePoint:function(){var e="https://sap.sharepoint.com/sites/201967";t.URLHelper.redirect(e,true)},onOpenServiceCatalog:function(){var e="https://servicescatalog.cvdp3eof-dbsservic1-p1-public.model-t.cc.commerce.ondemand.com/";t.URLHelper.redirect(e,true)},onOpenAnalyticsStore:function(){var e="https://eas.sap.com/astore/ui/index.html#assets";t.URLHelper.redirect(e,true)},onNavToTasksPage:function(e){var t=sap.ui.core.UIComponent.getRouterFor(this);var o=e.getSource();var r=window.location.href.split("#")[1];if(r!=""&&o.getText()!="Go to Tasks"){t.navTo("MainReport");o.setText("Go to Tasks")}else{t.navTo("TasksReport");o.setText("Go to Opportunities")}},onNavToChartPage:function(e){var t=sap.ui.core.UIComponent.getRouterFor(this);t.navTo("ChartPage")}})});