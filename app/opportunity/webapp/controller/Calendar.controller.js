sap.ui.define([
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/MessageBox',
    'sap/ui/core/date/UI5Date'
],
function (Controller, JSONModel, MessageBox, UI5Date) {
    "use strict";

    return Controller.extend("opportunity.opportunity.controller.Calendar", {

        onInit: function () {
            var oPrimarySecondaryType = this.byId("primaryCalendarTypeSelect");
            // create model
            var oModel = new JSONModel();
            oModel.setData({
                startDate: UI5Date.getInstance(),
                people: [{
                    pic: "./images/Rajat.jpeg",
                    name: "Rajat",
                    role: "Manager",
                    appointments: [

                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "8", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "8", "09", "30"),
                            account: "Meet Max Mustermann",
                            type: "Type02",
                            tentative: false
                        },



                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "8", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "8", "09", "30"),
                            account: "Meet Max Mustermann",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "11", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "11", "12", "0"),
                            account: "Team meeting",
                            descriptionText: "room 1",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "12", "11", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "12", "13", "30"),
                            account: "Lunch",
                            descriptionText: "canteen",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "09", "30"),
                            account: "Meet Max Mustermann",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "12", "0"),
                            account: "Team meeting",
                            descriptionText: "room 1",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "11", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "13", "30"),
                            account: "Lunch",
                            descriptionText: "canteen",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "13", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "17", "30"),
                            account: "Discussion with clients",
                            descriptionText: "online meeting",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "16", "04", "00"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "16", "22", "30"),
                            account: "Discussion of the plan",
                            descriptionText: "Online meeting",
                            type: "Type04",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "18", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "18", "09", "30"),
                            account: "Meeting with the manager",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "18", "11", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "18", "13", "30"),
                            account: "Lunch",
                            descriptionText: "canteen",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "18", "1", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "18", "22", "0"),
                            account: "Team meeting",
                            descriptionText: "regular",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "21", "00", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "21", "23", "30"),
                            account: "New Product",
                            descriptionText: "room 105",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "25", "11", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "25", "13", "30"),
                            account: "Lunch",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "29", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "29", "12", "0"),
                            account: "Team meeting",
                            descriptionText: "room 1",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "30", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "30", "09", "30"),
                            account: "Meet Max Mustermann",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "30", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "30", "12", "0"),
                            account: "Team meeting",
                            descriptionText: "room 1",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "30", "11", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "30", "13", "30"),
                            account: "Lunch",
                            type: "Type03",
                            tentative: true
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "30", "13", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "30", "17", "30"),
                            account: "Discussion with clients",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "31", "10", "00"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "31", "11", "30"),
                            account: "Discussion of the plan",
                            descriptionText: "Online meeting",
                            type: "Type04",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "1", "3", "08", "30"),
                            projectEndDate: UI5Date.getInstance("2023", "1", "13", "09", "30"),
                            account: "Meeting with the manager",
                            type: "Type02",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "1", "4", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "1", "4", "12", "0"),
                            account: "Team meeting",
                            descriptionText: "room 1",
                            type: "Type01",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "2", "30", "10", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "4", "33", "12", "0"),
                            account: "Working out of the building",
                            type: "Type07",
                            pic: "sap-icon://sap-ui5",
                            tentative: false
                        }
                    ],
                    headers: [
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "8", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "10", "0"),
                            account: "Reminder",
                            type: "Type06"
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "0", "15", "17", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "0", "15", "19", "0"),
                            account: "Reminder",
                            type: "Type06"
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2023", "8", "1", "0", "0"),
                            projectEndDate: UI5Date.getInstance("2023", "10", "30", "23", "59"),
                            account: "New quarter",
                            type: "Type10",
                            tentative: false
                        },
                        {
                            projectStartDate: UI5Date.getInstance("2018", "1", "1", "0", "0"),
                            projectEndDate: UI5Date.getInstance("2018", "3", "30", "23", "59"),
                            account: "New quarter",
                            type: "Type10",
                            tentative: false
                        }
                    ]
                },
                    {
                        pic: "./images/Sarah.jpeg",
                        name: "Sarah",
                        role: "Demand Generator",
                        appointments: [
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "10", "18", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "10", "19", "10"),
                                account: "Discussion of the plan",
                                descriptionText: "Online meeting",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "9", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "13", "12", "0"),
                                account: "Workshop out of the country",
                                type: "Type07",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "08", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "09", "30"),
                                account: "Discussion of the plan",
                                descriptionText: "Online meeting",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "12", "0"),
                                account: "Team meeting",
                                descriptionText: "room 1",
                                type: "Type01",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "18", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "19", "10"),
                                account: "Discussion of the plan",
                                descriptionText: "Online meeting",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "16", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "31", "12", "0"),
                                account: "Workshop out of the country",
                                type: "Type07",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2018", "0", "1", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2018", "2", "31", "23", "59"),
                                account: "New quarter",
                                type: "Type10",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "01", "11", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "02", "20", "12", "0"),
                                account: "Team collaboration",
                                descriptionText: "room 1",
                                type: "Type01",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "3", "01", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "3", "31", "12", "0"),
                                account: "Workshop out of the country",
                                type: "Type07",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "4", "01", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "4", "31", "12", "0"),
                                account: "Out of the office",
                                type: "Type08",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "7", "1", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "7", "31", "23", "59"),
                                account: "Vacation",
                                descriptionText: "out of office",
                                type: "Type04",
                                tentative: false
                            }
                        ],
                        headers: [
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "9", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "10", "0"),
                                account: "Payment reminder",
                                type: "Type06"
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "16", "30"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "18", "00"),
                                account: "Private appointment",
                                type: "Type06"
                            }
                        ]
                    },
                    {
                        pic: "./images/Ravi.jpeg",
                        name: "Ravi",
                        role: "Manager",
                        appointments: [
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "08", "30"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "09", "30"),
                                account: "Meet John Miller",
                                type: "Type02",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "12", "0"),
                                account: "Team meeting",
                                descriptionText: "room 1",
                                type: "Type01",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "15", "13", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "15", "16", "00"),
                                account: "Discussion with clients",
                                descriptionText: "online",
                                type: "Type02",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "16", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "16", "23", "59"),
                                account: "Vacation",
                                descriptionText: "out of office",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "17", "1", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "18", "22", "0"),
                                account: "Workshop",
                                descriptionText: "regular",
                                type: "Type07",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "19", "08", "30"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "19", "18", "30"),
                                account: "Meet John Doe",
                                type: "Type02",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "19", "10", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "19", "16", "0"),
                                account: "Team meeting",
                                descriptionText: "room 1",
                                type: "Type01",
                                pic: "sap-icon://sap-ui5",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "19", "07", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "19", "17", "30"),
                                account: "Discussion with clients",
                                type: "Type02",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "20", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "20", "23", "59"),
                                account: "Vacation",
                                descriptionText: "out of office",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "22", "07", "00"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "27", "17", "30"),
                                account: "Discussion with clients",
                                descriptionText: "out of office",
                                type: "Type02",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "2", "13", "9", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "2", "17", "10", "0"),
                                account: "Payment week",
                                type: "Type06"
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "03", "10", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "05", "16", "23", "59"),
                                account: "Vacation",
                                descriptionText: "out of office",
                                type: "Type04",
                                tentative: false
                            },
                            {
                                projectStartDate: UI5Date.getInstance("2023", "07", "1", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "09", "31", "23", "59"),
                                account: "New quarter",
                                type: "Type10",
                                tentative: false
                            }
                        ],
                        headers: [
                            {
                                projectStartDate: UI5Date.getInstance("2023", "0", "16", "0", "0"),
                                projectEndDate: UI5Date.getInstance("2023", "0", "16", "23", "59"),
                                account: "Private",
                                type: "Type05"
                            }
                        ]
                    }
                ]
            });
            this.getView().setModel(oModel);
         //   oPrimarySecondaryType.setSelectedKey(this.byId("PC1").getPrimaryCalendarType());
        },

        handleAppointmentSelect: function (oEvent) {
            var oAppointment = oEvent.getParameter("appointment"),
                sSelected;
            if (oAppointment) {
                sSelected = oAppointment.getSelected() ? "selected" : "deselected";
                MessageBox.show("'" + oAppointment.getTitle() + "' " + sSelected + ". \n Selected appointments: " + this.byId("PC1").getSelectedAppointments().length);
            } else {
                var aAppointments = oEvent.getParameter("appointments");
                var sValue = aAppointments.length + " Appointments selected";
                MessageBox.show(sValue);
            }
        },

        // handleSelectionFinish: function(oEvent) {
        //     var aSelectedKeys = oEvent.getSource().getSelectedKeys();
        //     this.byId("PC1").setBuiltInViews(aSelectedKeys);
        // },

        onCalendarTypeSelect: function (oEvent) {
            this.byId("PC1").setPrimaryCalendarType(oEvent.getParameters().selectedItem.getKey());
        },

        onCalendarSecondaryTypeSelect: function (oEvent) {
            var sKey = oEvent.getParameters().selectedItem.getKey();
            if (sKey === "None"){
                this.byId("PC1").setSecondaryCalendarType(undefined);
            } else {
                this.byId("PC1").setSecondaryCalendarType(sKey);
            }
        }

    });

});