const cds = require("@sap/cds");
const cov2ap = require("@sap/cds-odata-v2-adapter-proxy");
const xsenv = require("@sap/xsenv");
const passport = require("passport");
const JWTStrategy = require("@sap/xssec").JWTStrategy;
cds.on("bootstrap", (app) => app.use(cov2ap()));
module.exports = cds.server;



