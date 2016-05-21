'use strict';

const config = require('serverless-authentication').config;
const auth = require('../lib');
const nock = require('nock');
const expect = require('chai').expect;

describe('Facebook authentication', () => {
  describe('Signin', () => {
    it('tests signin without params', () => {
      const providerConfig = config('facebook');
      auth.signinHandler(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://www.facebook.com/dialog/oauth?client_id=fb-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook');
      });
    });

    it('test signin with scope and state params', () => {
      const providerConfig = config('facebook');
      auth.signinHandler(providerConfig, {scope: 'email', state: '123456'}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://www.facebook.com/dialog/oauth?client_id=fb-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook&scope=email&state=123456');
      });
    });

    it('tests old signin without params', () => {
      const providerConfig = config('facebook');
      auth.signin(providerConfig, {}, (err, data) => {
        expect(err).to.be.null;
        expect(data.url).to.equal('https://www.facebook.com/dialog/oauth?client_id=fb-mock-id&redirect_uri=https://api-id.execute-api.eu-west-1.amazonaws.com/dev/callback/facebook');
      });
    });
  });

  describe('Callback', () => {
    before(() => {
      const providerConfig = config('facebook');
      nock('https://graph.facebook.com')
        .get('/v2.3/oauth/access_token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://graph.facebook.com')
        .get('/me')
        .query({access_token: 'access-token-123', fields: 'id,name,picture,email'})
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          email: 'email@test.com',
          picture: {
            data: {
              is_silhouette: false,
              url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
            }
          }
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('facebook');
      auth.callbackHandler({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://avatars3.githubusercontent.com/u/4726921?v=3&s=460');
        expect(profile.provider).to.equal('facebook');
        done(err);
      })
    });
  });

  describe('Old callback', () => {
    before(() => {
      const providerConfig = config('facebook');
      nock('https://graph.facebook.com')
        .get('/v2.3/oauth/access_token')
        .query({
          client_id: providerConfig.id,
          redirect_uri: providerConfig.redirect_uri,
          client_secret: providerConfig.secret,
          code: 'code'
        })
        .reply(200, {
          access_token: 'access-token-123'
        });

      nock('https://graph.facebook.com')
        .get('/me')
        .query({access_token: 'access-token-123', fields: 'id,name,picture,email'})
        .reply(200, {
          id: 'user-id-1',
          name: 'Eetu Tuomala',
          email: 'email@test.com',
          picture: {
            data: {
              is_silhouette: false,
              url: 'https://avatars3.githubusercontent.com/u/4726921?v=3&s=460'
            }
          }
        });
    });

    it('should return profile', (done) => {
      const providerConfig = config('facebook');
      auth.callback({code: 'code', state: 'state'}, providerConfig, (err, profile) => {
        expect(profile.id).to.equal('user-id-1');
        expect(profile.name).to.equal('Eetu Tuomala');
        expect(profile.email).to.equal('email@test.com');
        expect(profile.picture).to.equal('https://avatars3.githubusercontent.com/u/4726921?v=3&s=460');
        expect(profile.provider).to.equal('facebook');
        done(err);
      })
    });
  });
});