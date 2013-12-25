// Generated by CoffeeScript 1.3.3
var MailruApi, md5, qs, request, requestOptions, _, _responseHandler;

qs = require('querystring');

request = require('request');

_ = require('underscore');

md5 = require('blueimp-md5').md5;

requestOptions = {
  applicationSecretKey: null,
  applicationKey: null,
  applicationId: null,
  sessionKey: null,
  refreshToken: null,
  restBase: 'http://www.appsmail.ru/platform/api',
  refreshBase: 'https://appsmail.ru/oauth/token'
};

exports.version = '0.1.0';

MailruApi = (function() {
  var makeRequest, makeSignature, parametrize, validateOptions;

  function MailruApi(method, postData, callback) {
    validateOptions();
    makeRequest(method, postData, callback);
  }

  makeRequest = function(method, postData, callback) {
    var getUrl, requestedData;
    requestedData = {
      app_id: requestOptions['applicationId'],
      session_key: requestOptions['sessionKey'],
      sig: makeSignature(postData)
    };
    _.extend(requestedData, postData);
    switch (method.toUpperCase()) {
      case 'POST':
        return request.post({
          uri: requestOptions['restBase'],
          json: true,
          headers: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: qs.stringify(requestedData)
        }, function(error, response, body) {
          return _responseHandler(error, response, body, callback);
        });
      case 'GET':
        getUrl = ("" + requestOptions['restBase'] + "?") + parametrize(requestedData, '&');
        return request.get({
          uri: getUrl,
          json: true
        }, function(error, response, body) {
          return _responseHandler(error, response, body, callback);
        });
      default:
        throw 'HTTP verb not supported';
    }
  };

  makeSignature = function(postData) {
    var secret, sortedParams;
    postData['app_id'] = requestOptions['applicationId'];
    postData['session_key'] = requestOptions['sessionKey'];
    postData['secure'] = 1;
    sortedParams = parametrize(postData);
    secret = requestOptions['applicationSecretKey'];
    return md5(sortedParams + secret);
  };

  parametrize = function(obj, join) {
    var arrayOfArrays, sortedParams, symbol;
    if (join == null) {
      join = false;
    }
    arrayOfArrays = _.pairs(obj).sort();
    symbol = join ? '&' : '';
    sortedParams = '';
    _.each(arrayOfArrays, function(value) {
      return sortedParams += ("" + (_.first(value)) + "=" + (_.last(value))) + symbol;
    });
    return sortedParams;
  };

  validateOptions = function() {
    if (!((requestOptions['applicationId'] != null) || (requestOptions['applicationSecretKey'] != null))) {
      throw 'Please setup requestOptions with valid params. @see https://github.com/astronz/mailru-api-node';
    }
    if (requestOptions['sessionKey'] == null) {
      throw 'sessionKey does not initialized. @see https://github.com/astronz/mailru-api-node';
    }
  };

  return MailruApi;

})();

exports.api = MailruApi;

_responseHandler = function(error, response, body, callback) {
  if (error != null) {
    return callback(error, body, response);
  } else {
    if (body.hasOwnProperty('error_code')) {
      error = body;
    }
    return callback(error, body, response);
  }
};

exports.refresh = function(refreshToken, callback) {
  var refresh_params;
  requestOptions['refreshToken'] = refreshToken;
  refresh_params = {
    refresh_token: requestOptions['refreshToken'],
    grant_type: 'refresh_token',
    client_id: requestOptions['applicationId'],
    client_secret: requestOptions['applicationSecretKey']
  };
  return request.post({
    uri: requestOptions['refreshBase'],
    json: true,
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    body: qs.stringify(refresh_params)
  }, function(error, response, body) {
    return _responseHandler(error, response, body, callback);
  });
};

exports.post = function(params, callback) {
  return new MailruApi('POST', params, callback);
};

exports.get = function(params, callback) {
  return new MailruApi('GET', params, callback);
};

exports.setSessionKey = function(token) {
  return _.extend(requestOptions, {
    sessionKey: token
  });
};

exports.getSessionKey = function() {
  return requestOptions['sessionKey'];
};

exports.setOptions = function(options) {
  if (typeof options === 'object') {
    return _.extend(requestOptions, options);
  }
};

exports.getOptions = function() {
  return requestOptions;
};