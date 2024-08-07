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

                // this._oBusyDialog = new sap.m.BusyDialog({
                //     text: "The Genie is thinking..."
                // });

                this.getView().setModel(
                    new JSONModel({
                        imagePath: './images/diamond.png',
                        genieImage: './images/genie/genie_white.png',
                        isWelcomePanelVisible: true
                        //   isFullScreenMode: false,
                        //   settingsDialogPreviousSelections: {}
                    }),
                    'viewModel'
                );

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

                this.initializeChat();
            },

            initializeChat: function () {
                //Reset conversation
                //this.getModel("chatConversation").setProperty("/conversation", []);

                //Initial action buttons
                const oActionButton1 = new sap.m.Button({
                    text: 'Customer Leads',
                    press: this.onActionButtonPressed.bind(this),
                    visible: '{viewModel>/isSuggestionVisible}'
                }).addStyleClass('sapUiSizeCompact sapUiSmallMarginEnd aiChatActionButton');
                const oActionButton2 = new sap.m.Button({
                    text: 'Internal Leads',
                    press: this.onActionButtonPressed.bind(this),
                    visible: '{viewModel>/isSuggestionVisible}'
                }).addStyleClass('sapUiSizeCompact sapUiSmallMarginEnd aiChatActionButton');
                const oActionButton3 = new sap.m.Button({
                    text: 'More Info',
                    press: this.onActionButtonPressed.bind(this),
                    visible: '{viewModel>/isSuggestionVisible}'
                }).addStyleClass('sapUiSizeCompact sapUiSmallMarginEnd aiChatActionButton');
                const oActionButtonsWrapper = new sap.m.HBox({
                    items: [oActionButton1, oActionButton2, oActionButton3]
                });

                const oGetStartedText = new sap.m.Text({
                    text: 'Get started'
                }).addStyleClass('aiBotMessage sapUiTinyMarginTop sapUiTinyMarginBottom');
                const oGetStartedTextWrapper = new sap.m.HBox({
                    items: [oGetStartedText]
                });

                this.addMessagesToWrapper([oGetStartedTextWrapper, oActionButtonsWrapper]);
            },
            // Handle button press action
            // onActionButtonPressed: function (oEvent) {
            //     const oBtnText = oEvent.getSource().getText();
            //     const oChatModel = this.getView().getModel('chatModel');
            //     oChatModel.setProperty('/userInput', oBtnText);
            //     this.removeLastConversationItem();
            //     this.onPostMessage();
            // },


            onActionButtonPressed: function (oEvent) {
                var oViewModel = this.getView().getModel("viewModel");
                oViewModel.setProperty("/isSuggestionVisible", false);
                var sKey = oEvent.getSource().getText();
                var oChatModel = this.getView().getModel("chatModel");

                var sInput;
                if (sKey == "Customer Leads") sInput = "Who are the Genie AI Customer Leads?";
                else if (sKey == "Internal Leads") sInput = "How many Internal Leads do we have for the Genie AI Workshop and can you list them?";
                else if (sKey == "More Info") sInput = "Can you give more general information on the Genie AI Workshop?";

                oChatModel.setProperty("/userInput", sInput);
                if (sInput) this.onPostMessage();
                //this.removeLastConversationItem();
            },

            // removeLastConversationItem() {
            //     const viewModel = this.getView().getModel('viewModel');
            //     const items = this.byId('messagesWrapper').getItems();
            //     this.byId('messagesWrapper').removeItem(items[items.length - 1]);
            //     viewModel.setProperty('/isLastItemRemoveble', false);
            // },

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
                var oMessagesWrapper = this.getView().byId("messagesWrapper");

                //set section of the chatbot to invisible after initial interaction for better UX
                this.getView().getModel("viewModel").setProperty("/isWelcomePanelVisible", false);

                // Create the user question as a VBox with a Text control
                var oUserQuestion = new sap.m.VBox({
                    items: [
                        new sap.m.Text({
                            text: oInput
                        }).addStyleClass("aiUserMessage")
                            .addStyleClass("sapUiLargeMarginBegin")
                            .addStyleClass("sapUiTinyMarginTopBottom")
                    ]
                }).addStyleClass("userMessageWrapper");

                oMessagesWrapper.addItem(oUserQuestion);
                // this._oBusyDialog.open();
                this.showThinkingDots();

                // Use the getBotResponse function and wait for the response
                this.getBotResponse(oInput).then(function (sBotResponse) {
                    var oBotResponse = new sap.m.VBox({
                        items: [
                            new sap.m.Text({
                                text: sBotResponse
                            }).addStyleClass("aiBotMessage")
                                .addStyleClass("sapUiLargeMarginEnd")
                                .addStyleClass("sapUiTinyMarginTopBottom")

                        ]
                    }).addStyleClass("botMessageWrapper");

                    // Add the bot's response to the messages wrapper
                    oMessagesWrapper.addItem(oBotResponse);

                    // Get records for history
                    let oHistoryEntryUser = { content: oInput, role: "user" };
                    let oHistoryEntryBot = { content: sBotResponse, role: "assistant" };

                    let newHistory = oHistoryModel.getProperty("/history");
                    newHistory.push(oHistoryEntryUser);
                    newHistory.push(oHistoryEntryBot);

                    oHistoryModel.setProperty("/history", newHistory);
                    console.log(oHistoryModel.getProperty("/history"));

                    // that._oBusyDialog.close();
                    that.hideThinkingDots();

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
                        //that._oBusyDialog.close();
                        that.hideThinkingDots();
                        reject(oError);
                    });
                });
            },

            showThinkingDots() {
                const busyIndicator = new sap.m.BusyIndicator({ size: '0.7em' });
                const thinkingDotsBox = new sap.m.VBox({ items: [busyIndicator] });
                thinkingDotsBox.addStyleClass('aiBotMessage sapUiTinyMarginTop sapUiTinyMarginBottom aiThinkingDotsBox');
                this.addMessagesToWrapper([thinkingDotsBox]);
            },

            hideThinkingDots() {
                const messagesWrapper = this.byId('messagesWrapper');
                const items = messagesWrapper.getItems();
                // Find the thinking dots box by class or type
                const thinkingDotsBox = items.find(item => item.hasStyleClass && item.hasStyleClass('aiThinkingDotsBox'));
                if (thinkingDotsBox) {
                    messagesWrapper.removeItem(thinkingDotsBox);
                }
            },

            onResetChatbot: function (oEvent) {
                var oViewModel = this.getView().getModel("viewModel");
                oViewModel.setProperty("/isWelcomePanelVisible", true);
                oViewModel.setProperty("/isMessageStripVisible", false);
                oViewModel.setProperty("/isSuggestionVisible", true);
                this.getView().byId('messagesWrapper').removeAllItems();
                this.getView().getModel("chatModel").setData({});

                this.initializeChat(); 

            },


            // Add message control to chat panel wrapper
            addMessagesToWrapper(messages) {
                const messagesWrapper = this.byId('messagesWrapper');
                messages.forEach(message => messagesWrapper.addItem(message));
                this.scrollToBottomContent();
            },

            // Scroll to bottom of chat panel content
            scrollToBottomContent() {
                const aiAssistantContentBox = this.byId('aiAssistantContent');
                const aiMessagesWrapper = this.byId('messagesWrapper');
                aiAssistantContentBox.$().scrollTop(aiMessagesWrapper.$().height());
            },


            handleScroll: function () {
                var oScrollContainer = this.getView().byId("scrollContainerID");
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
