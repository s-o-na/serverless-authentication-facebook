'use strict';

import async from 'async';
import request from 'request';
import {utils, Profile} from 'serverless-authentication';

export function signin({id, redirect_uri}, {scope, state}, callback) {
  let params = {
    client_id: id,
    redirect_uri
  };
  if(scope) {
    params.scope = scope;
  }
  if(state) {
    params.state = state;
  }
  let url = utils.urlBuilder('https://www.facebook.com/dialog/oauth', params);
  callback(null, {url: url});
}

export function callback({code, state}, {id, redirect_uri, secret}, callback) {
  async.waterfall([
    (callback) => {
      let url = utils.urlBuilder('https://graph.facebook.com/v2.3/oauth/access_token', {
        client_id: id,
        redirect_uri,
        client_secret: secret,
        code
      });
      request.get(url, callback);
    },
    (response, accessData, callback) => {
      let {access_token} = JSON.parse(accessData);
      let url = utils.urlBuilder('https://graph.facebook.com/me', {
        fields: 'id,name,picture,email',
        access_token
      });
      request.get(url, (error, response, profileData) => {
        if(!error) {
          callback(null, mapProfile(JSON.parse(profileData)));
        } else {
          callback(err);
        }
      });
    }
  ], (err, data) => {
    callback(err, data, state);
  });
}

function mapProfile(response) {
  return new Profile({
    id: response.id,
    name: response.name,
    email: response.email,
    picture: !response.picture.data.is_silhouette ? response.picture.data.url : null,
    provider: 'facebook',
    _raw: response
  });
}