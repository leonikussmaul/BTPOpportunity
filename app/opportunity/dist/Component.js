sap.ui.define(["sap/ui/core/UIComponent","sap/ui/Device","opportunity/opportunity/model/models","sap/ui/model/json/JSONModel"],function(t,o,e,a){"use strict";return t.extend("opportunity.opportunity.Component",{metadata:{manifest:"json"},init:function(){t.prototype.init.apply(this,arguments);this.getRouter().initialize();this.setModel(e.createDeviceModel(),"device");this.setModel(new a,"userModel");this.getModel("userModel").setProperty("/opportunityID");this.setModel(e.createUserModel(),"user");this.setModel(new a,"tabModel");this.getModel("tabModel").setProperty("/tabs",[]);var o={lines:[{from:"Rajat",to:"Ravi"},{from:"Rajat",to:"Sarah"},{from:"Rajat",to:"Vijay"},{from:"Rajat",to:"Stefan"},{from:"Rajat",to:"Gurpreet"},{from:"Rajat",to:"Sunil"},{from:"Rajat",to:"Nesimi"},{from:"Rajat",to:"Bas"},{from:"Rajat",to:"Matt"},{from:"Rajat",to:"Peter"},{from:"Rajat",to:"Elinor"},{from:"Rajat",to:"Rudolf"},{from:"Rajat",to:"Omar"},{from:"Ravi",to:"Amit"},{from:"Ravi",to:"Leoni"},{from:"Ravi",to:"Liliana"},{from:"Ravi",to:"Shubham"},{from:"Ravi",to:"Karthik"},{from:"Ravi",to:"Sneha"},{from:"Ravi",to:"Arpit"},{from:"Ravi",to:"Ami"},{from:"Ravi",to:"Abhay"}]};this.setModel(new a,"teamModel");this.getModel("teamModel").setData(o);var i=new a;this.setModel(i,"LoggedUser")}})});