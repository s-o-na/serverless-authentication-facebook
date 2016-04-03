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
    picture: !response.picture.data.is_silhouette ? response.picture.data.url : null,
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

// export function signin({id, redirect_uri}, {scope, state}, callback) {
//   let params = {
//     client_id: id,
//     redirect_uri
//   };
//   if(scope) {
//     params.scope = scope;
//   }
//   if(state) {
//     params.state = state;
//   }
//   let url = utils.urlBuilder('https://www.facebook.com/dialog/oauth', params);
//   callback(null, {url});
// }
//
// export function callback({code, state}, {id, redirect_uri, secret}, callback) {
//   async.waterfall([
//     (callback) => {
//       let url = utils.urlBuilder('https://graph.facebook.com/v2.3/oauth/access_token', {
//         client_id: id,
//         redirect_uri,
//         client_secret: secret,
//         code
//       });
//       request.get(url, callback);
//     },
//     (response, accessData, callback) => {
//       let {access_token} = JSON.parse(accessData);
//       let url = utils.urlBuilder('https://graph.facebook.com/me', {
//         fields: 'id,name,picture,email',
//         access_token
//       });
//       request.get(url, (error, response, profileData) => {
//         if(!error) {
//           callback(null, mapProfile(JSON.parse(profileData)));
//         } else {
//           callback(err);
//         }
//       });
//     }
//   ], (err, data) => {
//     callback(err, data, state);
//   });
// }

