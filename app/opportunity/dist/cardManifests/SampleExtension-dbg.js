sap.ui.define(["sap/ui/integration/Extension"], function (Extension) {

	var SampleExtension = Extension.extend("opportunity.opportunity.cardManifests.SampleExtension");



    SampleExtension.prototype.init = function () {
		Extension.prototype.init.apply(this, arguments);

		this.setFormatters({
			calendarDate: function (date) {
       
                    var yr = new Date(date).getFullYear();
                    var mnt = new Date(date).getMonth();
                    var day = new Date(date).getDate();
                    var sNewDate = new Date(yr, mnt, day, "00", "00");
                    return sNewDate.toISOString();
                   // return sNewDate;

               
            
			},
            calendarEndDate: function (date) {
       
                var yr = new Date(date).getFullYear();
                var mnt = new Date(date).getMonth();
                var day = new Date(date).getDate();
                var sNewDate = new Date(yr, mnt, day, "23", "59");
                return sNewDate.toISOString();
               // return sNewDate;

           
        
        },

        projectValueFormatter: function (sValue) {
       
           if(sValue){
            return sValue + " €"
           }else return ""; 
    
    },

    engagementFormatter: function (sPercentage) {
       
        if(sPercentage){
         return sPercentage + " %"
        }else return ""; 
 
 },

 actionDueDateFormatter: function(sDate){
    var sDueDate = new Date(sDate);
    var sTodayDate = new Date();
    if (sDueDate < sTodayDate) return "Error";
    else if (sDueDate === sTodayDate) return "Warning";

 },

		});
	};

	SampleExtension.prototype.legendFunction = function () {

        var legendItemsData = [
            { category: "appointment", text: "Text 1", type: "Type06" },
            { category: "meeting", text: "Text 2", type: "Type07" },
            { category: "task", text: "Text 3", type: "Type08" }
        ];
        
        return legendItemsData;

		// var oData1 = { user: "John" }; // this data can be fetched from data service
		// var oData2 = { user: "Peter" }; // this data can be fetched from another data service

		// // in the end data from both data services is combined into a single array
		// return Promise.resolve([oData1, oData2]);
	};

	return SampleExtension;
});


