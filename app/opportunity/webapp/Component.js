/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
    "sap/base/util/UriParameters",
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "opportunity/opportunity/model/models",
    "sap/ui/model/json/JSONModel",
    "sap/f/library",
	"sap/f/FlexibleColumnLayoutSemanticHelper"
],
    function (UriParameters, UIComponent, Device, models, JSONModel, library, FlexibleColumnLayoutSemanticHelper) {
        "use strict";
        var LayoutType = library.LayoutType;

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
                
                //global model for fcl 
                this.setModel(new JSONModel(), "global");
                this.getModel("global").setData({
                    "columnsExpanded": true,
                    "filterbarExpanded": true,
                })

                this.setModel(new JSONModel(), "genieModel");

                // set the device model
                this.setModel(models.createDeviceModel(), "device");

                this.setModel(new JSONModel(), "userModel");
                this.getModel("userModel").setProperty("/opportunityID");

                this.setModel(models.createUserModel(), "user");

                
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
                                    "to": "Rudolf"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Omar"
                                },
                                {
                                    "from": "Rajat",
                                    "to": "Leoni"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Amit"
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
                                    "to": "Ollie"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Sravanthi"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Karthik"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Giulia"
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
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Biswajit"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Byader"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Eswara"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Philip"
                                },
                                {
                                    "from": "Ravi",
                                    "to": "Bal"
                                }
                            ]
                }

                this.setModel(new JSONModel(), "teamModel");
                this.getModel("teamModel").setData(aTeam);

    
                var LoggedUser = new JSONModel();
                this.setModel(LoggedUser, "LoggedUser");

                // var sText = "<p>Thanks for your interest in <strong style=\"color: #AB218E;\">Demand Genius</strong>. <br><em>Here's a short guide on how to use Demand Genius across Five Key Areas.</em></p><br>" +
                // "<h5 style='color: #AB218E;'>Holistic Overview</h5>" +
                // "<p>Gain a comprehensive overview of our team's performance and opportunities at a glance.<br> The Overview Page presents <strong style='color: #0070f2;'>insightful analytics </strong> and charts that provide a holistic view of our status, progress and forecast. Evaluate our performance, track key metrics such as adoption, consumption, and maturity across different areas. Make <strong style='color: #0070f2;'>data-driven decisions</strong> and identify areas for improvement, all within a <strong style='color: #0070f2;'> centralized location.</strong></p><br>" +
                // "<h5 style='color: #AB218E;'>Demand Generation</h5>" +
                // "<p>The Opportunity Report offers a <strong style='color: #0070f2;'>configurable and filterable</strong> Fiori List Report. Customize the filter bar, search by keyword, and easily modify sorting, filtering, and grouping options. Opportunities are grouped by market units, highlighted by priority, and tagged with the key focus topics. The color-coded status indicators enable <strong style='color: #0070f2;'>quick assessment</strong>. Favorite customers, export reports to Excel, and access the Account Object Page for collaboration, including planned activities, useful links, comments, detailed notes and an overall <strong style='color: #0070f2;'>account roadmap</strong>.</p><br>" +
                   // "<h5 style='color: #AB218E;'>Projects</h5>" +
                // "<p>Register ongoing projects, track progress, and <strong style='color: #0070f2;'> visualize project stages</strong>. Gain a clear overview of the <strong style='color: #0070f2;'> project lifecycle</strong>, from Sent for Proposal to Past Projects, either for the entire team or per individual team member. Expand projects for detailed information and editing. Utilize the Team Member Snapshot Page to view utilization tracked by <strong style='color: #0070f2;'> forecast and actuals</strong>, and quickly edit or create new records.</p><br>" +
                // "<h5 style='color: #AB218E;'>Team & Calendar</h5>" +
                // "<p>Gain a full overview of the team through the <strong style='color: #0070f2;'> Org Chart</strong>, accessing individual details for more information on skills and tools. Navigate to each team member's Engagement Snapshot for comprehensive insights. Maximize team resources effortlessly with the project calendar, where you can view current projects color-coded by status, schedule vacations, and ensure <strong style='color: #0070f2;'> efficient resource allocation</strong> and balanced workloads. </p>" +
                // "<br><p><strong><u style='color: #0070f2;'>In short,</u></strong> Demand Genius is a testament to the <strong style='color: #0070f2;'>power of SAP BTP</strong> and its ability to deliver an intuitive UI. It helps <strong style='color: #0070f2;'>increase productivity and collaboration</strong> by gaining insights at a glance, nurturing demand generation, managing projects, and optimizing team resources. Demand Genius is your go-to solution for tracking opportunities and maximizing performance.</p>" 
                
                // + "<br><br><h6><strong><u style='color: #AB218E;'>Please share your Feedback & Ideas</u></strong></h6><br>" +
                //   "<em>Thank you for taking the time to share any suggestions, thoughts, or feelings you have about Demand Genius. Your feedback is highly valued and will contribute greatly to the adoption and success of this tool. </em>";
                


                var infoModelData = {
                    header: "<p>Thanks for your interest in <strong style=\"color: #AB218E;\">Demand Genius</strong>. <br><em>Here's a short guide on how to use Demand Genius across Five Key Areas.</em></p>",
                    holisticOverview:  "<p>Gain a comprehensive overview of our team's performance and opportunities at a glance.<br> The Overview Page presents <strong style='color: #0070f2;'>insightful analytics </strong> and charts that provide a holistic view of our status, progress and forecast. Evaluate our performance, track key metrics such as adoption, consumption, and maturity across different areas. Make <strong style='color: #0070f2;'>data-driven decisions</strong> and identify areas for improvement, all within a <strong style='color: #0070f2;'> centralized location.</strong></p>",
                    demandGeneration: "<p>The Opportunity Report offers a <strong style='color: #0070f2;'>configurable and filterable</strong> Fiori List Report. Customize the filter bar, search by keyword, and easily modify sorting, filtering, and grouping options. Opportunities are grouped by market units, highlighted by priority, and tagged with the key focus topics. The color-coded status indicators enable <strong style='color: #0070f2;'>quick assessment</strong>. Favorite customers, export reports to Excel, and access the Account Object Page for collaboration, including planned activities, useful links, comments, detailed notes and an overall <strong style='color: #0070f2;'>account roadmap</strong>.</p>",
                   projects: "<p>Register ongoing projects, track progress, and <strong style='color: #0070f2;'> visualize project stages</strong>. Gain a clear overview of the <strong style='color: #0070f2;'> project lifecycle</strong>, from Sent for Proposal to Past Projects, either for the entire team or per individual team member. Expand projects for detailed information and editing. Utilize the Team Member Snapshot Page to view utilization tracked by <strong style='color: #0070f2;'> forecast and actuals</strong>, and quickly edit or create new records.</p>",
                    teamAndCalendar: "<p>Gain a full overview of the team through the <strong style='color: #0070f2;'> Org Chart</strong>, accessing individual details for more information on skills and tools. Navigate to each team member's Engagement Snapshot for comprehensive insights. Maximize team resources effortlessly with the project calendar, where you can view current projects color-coded by status, schedule vacations, and ensure <strong style='color: #0070f2;'> efficient resource allocation</strong> and balanced workloads. </p>",
                    inShort: "<p>In short, Demand Genius is a testament to the <strong style='color: #0070f2;'>power of SAP BTP</strong> and its ability to deliver an intuitive UI. It helps <strong style='color: #0070f2;'>increase productivity and collaboration</strong> by gaining insights at a glance, nurturing demand generation, managing projects, and optimizing team resources. Demand Genius is your go-to solution for tracking opportunities and maximizing performance.</p>",
                    feedback: "Thank you for taking the time to share any suggestions, thoughts, or feelings you have about Demand Genius.<br><em>Your feedback is highly valued and will contribute greatly to the adoption and success of this tool.</em><br>"
                };
                
                this.setModel(new JSONModel(infoModelData), "infoModel");
                
                // this.setModel(new JSONModel(), "infoModel");
                // this.getModel("infoModel").setProperty("/HTML", sText);
    
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

            getHelper: function () {
                var oFCL = this.getRootControl().byId("app"),
                    oParams = UriParameters.fromQuery(location.search),
                    oSettings = {
                        defaultTwoColumnLayoutType: LayoutType.TwoColumnsMidExpanded,
                        mode: oParams.get("mode"),
                        initialColumnsCount: oParams.get("initial"),
                        maxColumnsCount: oParams.get("max")
                    };
    
                return FlexibleColumnLayoutSemanticHelper.getInstanceFor(oFCL, oSettings);
            }
    
    
        });
    }
);