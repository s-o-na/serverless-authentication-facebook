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

function signin(_ref, _ref2, callback) {
  var id = _ref.id;
  var redirect_uri = _ref.redirect_uri;
  var scope = _ref2.scope;
  var state = _ref2.state;

  var params = {
    client_id: id,
    redirect_uri: redirect_uri
  };
  if (scope) {
    params.scope = scope;
  }
  if (state) {
    params.state = state;
  }
  var url = _serverlessAuthentication.utils.urlBuilder('https://www.facebook.com/dialog/oauth', params);
  callback(null, { url: url });
}

function callback(_ref3, _ref4, callback) {
  var code = _ref3.code;
  var state = _ref3.state;
  var id = _ref4.id;
  var redirect_uri = _ref4.redirect_uri;
  var secret = _ref4.secret;

  _async2.default.waterfall([function (callback) {
    var url = _serverlessAuthentication.utils.urlBuilder('https://graph.facebook.com/v2.3/oauth/access_token', {
      client_id: id,
      redirect_uri: redirect_uri,
      client_secret: secret,
      code: code
    });
    _request2.default.get(url, callback);
  }, function (response, accessData, callback) {
    var _JSON$parse = JSON.parse(accessData);

    var access_token = _JSON$parse.access_token;

    var url = _serverlessAuthentication.utils.urlBuilder('https://graph.facebook.com/me', {
      fields: 'id,name,picture,email',
      access_token: access_token
    });
    _request2.default.get(url, function (error, response, profileData) {
      if (!error) {
        callback(null, mapProfile(JSON.parse(profileData)));
      } else {
        callback(err);
      }
    });
  }], function (err, data) {
    callback(err, data, state);
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