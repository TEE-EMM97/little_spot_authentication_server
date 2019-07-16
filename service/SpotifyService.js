'use strict';


/**
 * post exchange code
 *
 * body Body 
 * returns inline_response_200
 **/
exports.exchangeCode = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "access_token" : "access_token",
  "refresh_token" : "refresh_token",
  "expires_in" : "expires_in"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}


/**
 * post refresh token
 *
 * body Body_1 
 * returns inline_response_200_1
 **/
exports.spotifyRefreshPOST = function(body) {
  return new Promise(function(resolve, reject) {
    var examples = {};
    examples['application/json'] = {
  "access_token" : "access_token",
  "expires_in" : "expires_in"
};
    if (Object.keys(examples).length > 0) {
      resolve(examples[Object.keys(examples)[0]]);
    } else {
      resolve();
    }
  });
}

