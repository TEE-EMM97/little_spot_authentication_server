'use strict';

var crypto = require('../utils/crypto.js');
var https = require('https');
var querystring = require('querystring');

var CLIENT_ID = null;
var CLIENT_SECRET = null;
var CLIENT_CALLBACK_URL = null;
var ENCRYPTION_SECRET = null;
var API_DOMAIN = null;
var API_PATH = null;


function spotifyRequest(params) {

  return new Promise(function (resolve, reject) {

    // set authorisation in headers
    var headers = {
      'Content-Type': 'application/x-www-form-urlencoded',
      "Authorization": "Basic " + new Buffer(CLIENT_ID + ":" + CLIENT_SECRET).toString('base64')
    };

    // construct http request object
    var httpRequest = https.request({
      method: 'POST',
      port: 443,
      hostname: API_DOMAIN,
      path: API_PATH,
      headers: headers
    }, function (res) {
      res.setEncoding('utf8');
      res.on('data', function (body) {
        console.log("Success posting to SPOTIFY.", body);
        resolve(body);
      });
    });
    httpRequest.on('error', function (err) {
      console.log('error posting to SPOTIFY:', err);
      reject(err);
    });
    console.log("sending to SPOTIFY:", params);
    httpRequest.write(querystring.stringify(params));
    httpRequest.end();

  });

}


/**
 * post exchange code
 *
 * body Body 
 * returns inline_response_200
 **/
exports.exchangeCode = function (body) {

  return new Promise(function (resolve, reject) {

    spotifyRequest({
      grant_type: "authorization_code",
      redirect_uri: CLIENT_CALLBACK_URL,
      code: body.code
    })
      .then(
        function (response) {
          var session = JSON.parse(response);
          var result = {
            access_token: session.access_token,
            expires_in: session.expires_in,
            refresh_token: crypto.encrypt(session.refresh_token, ENCRYPTION_SECRET)
          };
          resolve(result);
        }
      );
  }
  );
}


/**
 * post refresh token
 *
 * body Body_1 
 * returns inline_response_200_1
 **/
exports.spotifyRefreshPOST = function (body) {

  return new Promise(function (resolve, reject) {

    spotifyRequest({
      grant_type: "refresh_token",
      refresh_token: crypto.decrypt(body.refresh_token, ENCRYPTION_SECRET)
    })
      .then(
        function (response) {
          var session = JSON.parse(response);
          var result = {
            "access_token": session.access_token,
            "expires_in": session.expires_in
          };
          resolve(result);
        }
      );
  }
  );
}


exports.initialise = function (config) {
  CLIENT_ID = config.clientId;
  CLIENT_SECRET = config.clientSecret;
  CLIENT_CALLBACK_URL = config.clientCallbackUrl;
  ENCRYPTION_SECRET = config.encryptionSecret;
  API_DOMAIN = config.apiDomain;
  API_PATH = config.apiPath;
}




