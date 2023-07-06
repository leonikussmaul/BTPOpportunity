/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "opportunity/opportunity/model/models",
    "sap/ui/model/json/JSONModel"
],
    function (UIComponent, Device, models, JSONModel) {
        "use strict";

        return UIComponent.extend("opportunity.opportunity.Component", {
            metadata: {
                manifest: "json"
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {
                // call the base component's init function
                UIComponent.prototype.init.apply(this, arguments);

                // enable routing
                this.getRouter().initialize();

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                this.setModel(new JSONModel(), "userModel");
                this.getModel("userModel").setProperty("/opportunityID");

                this.setModel(models.createUserModel(), "user");

                this.setModel(new JSONModel(), "tabModel");
                this.getModel("tabModel").setProperty("/tabs", []);

                
                var aTeam = {

                    "lines": [
                                {
                                    "from": "Rajat",
                                    "to": "Ravi"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Sarah"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Vijay"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Stefan"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Gurpreet"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Sunil"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Nesimi"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Bas"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Matt"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Peter"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Elinor"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Rudolf"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Omar"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Amit"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Leoni"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Liliana"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Shubham"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Karthik"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Sneha"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Arpit"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Ami"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Abhay"
                                }
                            ]
                }

                this.setModel(new JSONModel(), "teamModel");
                this.getModel("teamModel").setData(aTeam);

    
                var LoggedUser = new JSONModel();
                this.setModel(LoggedUser, "LoggedUser");
    
                // this.getCurrentUser()
                //     .then((data)=> {
                //         if (data && data.value && data.value.length > 0) {
                //             this.saveUserModel(data.value[0]);
    
                //         }
                //         // triggers navigation to the default route (where pattern = "")
                //         this.getRouter().initialize();
                //     })


            },

            // getCurrentUser: function () {
            //     return new Promise((resolve, reject) => {
            //         $.get({
            //             url: "/opportunity/CurrentUser",
            //             headers: {
            //                 ContentType: "application/json",
            //                 Accept: "application/json",
            //                 cache: false,
            //                 "X-CSRF-Token": "Fetch"
            //             },
            //             success: function (data) {
            //                 resolve(data)
            //             },
            //             error: function (error) {
            //                 reject(error);
            //             }
            //         });
            //     });
            // },
    
            // saveUserModel: function(userData) {
            //     userData["bAllowEdit"]=true;
            //     this.getModel("UserModel").setData(userData);
            //     if(userData.dataReplicated) {
            //         this.getModel().refresh();
            //     }
            // },
    
        });
    }
);