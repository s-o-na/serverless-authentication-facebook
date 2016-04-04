'use strict';

import {Profile, Provider} from 'serverless-authentication';

class FacebookProvider extends Provider {
  signin({scope, state}, callback){
    let options = Object.assign(
      {scope, state},
      {signin_uri: 'https://www.facebook.com/dialog/oauth'}
    );
    super.signin(options, callback);
  }

  callback(event, callback){
    var options = {
      authorization_uri: 'https://graph.facebook.com/v2.3/oauth/access_token',
      profile_uri: 'https://graph.facebook.com/me',
      profileMap: mapProfile,
      authorizationMethod: 'GET'
    };
    super.callback(event, options, {profile: {fields: 'id,name,picture,email'}}, callback);
  }
}

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.name,
    email: response.email,
    picture: response.picture && response.picture.data && !response.picture.data.is_silhouette ? response.picture.data.url : null,
    provider: 'facebook',
    _raw: response
  });
}

export function signin(config, options, callback) {
  (new FacebookProvider(config)).signin(options, callback);
}

export function callback(event, config, callback) {
  (new FacebookProvider(config)).callback(event, callback);
}

