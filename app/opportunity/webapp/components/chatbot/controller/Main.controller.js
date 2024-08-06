sap.ui.define([
    "sap/ui/core/mvc/Controller",
    'sap/m/library',
    "sap/ui/model/json/JSONModel"
],
    function (Controller, library, JSONModel) {
        "use strict";

        return Controller.extend("chatbot.controller.Main", {
            onInit: function () {


                this.getView().setModel(new sap.ui.model.json.JSONModel({
                    selectedIllustrationType: this._getRandomIllustrationType()
                }), "chatModel");

                this.getView().setModel(new sap.ui.model.json.JSONModel({
                }), "historyModel");
                this.getView().getModel("historyModel").setProperty("/history", []);

                this._oBusyDialog = new sap.m.BusyDialog({
                    text: "The Genie is thinking..."
                });

                //add event for enter
                this.iDebounceTimer = null;
                var oInput = this.getView().byId("newMessageInput");
                if (oInput) {
                    oInput.attachBrowserEvent("keypress", function (oEvent) {
                        if (oEvent.key === "Enter" && !oEvent.shiftKey) {
                            clearTimeout(this.iDebounceTimer);
                            this.iDebounceTimer = setTimeout(() => {
                                this.onPostMessage();
                            }, 300); // Trigger submission after 300 ms of no additional keypress
                            oEvent.preventDefault(); // Prevent the default Enter key behavior
                        }
                    }.bind(this));
                }

            },

            _getRandomIllustrationType: function () {
                var illustrationTypes = [
                    "sapIllus-NoTasks",
                    // "sapIllus-SleepingBell",
                    "sapIllus-EmptyList",
                    "sapIllus-Survey",
                    //"sapIllus-Tent",
                ];
                var randomIndex = Math.floor(Math.random() * illustrationTypes.length);
                return illustrationTypes[randomIndex];
            },
            onPostMessage: function (oEvent) {
                var that = this;
                var oChatModel = this.getView().getModel("chatModel");
                var oInput = oChatModel.getProperty("/userInput");
                var oHistoryModel = this.getView().getModel("historyModel");
                var oFeedList = this.getView().byId("feedList");

                // Create the user question as a CustomListItem
                var oUserQuestion = new sap.m.CustomListItem({
                    content: [
                        new sap.m.FeedListItem({
                            text: oInput,
                            sender: "You",
                            showIcon: false,
                            timestamp: that.getFormattedTime(),
                            customData: [
                                new sap.ui.core.CustomData({
                                    key: "alignment",
                                    value: "right"
                                })
                            ]
                        }).addStyleClass("userMessage")

                    ]
                });

                oFeedList.addItem(oUserQuestion);
                this._oBusyDialog.open();

                // Use the getBotResponse function and wait for the response
                this.getBotResponse(oInput).then(function (sBotResponse) {
                    var oBotResponse = new sap.m.FeedListItem({
                        text: sBotResponse,
                        sender: "Genie",
                        icon: "./utils/genie.ico",
                        iconDensityAware: false,
                        timestamp: that.getFormattedTime(),
                        highlight: "Information",
                        lessLabel: "show less",
                        moreLabel: "show more",
                        customData: [
                            new sap.ui.core.CustomData({
                                key: "alignment",
                                value: "left"
                            })
                        ]
                    }).addStyleClass("botMessage");

                    // Add the bot's response to the feed list
                    oFeedList.addItem(oBotResponse);

                    //get records for history
                    let oHistoryEntryUser = { "content": oInput, "role": "user" }
                    let oHistoryEntryBot = { "content": sBotResponse, "role": "assistant" }

                    let newHistory = oHistoryModel.getProperty("/history");
                    newHistory.push(oHistoryEntryUser);
                    newHistory.push(oHistoryEntryBot);

                    oHistoryModel.setProperty("/history", newHistory);
                    console.log(oHistoryModel.getProperty("/history"));

                    that._oBusyDialog.close();
                    setTimeout(function () {
                        that.handleScroll();
                    }, 100);
                });


                oChatModel.setData({});
            },

            getBotResponse: function (sUserInput) {
                var that = this;
                let oModel = this.getView().getModel();
                let oChatModel = this.getView().getModel("chatModel");
                let oHistoryModel = this.getView().getModel("historyModel");

                var oActionODataContextBinding = oModel.bindContext("/chat(...)");
                oActionODataContextBinding.setParameter("question", sUserInput);

                let oHistory = oHistoryModel.getProperty("/history");
                oActionODataContextBinding.setParameter("history", oHistory);

                // Return a Promise that resolves with the bot response
                return new Promise(function (resolve, reject) {
                    oActionODataContextBinding.execute().then(function () {
                        var oActionContext = oActionODataContextBinding.getBoundContext();
                        console.log(oActionContext.getObject().value);
                        resolve(oActionContext.getObject().value);
                    }).catch(function (oError) {
                        console.log("Error getting bot response:", oError);
                        //sap.m.MessageBox.error(oError.toString());
                        sap.m.MessageBox.error(
                            oError.toString(),
                            {
                                icon: sap.m.MessageBox.Icon.WARNING,
                                title: "Please Try Again",
                            }
                        );
                        //remember question 
                        oChatModel.setProperty("/userInput", sUserInput);
                        that._oBusyDialog.close();
                        reject(oError);
                    });
                });
            },

            handleScroll: function () {
                var oScrollContainer = this.getView().byId("scrollContainer");
                if (oScrollContainer) {
                    oScrollContainer.scrollTo(0, oScrollContainer.getDomRef().scrollHeight, 100);
                }
            },

            getFormattedTime: function () {
                var now = new Date();
                var hours = now.getHours();
                var minutes = now.getMinutes();
                var ampm = hours >= 12 ? 'pm' : 'am';
                hours = hours % 12;
                hours = hours ? hours : 12; // the hour '0' should be '12'
                minutes = minutes < 10 ? '0' + minutes : minutes;
                var strTime = hours + ':' + minutes + ' ' + ampm;
                return strTime;
            },

            onSharePointPress: function (oEvent) {
                var sSharePointURL = 'https://sap.sharepoint.com/sites/209083/SitePages/Home.aspx?csf=1&web=1&share=EZ1yRiAQnBNJkbFmc0bwN_IBq0xK5oDx0XMUDpZ7tVYOJw&e=2Ir2r9&ovuser=42f7676c-f455-423c-82f6-dc2d99791af7%2cleoni.kussmaul%40sap.com&OR=Teams-HL&CT=1717457040728&clickparams=eyJBcHBOYW1lIjoiVGVhbXMtRGVza3RvcCIsIkFwcFZlcnNpb24iOiI1MC8yNDA0MTEyMjMxNSIsIkhhc0ZlZGVyYXRlZFVzZXIiOmZhbHNlfQ%3d%3d&CID=78292fa1-60e6-8000-ef7a-cb4dad590d76&cidOR=SPO';
                library.URLHelper.redirect(sSharePointURL, true);
            },

        });
    });