const cds = require('@sap/cds');
const queries = require('./lib/queries');

const opportunityHeaderEntity = cds.entities["sapbtp.opportunities.opportunityHeader"];

/******************************************************************************
*** Service implementation for Opportunity Service 
******************************************************************************/
module.exports = cds.service.impl(function () {

    this.before('CREATE', 'opportunityHeader', assignOpportunitySeqID);

})

async function assignOpportunitySeqID(req) {

    const db = await cds.connect.to("db");
    var seqResult;
    if (db.kind == "hana") {
        var seqResult = await db.run(`SELECT "OPPORTUNITYSEQID".NEXTVAL as MAXSEQID FROM DUMMY`);
    }

    if (!seqResult) {
        const tx = await cds.transaction(req);
        seqResult = await tx.run(SELECT.from(opportunityHeaderEntity).columns('MAX(opportunityID) as MAXSEQID'));
    }

    var opportunityID = seqResult && Array.isArray(seqResult) && seqResult.length > 0 && seqResult[0]["MAXSEQID"];
    if (db.kind != "hana") {
        opportunityID = opportunityID && opportunityID + 1;
    }
    if (opportunityID) {
        req.data.opportunityID = opportunityID;
    }
}


// module.exports = async function (){
    
//     // this.on('READ', 'Test', (req) => {
//     //     req.reply([
//     //         {
//     //             ID: 1
//     //         }
//     //     ])
//     // });

//     this.on('READ', 'CurrentUser', async (req) => {
//         await queries.ReadCurrentUser(req);
//     }); 


//     // this.on('READ', 'CurrentUser', async (req) => {
//     //     await queries.ReadCurrentUser(req);
//     // }); 

// }