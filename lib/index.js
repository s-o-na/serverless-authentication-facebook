'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _serverlessAuthentication = require('serverless-authentication');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function mapProfile(response) {
  var overwrites = {
    picture: response.picture && response.picture.data && !response.picture.data.is_silhouette ? response.picture.data.url : null,
    provider: 'facebook'
  };

  return new _serverlessAuthentication.Profile(Object.assign(response, overwrites));
}

var FacebookProvider = function (_Provider) {
  _inherits(FacebookProvider, _Provider);

  function FacebookProvider() {
    _classCallCheck(this, FacebookProvider);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FacebookProvider).apply(this, arguments));
  }

  _createClass(FacebookProvider, [{
    key: 'signinHandler',
    value: function signinHandler(_ref, callback) {
      var scope = _ref.scope;
      var state = _ref.state;

      var options = Object.assign({ scope: scope, state: state }, { signin_uri: 'https://www.facebook.com/dialog/oauth' });

      _get(Object.getPrototypeOf(FacebookProvider.prototype), 'signin', this).call(this, options, callback);
    }
  }, {
    key: 'callbackHandler',
    value: function callbackHandler(event, callback) {
      var options = {
        authorization_uri: 'https://graph.facebook.com/v2.3/oauth/access_token',
        profile_uri: 'https://graph.facebook.com/me',
        profileMap: mapProfile,
        authorizationMethod: 'GET'
      };

      _get(Object.getPrototypeOf(FacebookProvider.prototype), 'callback', this).call(this, event, options, { profile: { fields: 'id,name,picture,email,age_range' } }, callback);
    }
  }]);

  return FacebookProvider;
}(_serverlessAuthentication.Provider);

var signinHandler = function signinHandler(config, options, callback) {
  return new FacebookProvider(config).signinHandler(options, callback);
};

var callbackHandler = function callbackHandler(event, config, callback) {
  return new FacebookProvider(config).callbackHandler(event, callback);
};

exports.signinHandler = signinHandler;
exports.signin = signinHandler; // old syntax, remove later
exports.callbackHandler = callbackHandler;
exports.callback = callbackHandler; // old syntax, remove later
