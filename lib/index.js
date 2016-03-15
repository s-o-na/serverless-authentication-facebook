'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.signin = signin;
exports.callback = callback;

var _async = require('async');

var _async2 = _interopRequireDefault(_async);

var _request = require('request');

var _request2 = _interopRequireDefault(_request);

var _serverlessAuthentication = require('serverless-authentication');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function signin(config, options, callback) {
  var params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    scope: options.scope || ''
  };
  var url = _serverlessAuthentication.utils.urlBuilder('https://www.facebook.com/dialog/oauth', params);
  callback(null, { url: url });
}

function callback(event, config, callback) {
  _async2.default.waterfall([function (callback) {
    var url = _serverlessAuthentication.utils.urlBuilder('https://graph.facebook.com/v2.3/oauth/access_token', {
      client_id: config.id,
      redirect_uri: config.redirect_uri,
      client_secret: config.secret,
      code: event.code
    });
    _request2.default.get(url, callback);
  }, function (response, data, callback) {
    var d = JSON.parse(data);
    var url = _serverlessAuthentication.utils.urlBuilder('https://graph.facebook.com/me', {
      fields: 'id,name,picture,email',
      access_token: d.access_token
    });
    _request2.default.get(url, function (error, response, data) {
      if (!error) {
        callback(null, mapProfile(JSON.parse(data)));
      } else {
        callback(err);
      }
    });
  }], function (err, data) {
    callback(err, data);
  });
}

function mapProfile(response) {
  return new _serverlessAuthentication.Profile({
    id: response.id,
    name: response.name,
    email: response.email,
    picture: !response.picture.data.is_silhouette ? response.picture.data.url : null,
    provider: 'facebook',
    _raw: response
  });
}