const expressJwt = require('express-jwt');
const config = require('../config.json');
const accountService = require('../accounts/accounts.service');

module.exports = jwt;

function jwt() {
    const secret = config.secret;
    return expressJwt({ secret, isRevoked }).unless({
        path: [
            // public routes that don't require authentication
            '/acct/auth',
            '/prod', 
            '/pg'

        ]
    });
}

async function isRevoked(req, payload, done) {
    // Trust that valid tokens are ok.
    //const account = await accountService.getById(payload.userid);
    const account = true

    // revoke token if user no longer exists or has been deactivated
    if (!account) {
        return done(null, true);
    }

    done();
};

