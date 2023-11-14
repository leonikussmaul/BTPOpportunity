sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/base/Log","sap/ui/core/library"],function(e,t,a,o){"use strict";var r=o.ValueState,n={valueState:r.None,valueStateText:""};return e.extend("opportunity.opportunity.controller.App",{onInit:function(){a.setLevel(a.Level.INFO);var e=this.getRouter();e.attachBypassed(function(e){var t=e.getParameter("hash");a.info("Sorry, but the hash '"+t+"' is invalid.","The resource was not found.")});this.getView().setModel(new sap.ui.model.json.JSONModel(n),"valueState")},getRouter:function(){return t.getRouterFor(this)},onNavBack:function(){var e,t;e=History.getInstance();t=e.getPreviousHash();if(t!==undefined){window.history.go(-1)}else{this.getRouter().navTo("Overview",{},true)}},ValueStateMethod:function(e){var t=this.getView().getModel("valueState");MessageToast.show("Please fill all mandatory fields");t.setProperty("/valueState",r.Error);t.setProperty("/valueStateText","This field is mandatory")},resetValueState:function(e){var t=this.getView().getModel("valueState");t.setProperty("/valueState",r.None);t.setProperty("/valueStateText","")},onChangeValueState:function(e){var t=e.mParameters.newValue;if(t)this.resetValueState()}})});