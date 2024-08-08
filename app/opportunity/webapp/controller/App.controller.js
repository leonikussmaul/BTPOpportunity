sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    'sap/m/library',
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/FilterType",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast",
    'sap/m/MessageBox',
  ],
  function (BaseController, library, Fragment, formatter, Filter, FilterOperator, FilterType, UIComponent, JSONModel, MessageToast, MessageBox) {
    "use strict";

    return BaseController.extend("opportunity.opportunity.controller.App", {
      formatter: formatter,

      onInit() {

        var oLocalModel = new JSONModel({});
        this.getView().setModel(oLocalModel, "localModel");

        this.oOwnerComponent = this.getOwnerComponent();
        this.oRouter = this.oOwnerComponent.getRouter();
        this.oRouter.attachRouteMatched(this.onRouteMatched, this);

        this.getView().setModel(
          new JSONModel({
            imagePath: './images/diamond.png',
            genieImage: './images/genie/genie.png',
            isMessageStripVisible: false,
            isSuggestionVisible: true,
            isWelcomePanelVisible: true
            // isFullScreenMode: false,
            // settingsDialogPreviousSelections: {}
          }),
          'viewModel'
        );
        this.getView().setModel(new sap.ui.model.json.JSONModel({
        }), "chatModel");

        this.getView().setModel(new sap.ui.model.json.JSONModel({
        }), "historyModel");
        this.getView().getModel("historyModel").setProperty("/history", []);

      },


      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },

      onHomeIconPressed: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("Overview");
        this.getView().byId("sideNavigation").setSelectedItem(null);
      },

      onOpenSAPOne: function () {
        var sUrlSAPOne = 'https://one.int.sap/home';
        library.URLHelper.redirect(sUrlSAPOne, true);
      },

      onOpenSharePoint: function () {
        var sUrlSharePoint = 'https://sap.sharepoint.com/sites/201967';
        library.URLHelper.redirect(sUrlSharePoint, true);
      },

      // onOpenServiceCatalog: function () {
      //   var sUrlServiceCatalog = 'https://servicescatalog.cvdp3eof-dbsservic1-p1-public.model-t.cc.commerce.ondemand.com/';
      //   library.URLHelper.redirect(sUrlServiceCatalog, true);
      // },

      // onOpenAnalyticsStore: function () {
      //   var sUrlAnalyticsStore = 'https://eas.sap.com/astore/ui/index.html#assets';
      //   library.URLHelper.redirect(sUrlAnalyticsStore, true);
      // },

      onOpenGenieTeamsChannel: function () {
        var sUrlServiceCatalog = 'https://teams.microsoft.com/l/team/19%3ACQux_k8zte78DMIFtUzI3sh5tRp8NiEEZTndqMLHPfk1%40thread.tacv2/conversations?groupId=373d5920-56b1-4d41-9c32-030a71e9592c&tenantId=42f7676c-f455-423c-82f6-dc2d99791af7';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenGenieRuum: function () {
        var sUrlServiceCatalog = 'https://open.ruumapp.com/projects/ruum_1715765401349_ajisgz361d/canvas';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenCustomerTemplateRuum: function () {
        var sUrlServiceCatalog = 'https://open.ruumapp.com/templates/projects/template_1722872719149_rp2k335icpr/canvas';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenInternalTemplateRuum: function () {
        var sUrlServiceCatalog = 'https://open.ruumapp.com/templates/projects/template_1722875347316_ek40t41rz3a/canvas';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenGenieSharePoint: function () {
        var sUrlServiceCatalog = 'https://sap.sharepoint.com/:u:/r/sites/209083/SitePages/Home.aspx?csf=1&web=1&share=EZ1yRiAQnBNJkbFmc0bwN_IBq0xK5oDx0XMUDpZ7tVYOJw&e=Btpi61';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenGenieTeaserVideo: function () {
        var sUrlServiceCatalog = 'https://video.sap.com/media/t/1_9zd8rqi2';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },
      onOpenGenieChatBot: function () {
        var sUrlServiceCatalog = 'https://chatbot-genie.launchpad.cfapps.eu10.hana.ondemand.com/38bdd9f7-c0ba-42e8-b084-bde5c4569a4e.genieai.genieai-0.0.1/index.html';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenGenieTechnicalGuide: function () {
        var sUrlServiceCatalog = 'https://sap.sharepoint.com/:u:/r/sites/209083/SitePages/Day-3.aspx?csf=1&web=1&share=EQljQD7_dWpLhKKMJb2Pr44BjQmKzBh0my8YcwB_5mQQ_A&e=SKzcij';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },


      //Team
      onOpenDemandGeniusVideo: function () {
        var sUrlServiceCatalog = 'https://sapvideoa35699dc5.hana.ondemand.com/?entry_id=1_rsm9ii1n';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenBTPVideos: function () {
        var sUrlServiceCatalog = 'https://www.sap.com/cmp/oth/business-technology-platform-video-series/index.html';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenAdoptionClassService: function () {
        var sUrlServiceCatalog = 'https://servicescatalog.cvdp3eof-dbsservic1-p1-public.model-t.cc.commerce.ondemand.com/Solution-Area-Hierarchy-2024/Business-Technology-Platform/AppDev-Automation-and-Integration/AppDev-and-Automation/AppDev-and-Automation-Services/SAP-Build-Code/SAP-BTP-Adoption-Class/p/000000000050159444';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onOpenFeedbackForm: function () {
        var sUrlServiceCatalog = 'https://forms.gle/4533CmqPpxVdnGPv5';
        library.URLHelper.redirect(sUrlServiceCatalog, true);
      },

      onNavToOpportunities: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("OpportunityReport");
      },

      onNavToGenieAIMain: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("GenieAIMain", {
          type: "Customer"
        });
      },


      onNavToTeamEngagement: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TeamEngagement");
      },

      onToggleSideMenu: function (oEvent) {

        var oToolPage = this.byId("toolPage");
        var bSideExpanded = oToolPage.getSideExpanded();
        oToolPage.setSideExpanded(!bSideExpanded);
      },

      onOpenAbout: function (oEvent) {
        //sap.m.MessageToast.show("Details will come soon! Stay tuned.");
        this.onDialogOpen("opportunity.opportunity.view.fragments.InfoPopup");

      },

      onOpenTeamChart: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("TeamChart");
      },


      onOpenPopover: function (oEvent, sFragment) {
        var oButton = oEvent.getSource(),
          oView = this.getView();

        // create popover
        if (!this._pPopover) {
          this._pPopover = Fragment.load({
            id: oView.getId(),
            name: sFragment,
            controller: this
          }).then(function (oPopover) {
            oView.addDependent(oPopover);
            return oPopover;
          });
        }

        this._pPopover.then(function (oPopover) {
          oPopover.openBy(oButton);
        });

      },


      onCancelDialogPress: function (oEvent) {
        this.editDialog = false;
        this._currentDialog.then(function (_pDialog) {
          _pDialog.close();
          _pDialog.destroy();
        });
        this._pDialog = null;
        this.getView().getModel("localModel").setData({});

      },

      onOpenIndividualEngagement: function (oEvent) {
        // Adjusted function call with the correct fragment name and path
        this.onDialogOpen("opportunity.opportunity.view.fragments.TeamSelection");
      },

      onDialogOpen: function (fragmentName) {
        var that = this;

        if (!this._dialogs) {
          this._dialogs = {};
        }

        if (!this._dialogs[fragmentName]) {
          this._dialogs[fragmentName] = Fragment.load({
            name: fragmentName,
            controller: this
          }).then(function (oDialog) {
            that.getView().addDependent(oDialog);
            oDialog.setEscapeHandler(function () {
              that.onCloseDialog();
            });
            return oDialog;
          });
        }

        this._currentDialog = this._dialogs[fragmentName];

        this._currentDialog.then(function (oDialog) {
          oDialog.open();
        }).catch(function (error) {
          console.error("Error opening dialog: ", error);
        });
      },



      onCloseDialog: function () {
        var that = this;

        // Ensure the correct dialog is referenced
        if (this._currentDialog) {
          this._currentDialog.then(function (oDialog) {
            oDialog.close();
          }).catch(function (error) {
            console.error("Error closing dialog: ", error);
          });
        }

        // Clear the selected key
        this.getOwnerComponent().getModel("global").setProperty("/selectedKey", "");
      },


      onOpenCalendar: function (oEvent) {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("Calendar");
      },

      onSelectTeamMember: function (oEvent) {
        var inumber = oEvent.getParameter("listItem").getBindingContext().getObject().inumber;

        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("IndividualEngagement", {
          inumber: inumber
        }
        );
        this.onCloseDialog();

      },

      onSearchTeamMember: function (oEvent) {

        var aFilters = [];
        var sQuery = oEvent.getSource().getValue();
        if (sQuery && sQuery.length > 0) {
          var aFilters = [
            new Filter({
              filters: [
                new Filter({ path: "firstName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
                new Filter({ path: "lastName", operator: FilterOperator.Contains, value1: sQuery, caseSensitive: false }),
              ],
              and: false
            })
          ];
        }

        var oList = sap.ui.getCore().byId("teamMemberList").getBinding("items");
        oList.filter(aFilters, FilterType.Application);

      },

      onSubmitFeedback: function (oEvent) {
        var that = this;
        var oLocalModel = this.getView().getModel("localModel");

        var oData = oLocalModel.getData();
        if (oData.feedback) {

          var sPostedBy = this.getOwnerComponent().getModel("user").getProperty("/firstname");


          var bPositive;

          if (oData.positive === true) bPositive = true;
          else if (oData.negative === true) bPositive = false;

          var oPayload = {
            feedback: oData.feedback,
            positive: bPositive,
            postedBy: sPostedBy,
            postedOn: new Date()
          }

          that.getView().setBusy(true);
          var oModel = that.getView().getModel();
          oModel.create("/userFeedback", oPayload, {
            success: function (oData, response) {
              MessageToast.show("Your Feedback has been registered. Thank you!");
              that.getView().setBusy(false);
            },
            error: function (oError) {
              that.getView().setBusy(false);
              var sMessage = JSON.parse(oError.responseText).error.message.value;
              sap.m.MessageBox.error(sMessage);

            }
          });
        } else MessageToast.show("Please enter your feedback first");


      },
      onTogglePositiveFeedback: function () {
        var oLocalModel = this.getView().getModel("localModel");
        oLocalModel.setProperty("/positive", true);
        oLocalModel.setProperty("/negative", false);
      },

      onToggleNegativeFeedback: function () {
        var oLocalModel = this.getView().getModel("localModel");
        oLocalModel.setProperty("/positive", false);
        oLocalModel.setProperty("/negative", true);
      },

      onThemePicker: function (oEvent) {
        var sTheme = oEvent.getParameters().item.getKey();
        if (sTheme === "MorningHorizon") {
          sap.ui.getCore().applyTheme("sap_horizon");

        } else if (sTheme === "EveningHorizon") {
          sap.ui.getCore().applyTheme("sap_horizon_dark");

        }

      },
      onRouteMatched: function (oEvent) {
        var sRouteName = oEvent.getParameter("name"),
          oArguments = oEvent.getParameter("arguments");

        // Save the current route name
        this.currentRouteName = sRouteName;
        this.opportunityID = oArguments.opportunityID;
      },

      onStateChanged: function (oEvent) {
        var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
          sLayout = oEvent.getParameter("layout");

        // Replace the URL with the new layout if a navigation arrow was used
        if (bIsNavigationArrow) {
          this.oRouter.navTo(this.currentRouteName, { layout: sLayout, opportunityID: this.opportunityID }, true);
        }
      },

      onExit: function () {
        this.oRouter.detachRouteMatched(this.onRouteMatched, this);
      },

      onNavToChatbot: function (oEvent) {
        try {
          var oParent = oEvent.getSource().getParent().getParent().getParent();
          if (oParent && typeof oParent.close === 'function') {
            oParent.close();
          }
        } catch (error) {
          console.error("error:", error);
        }
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("chatbot");

      },


      /* ------------------------------------------------------------------------------------------------------------
    GENIE CHABOT
      --------------------------------------------------------------------------------------------------------------*/


      onPressChatbotPopup: function (oEvent) {
        this.onOpenPopover(oEvent, "opportunity.opportunity.view.fragments.ChatbotPopover");

      },

      onCloseChatbotPopover: function(oEvent){
        oEvent.getSource().getParent().getParent().getParent().close();
     
      },

      onResetChatbot: function(oEvent){
        var oViewModel = this.getView().getModel("viewModel");
        oViewModel.setProperty("/isWelcomePanelVisible", true);
        oViewModel.setProperty("/isMessageStripVisible", false);
        oViewModel.setProperty("/isSuggestionVisible", true);
        this.getView().byId('messagesWrapper').removeAllItems();
        this.getView().getModel("chatModel").setData({});
     
      },

      onPostMessage: function (oEvent) {
        var that = this;
        var oChatModel = this.getView().getModel("chatModel");
        var oInput = oChatModel.getProperty("/userInput");
        var oHistoryModel = this.getView().getModel("historyModel");
        var oMessagesWrapper = this.getView().byId("messagesWrapper");

        //make welcome panel invisible after user interaction for better UX
        var oViewModel = this.getView().getModel("viewModel");
        oViewModel.setProperty("/isWelcomePanelVisible", false);
        oViewModel.setProperty("/isMessageStripVisible", true);
        oViewModel.setProperty("/isSuggestionVisible", false);


        // Create the user question as a VBox with a Text control
        var oUserQuestion = new sap.m.VBox({
          items: [
            new sap.m.Text({
              text: oInput
            }).addStyleClass("aiUserMessage")
              .addStyleClass("sapUiSmallMarginBegin")
              .addStyleClass("sapUiTinyMarginTopBottom")
          ]
        }).addStyleClass("userMessageWrapper");

        oMessagesWrapper.addItem(oUserQuestion);
        //this._oBusyDialog.open();
        this.showThinkingDots();

        // Use the getBotResponse function and wait for the response
        this.getBotResponse(oInput).then(function (sBotResponse) {
          var oBotResponse = new sap.m.VBox({
            items: [
              new sap.m.Text({
                text: sBotResponse
              }).addStyleClass("aiBotMessage")
                .addStyleClass("sapUiSmallMarginEnd")
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
            // that.handleScroll();
          }, 100);
        });

        oChatModel.setData({});
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


      getBotResponse: function (sUserInput) {
        var that = this;
        let oModel = this.getView().getModel("genieV4");
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

      onPressSuggestion: function (oEvent) {
        var oViewModel = this.getView().getModel("viewModel");
        oViewModel.setProperty("/isSuggestionVisible", false);
        var sKey = oEvent.getSource().getText();
        var oChatModel = this.getView().getModel("chatModel");

        var sInput;
        if (sKey == "Customers") sInput = "Who are the Genie AI Customer Leads?";
        else if (sKey == "Workshop Dates") sInput = "What are the Genie AI planned Workshop Dates?";
        else if (sKey == "More Info") sInput = "Can you give more general information on the Genie AI Workshop?";

        oChatModel.setProperty("/userInput", sInput);
        if(sInput) this.onPostMessage(); 
      }


    });
  }
);

