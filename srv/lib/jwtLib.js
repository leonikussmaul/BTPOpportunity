const jwtLib = require('./jwtLib');

//
// Get the user's login JWT token
// The token is passed in the request header from the UI
// cds_request is the req from a cds service event and not the raw request
//

module.exports.getUserJWTToken = function (cds_request) {

	var theJwtToken = null;
	var headers = null;
	try {
			// OData V4 - headers are in shared...
			headers = cds_request._.shared.req.headers;
		} catch (err) {
			try {
				// OData V2 - headers are in req...
				headers = cds_request._.req.headers;
			} catch (err) {
					try {

				// changes
				headers = cds_request.headers;
			} catch (err) {
			}
			}
		}

	if (headers && headers.authorization) {
		theJwtToken = headers.authorization.substring(7); // removes 'bearer ' from token string
	}

	return theJwtToken;

}

//
// Get the user's logon details from the login JWT token
// The token is passed in the request header from the UI and then decoded
// cds_request is the req from a cds service event and not the raw request
//

module.exports.getUserLogonDetails = function (cds_request) {

    // JWT logon token decoder
    const jwt = require('jsonwebtoken');

	var firstname = 'error, no token';
	var lastname = 'error, no token';
	var fullname = 'error, no token';
	var initials = '';
	var username = null;
	var email = 'error, no token';
	var jwtDecoded = 'error, no token';

	var theJwtToken = null;
	var headers = null;
	if (cds_request) {
		var theJwtToken = jwtLib.getUserJWTToken(cds_request);

        // *** Keep these comments as the code is used for local testing ***
        // display the JWT in the consol log
        // console.log('JWT:' + theJwtToken);

		if (theJwtToken){
			var decoded = jwt.decode(theJwtToken);

			firstname = decoded.given_name;
			lastname = decoded.family_name;
			username = decoded.user_name.toUpperCase();
			email = decoded.email;

		}

        

	}

	var data = {
				firstname: firstname,
				lastname: lastname,
				fullname: firstname + ' ' + lastname,
				username: username,
				email: email,
				initials: firstname.substring(0,1) + lastname.substring(0,1)
			};

	return data;
}



