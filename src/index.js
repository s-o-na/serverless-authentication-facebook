'use strict';

import async from 'async';
import request from 'request';
import {utils, Profile} from 'serverless-authentication';

export function signin(config, options, callback) {
  let params = {
    client_id: config.id,
    redirect_uri: config.redirect_uri,
    scope: options.scope || ''
  };
  let url = utils.urlBuilder('https://www.facebook.com/dialog/oauth', params);
  callback(null, {url: url});
}

export function callback(event, config, callback) {
  async.waterfall([
    (callback) => {
      let url = utils.urlBuilder('https://graph.facebook.com/v2.3/oauth/access_token', {
        client_id: config.id,
        redirect_uri: config.redirect_uri,
        client_secret: config.secret,
        code: event.code
      });
      request.get(url, callback);
    },
    (response, data, callback) => {
      let d = JSON.parse(data);
      let url = utils.urlBuilder('https://graph.facebook.com/me', {
        fields: 'id,name,picture,email',
        access_token: d.access_token
      });
      request.get(url, (error, response, data) => {
        if(!error) {
          callback(null, mapProfile(JSON.parse(data)));
        } else {
          callback(err);
        }
      });
    }
  ], (err, data) => {
    callback(err, data);
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