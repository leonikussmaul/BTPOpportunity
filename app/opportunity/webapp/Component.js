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

                var sText = "<p>Thanks for your interest in <strong style=\"color: #7091AF;\">Demand Genius</strong>. <br><em>Here's a short guide on how to use Demand Genius across Five Key Areas.</em></p><br>" +
                "<h5 style='color: #124559;'>Holistic Overview</h5>" +
                "<p>Gain a comprehensive overview of our team's performance and opportunities at a glance.<br> The Overview Page presents <strong style='color: #7091AF;'>insightful analytics and charts</strong> that provide a holistic view of our status, progress and forecast. Evaluate our performance, track key metrics such as adoption, consumption, and maturity across different areas. Make <strong style='color: #7091AF;'>data-driven decisions</strong> and identify areas for improvement, all within <strong style='color: #7091AF;'> a centralized location.</strong></p><br>" +
                "<h5 style='color: #124559;'>Demand Generation</h5>" +
                "<p>The Opportunity Report offers a <strong style='color: #7091AF;'>configurable and filterable</strong> Fiori List Report. Customize the filter bar, search by keyword, and easily modify sorting, filtering, and grouping options. Opportunities are grouped by market units, highlighted by priority, and tagged with the key focus topics. The color-coded status indicators enable <strong style='color: #7091AF;'>quick assessment</strong>. Favorite customers, export reports to Excel, and access the Account Object Page for collaboration, including planned activities, useful links, comments, detailed notes and an overall <strong style='color: #7091AF;'>account roadmap</strong>.</p><br>" +
                "<h5 style='color: #124559;'>Tasks</h5>" +
                "<p>Manage tasks within each opportunity to <strong style='color: #7091AF;'>stay on track, monitor, and share responsibility</strong> within the team. Navigate directly from the account object page or access the Task Report for a full summary. Sort, filter, and group tasks by priority, focus topic, responsible person, and due date. The semantic highlighting and process flow provide a visual understanding of task status and sequence. Edit, create, and reorder sub-tasks, mark them as completed, and <strong style='color: #7091AF;'> streamline the workflow </strong>. Add comments and links, and seamlessly navigate between tasks and the related opportunity.</p><br>" +
                "<h5 style='color: #124559;'>Projects</h5>" +
                "<p>Register ongoing projects, track progress, and <strong style='color: #7091AF;'> visualize project stages</strong>. Gain a clear overview of the <strong style='color: #7091AF;'> project lifecycle</strong>, from Sent for Proposal to Past Projects, either for the entire team or per individual team member. Expand projects for detailed information and editing. Utilize the Team Member Snapshot Page to view utilization tracked by <strong style='color: #7091AF;'> forecast and actuals</strong>, and quickly edit or create new records.</p><br>" +
                "<h5 style='color: #124559;'>Team & Calendar</h5>" +
                "<p>Gain a full overview of the team through the <strong style='color: #7091AF;'> Org Chart</strong>, accessing individual details for more information on skills and tools. Navigate to each team member's Engagement Snapshot for comprehensive insights. Maximize team resources effortlessly with the project calendar, where you can view current projects color-coded by status, schedule vacations, and ensure <strong style='color: #7091AF;'> efficient resource allocation</strong> and <strong style='color: #7091AF;'> balanced workloads</strong>. </p>" +
                "<br><p><strong><u style='color: #124559;'>In short,</u></strong> Demand Genius is a testament to the <strong style='color: #7091AF;'>power of SAP BTP</strong> and its ability to deliver an intuitive UI. It helps <strong style='color: #7091AF;'>increase productivity and collaboration</strong> by gaining insights at a glance, nurturing demand generation, managing projects, and optimizing team resources. Demand Genius is your go-to solution for tracking opportunities and <strong style='color: #7091AF;'>maximizing performance</strong>.</p>";
                

                this.setModel(new JSONModel(), "infoModel");
                this.getModel("infoModel").setProperty("/HTML", sText);
    
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