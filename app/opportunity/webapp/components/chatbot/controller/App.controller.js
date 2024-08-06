

sap.ui.define(
    [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/UIComponent",
      "sap/ui/model/json/JSONModel",
      "sap/m/MessageToast",
      'sap/m/MessageBox',
      'sap/m/library',
    ],
    function (BaseController, UIComponent, JSONModel, MessageToast, MessageBox, library) {
      "use strict";
  
      return BaseController.extend("chatbot.controller.App", {
        //formatter: formatter,
  
        onInit() {
  
          // this.oOwnerComponent = this.getOwnerComponent();
          // this.oRouter = this.oOwnerComponent.getRouter();
          // this.oRouter.attachRouteMatched(this.onRouteMatched, this);
  
        },
  
        getRouter: function () {
          return UIComponent.getRouterFor(this);
        },
  
        // onRouteMatched: function (oEvent) {
        //   var sRouteName = oEvent.getParameter("name"),
        //     oArguments = oEvent.getParameter("arguments");
  
        //   // Save the current route name
        //   this.currentRouteName = sRouteName;
        //   this.ID = oArguments.ID;
        // },
  
        // onStateChanged: function (oEvent) {
        //   var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
        //     sLayout = oEvent.getParameter("layout");
  
        //   // Replace the URL with the new layout if a navigation arrow was used
        //   if (bIsNavigationArrow) {
        //     this.oRouter.navTo(this.currentRouteName, {layout: sLayout, ID: this.ID}, true);
        //   }
        // },
  
        // onExit: function () {
        //   this.oRouter.detachRouteMatched(this.onRouteMatched, this);
        // }
  
        onSharePointPress: function (oEvent) {
          var sSharePointURL = 'https://sap.sharepoint.com/sites/209083/SitePages/Home.aspx?csf=1&web=1&share=EZ1yRiAQnBNJkbFmc0bwN_IBq0xK5oDx0XMUDpZ7tVYOJw&e=2Ir2r9&ovuser=42f7676c-f455-423c-82f6-dc2d99791af7%2cleoni.kussmaul%40sap.com&OR=Teams-HL&CT=1717457040728&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI1MC8yNDA0MTEyMjMxNSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3d%3d&CID=78292fa1-60e6-8000-ef7a-cb4dad590d76&cidOR=SPO';
          library.URLHelper.redirect(sSharePointURL, true);
        },
  
        onThemePicker: function (oEvent) {
          var bPressed = oEvent.getParameters().pressed;
          var theme = bPressed ? "sap_horizon_dark" : "sap_horizon";
  
          var busyDialog = new sap.m.BusyDialog({
            title: "Applying Theme",
            text: "Please wait while the theme is being applied..."
          });
          busyDialog.open();
  
          sap.ui.getCore().attachThemeChanged(function () {
            document.documentElement.setAttribute('data-theme', theme);
            setTimeout(function () {
              busyDialog.close();
            }, 1000);
          });
          sap.ui.getCore().applyTheme(theme);
        }
  
  
  
  
  
  
      });
    }
  );
  
  