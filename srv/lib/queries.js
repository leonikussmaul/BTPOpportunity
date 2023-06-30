const cds = require('@sap/cds');
const jwtLib = require('../lib/jwtLib');
const cfenv = require('cfenv');


// module.exports.ReadCurrentUser = async function (req) {
//     try {
//         const userDetails = jwtLib.getUserLogonDetails(req);
//         req.reply(userDetails);
//     } catch (error) {
//         req.error({
//             code: 'InternalError',
//             message: error.message,
//             target: 'ReadCurrentUser',
//             status: 418
//         });
//     }
// }


module.exports.ReadCurrentUser = async function (req) {

    try {

        const dbTx = cds.tx(req);
        const userDetails = jwtLib.getUserLogonDetails(req);

        req.reply(userDetails);


    } catch (error) {
        req.error({
            code: 'InternalError',
            message: error.message,
            target: 'ReadCurrentUser',
            status: 418
        })
    }

}


