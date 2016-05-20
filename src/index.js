'use strict';

import { Profile, Provider } from 'serverless-authentication';

function mapProfile(response) {
  const overwrites = {
    picture:
      response.picture
      && response.picture.data
      && !response.picture.data.is_silhouette ? response.picture.data.url : null,
    provider: 'facebook',
    _raw: response
  };
  return new Profile(Object.assign(response, overwrites));
}

class FacebookProvider extends Provider {
  signinHandler({ scope, state }, callback) {
    const options = Object.assign(
      { scope, state },
      { signin_uri: 'https://www.facebook.com/dialog/oauth' }
    );
    super.signin(options, callback);
  }

  callbackHandler(event, callback) {
    const options = {
      authorization_uri: 'https://graph.facebook.com/v2.3/oauth/access_token',
      profile_uri: 'https://graph.facebook.com/me',
      profileMap: mapProfile,
      authorizationMethod: 'GET'
    };
    super.callback(event, options, { profile: { fields: 'id,name,picture,email' } }, callback);
  }
}

export function signinHandler(config, options, callback) {
  (new FacebookProvider(config)).signinHandler(options, callback);
}

export function callbackHandler(event, config, callback) {
  (new FacebookProvider(config)).callbackHandler(event, callback);
}
