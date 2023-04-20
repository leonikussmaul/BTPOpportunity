    sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/m/MessageBox",
        "sap/ui/core/Fragment",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        'sap/ui/model/Sorter',
        "sap/ui/core/message/Message",
        "sap/m/MessageToast",
        "sap/ui/core/library",
        "sap/ui/core/ValueState",
        "sap/m/Token",
        "sap/ui/export/Spreadsheet",
        'jquery.sap.global',
        "sap/ui/model/FilterType",
        "../model/formatter",
    ],
        /**
         * @param {typeof sap.ui.core.mvc.Controller} Controller
         */
        function (Controller, MessageBox, Fragment, JSONModel, Filter, FilterOperator, Sorter, Message, MessageToast, library, ValueState, Token, Spreadsheet, jQuery, FilterType, formatter) {
            "use strict";
            var oSettingsModel;
    
    
            return Controller.extend("opportunity.opportunity.controller.MainReport", {
                formatter: formatter,
                onInit: function () {
    
                    this._mViewSettingsDialogs = {};
    
                    this.getView().setModel(new JSONModel({
                    }), "settingsModel");
                    oSettingsModel = this.getView().getModel("settingsModel");
    
                    this.getView().setModel(new JSONModel({
                        "isFavourite": false
                    }), "favModel");
                    var oFavModel = this.getView().getModel("favModel");
    
                    var oView = this.getView();
                    oView.setModel(new JSONModel({
                    }), "localModel");
    
                    var oFilterModel = new JSONModel({
                        "marketUnit": [
                            {
                                "key": "marketUnit",
                                "text": "BeLux"
                            },
                            {
                                "key": "marketUnit",
                                "text": "France"
                            },
                            {
                                "key": "marketUnit",
                                "text": "Netherlands"
                            },
                            {
                                "key": "marketUnit",
                                "text": "Nordics"
                            },
                            {
                                "key": "marketUnit",
                                "text": "UKI"
                            }
                        ]
                    });
                    oView.setModel(oFilterModel, "filterModel");
    
                    sap.ui.core.UIComponent.getRouterFor(this).getRoute("MainReport").attachMatched(this.onNavBackMatched, this);
    
                },
    
                onNavBackMatched: function () {
                    var oBinding = this.byId("mainTable").getBinding("items");
                    oBinding.refresh();
    
                },
    
                // onBeforeRendering(){
                // var oBinding = this.byId("mainTable").getBinding("items");
                // oBinding.refresh();
    
                // }, 
                _getText: function (sTextId, aArgs) {
                    return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(sTextId, aArgs);
    
                },
    
                onRefreshTable: function () {
                    this.getView().byId("mainTable").getBinding("items").refresh();
    
                },
    
                onDataReceived: function (oEvent) {
    
                    var aData = [];
                    var aContext = oEvent.getSource().aContexts;
    
                    aContext.forEach(context => {
                        var oObject = context.getObject();
                        aData.push(oObject);
                    })
                    // this.getView().getModel("localModel").setData({tableData: aData}, true);
    
                    oLocalModel.setProperty("/tableData", aData);
    
                },
    
                //multiComboBox
                onSelectionChange: function(oEvent){
                    var aFilters = [];
                    var oTable = this.getView().byId("mainTable");
                    var oBinding = oTable.getBinding("items");
                    var aSelectedKeys = oEvent.getSource().getSelectedItems();
                    if (aSelectedKeys.length > 0) {
                        aSelectedKeys.forEach(oItem => {
                            //var sPath = oItem.mBindingInfos.key.binding.sPath;
                            aFilters.push(new Filter(oItem.getKey(), FilterOperator.Contains, oItem.getText()))
                        })
                        oBinding.filter(aFilters);
                    } else {
                        aFilters = [];
                        oBinding.filter(aFilters);
                    }
                },
    
                //comboBox
                onSelectChange: function(oEvent){
                    var aFilters = [];
                    var oTable = this.getView().byId("mainTable");
                    var oBinding = oTable.getBinding("items");
                    var oSelectedKey = oEvent.getSource().getSelectedKey();
                    if (oSelectedKey) {
                        aFilters.push(new Filter("opportunityClosedQuarter", FilterOperator.Contains, oSelectedKey))
                        oBinding.filter(aFilters);
                    } else {
                        aFilters = [];
                        oBinding.filter(aFilters);
                    }
    
                },
    
                onGoPress: function (oEvent) {
                    //filters
                    var aFilters = [];
                    var oSelectionSet = oEvent.getParameters().selectionSet;
                    for (var i = 0; i <= 4; i++) {
                        var aSelect = oSelectionSet[i].getSelectedItems();
                        if (aSelect.length > 0) {
                            aSelect.forEach(oItem => {
                                var sPath = oItem.mBindingInfos.key.binding.sPath;
                                aFilters.push(new Filter(sPath, FilterOperator.Contains, oItem.getKey()))
                            })
                        }
                    }
                    var oMultiComboBox = this.getView().byId("QuarterComboBox");
                    var oSelKey = oMultiComboBox.getSelectedKey();
                    if (oSelKey)
                        aFilters.push(new Filter("opportunityClosedQuarter", FilterOperator.EQ, oSelKey));
                    //var oCheckbox = this.getView().byId("checkbox1").getSelected();
                    //if (oCheckbox == true) aFilters.push(new Filter("opportunityInCRM", FilterOperator.Contains, "Yes"));
                    // var oDP = this.getView().byId("dueDateId").getValue(); 
                    // if(oDP != "") aFilters.push(new Filter("opportunityDate", FilterOperator.Contains, new Date(oDP).toISOString()));
                    var oList = this.getView().byId("mainTable");
                    //get reference to the list binding and push filters
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(aFilters);
    
                },
    
                onSearch: function (oEvent) {
                    var aFilters = [];
                    var sQuery = oEvent.getSource().getValue();
                    if (sQuery && sQuery.length > 0) {
                        var oFilter1 = new Filter("marketUnit", FilterOperator.Contains, sQuery);
                        var oFilter2 = new Filter("account", FilterOperator.Contains, sQuery);
                        var oFilter3 = new Filter("topic", FilterOperator.Contains, sQuery);
                        var oFilter4 = new Filter("status", FilterOperator.Contains, sQuery);
                        var oFilter5 = new Filter("primaryContact", FilterOperator.Contains, sQuery);
                        var oFilter6 = new Filter("ssa", FilterOperator.Contains, sQuery);
                        var oFilter7 = new Filter("opportunityClosedQuarter", FilterOperator.Contains, sQuery);
                        //var oFilter8 = new Filter("opportunityValue", FilterOperator.Contains, sQuery);
                        aFilters = new Filter([oFilter1, oFilter2, oFilter3, oFilter4, oFilter5, oFilter6, oFilter7]);
                        //oFilter8
                    }
    
                    var oList = this.byId("mainTable");
                    var oBinding = oList.getBinding("items");
                    oBinding.filter(aFilters, FilterType.Application);
                },
    
    
    
                onTableItemPress: function (oEvent) {
    
                    var selectedItem = oEvent.getSource().getBindingContext().getObject();
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("ObjectPage", {
                        opportunityID: selectedItem.opportunityID
                    });
                    //this.getView().byId("tableSection").setVisible(true);
                },
    
                onAddTableItem: function () {
                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                    oRouter.navTo("CreatePage", {
                        // opportunityID : "123"
                    });
                },
    
    
                /* ------------------------------------------------------------------------------------------------------------
                EXPORT
                --------------------------------------------------------------------------------------------------------------*/
                onExportButtonPress: function () {
                    this.onExportTable(true);
                },
    
                _getTemplate: function (oTable) {
                    var aColumns = oTable.getColumns();
                    var aTemplate = [];
    
                    aColumns.forEach((column) => {
                        if (column.getVisible()) {
                            aTemplate.push({
                                label: column.getHeader().getText(),
                                property: column.getHeader().getBindingInfo("text").binding.getPath()
                            })
                        }
                    });
                    return aTemplate;
                },
    
                onExportTable: function (bExportAll) {
                    var oTable = this.getView().byId("mainTable");
                    oTable.setVisible(true);
                    var aCols, aRecords, oSettings, oSheet;
                    var aContext = [];
    
                    //aRecords = oModel.getProperty('/opportunityHeader');
                    aRecords = oTable.getItems();
                    aRecords.forEach(oRecord => {
                        var oItem = oRecord.getBindingContext().getObject();
                        aContext.push(oItem);
                    });
    
                    aCols = this._getTemplate(oTable);
    
                    oSettings = {
                        workbook: { columns: aCols },
                        dataSource: bExportAll ? aContext : aContext.filter(res => res.Flag === "ERROR")
                    };
    
                    oSheet = new Spreadsheet(oSettings);
                    oSheet.build()
                        .then(function () {
                            MessageToast.show(this.getI18n("exportMsg"));
                        })
                        .finally(oSheet.destroy);
                },
    
    
                /* ------------------------------------------------------------------------------------------------------------
                SORT
                --------------------------------------------------------------------------------------------------------------*/
    
                onSortButtonPress: function () {
                    this.getDialog("opportunity.tracker.opportunitytracker.view.fragments.SortDialog")
                        .then(function (oViewSettingsDialog) {
                            oViewSettingsDialog.open();
                        });
    
                },
    
                getDialog: function (sDialogFragmentName) {
                    var pDialog = this._mViewSettingsDialogs[sDialogFragmentName];
    
                    if (!pDialog) {
                        pDialog = Fragment.load({
                            id: this.getView().getId(),
                            name: sDialogFragmentName,
                            controller: this
                        }).then(function (oDialog) {
                            return oDialog;
                        });
                        this._mViewSettingsDialogs[sDialogFragmentName] = pDialog;
                    }
                    return pDialog;
                },
    
                handleSortDialogConfirm: function (oEvent) {
                    var mParams = oEvent.getParameters(),
                        sPath,
                        bDescending,
                        aSorters = [];
    
                    sPath = mParams.sortItem.getKey();
                    bDescending = mParams.sortDescending;
                    if (sPath == "marketUnit")
                        aSorters.push(new Sorter("marketUnit", bDescending));
                    else if (sPath == "opportunityValue")
                        aSorters.push(new Sorter("opportunityValue", bDescending));
                    else if (sPath == "opportunityDate")
                        aSorters.push(new Sorter("opportunityDate", bDescending));
                    else if (sPath == "account")
                        aSorters.push(new Sorter("account", bDescending));
                    else if (sPath == "status")
                        aSorters.push(new Sorter("status", bDescending));
    
                    aSorters.push(new Sorter(sPath, bDescending));
    
                    var oList = this.byId("mainTable");
                    var oBinding = oList.getBinding("items");
                    oBinding.sort(aSorters);
                },
    
                onReset: function (oEvent) {
                    var aSelected = oEvent.getParameters().selectionSet;
                    aSelected.forEach(oSelect => {
                        oSelect.removeAllSelectedItems(true);
                    })
    
                },
    
                /* ------------------------------------------------------------------------------------------------------------
                          FAVOURITE
                          --------------------------------------------------------------------------------------------------------------*/
    
                onFavouriteToolbarPress: function (oEvent) {
                    var aFilters = [];
                    var oUnfavourite = this.getView().byId("starButtonOff");
                    var oFavourite = this.getView().byId("starButtonOn");
                    if (oUnfavourite.getVisible(true)) {
                        oUnfavourite.setVisible(false)
                        oFavourite.setVisible(true)
    
                        // aFilters.push(new Filter("isFavourite", FilterOperator.Contains, true));
                        // var oList = this.getView().byId("mainTable");
                        // var oBinding = oList.getBinding("items");
                        // oBinding.filter(aFilters);
                    }
                    else if (oFavourite.getVisible(true)) {
                        oFavourite.setVisible(false)
                        oUnfavourite.setVisible(true)
    
                        // aFilters.push(new Filter("isFavourite", FilterOperator.Contains, false));
                        // var oList = this.getView().byId("mainTable");
                        // var oBinding = oList.getBinding("items");
                        // oBinding.filter(aFilters);
                    }
    
                },
    
                onFavouritePress: function (oEvent) {
                    //post isFavourite 
    
                },
    
                onToggleInCRM: function (oEvent) {
                    var bPressed = oEvent.getSource().getPressed();
                    var sValue = bPressed ? "Yes" : "No";
                    oEvent.getSource().setText(sValue);
                
                    var sFilterValue = bPressed ? "Yes" : "";
                    var oFilter = new Filter("opportunityInCRM", FilterOperator.Contains, sFilterValue);
                    var oTable = this.getView().byId("mainTable");
                    oTable.getBinding("items").filter(oFilter);
                },
    
    
    
            });
        });
    