const {auth: {google: {apiKey}, twitter: twitterConfig}} = require('../../../config');
const CrudService = require('./crud');
const log = require('../../../common/log');
const Crypto = require('crypto');
const {UserAlreadyExistsError, InvalidCodeError, CodeExpiredError} = require('../../constants/errors');
const check = require('check-types');
const {google} = require('googleapis');
const FileService = require('./FileService');
const {User} = require('../../../models');
const fbgraph = require('fbgraph');
const Twitter = require('twitter');
const randomatic = require('randomatic');
const NotificationService = require('../notification/NotificationService');

const iterations = 99;
const digestLen = 512;
const algo = 'sha512';

function _getPasswordHash(password, salt) {
  return Crypto.pbkdf2Sync(password, salt, iterations, digestLen, algo).toString('base64');
}

function _checkPasswordHash(password, salt, hash) {
  log.debug('Check password hash', password, salt, hash);
  return new Buffer(hash, 'base64').compare(Crypto.pbkdf2Sync(password, salt, iterations, digestLen, algo)) === 0;
}

class UserService extends CrudService {
  constructor(contextQuery) {
    super('User', contextQuery);
  }

  /**
   * Finds user by login and password
   * @param {string} login
   * @param {string} password
   * @return {Promise.<boolean|object>}
   */
  async tryLogin({login, password}) {
    log.debug('Try login', login, password);
    const user = await this.getOne({login});
    if (!user) {
      return false;
    }
    if (_checkPasswordHash(password, user.passwordSalt, user.password)) {
      return user;
    }
  }

  /**
   * Finds user by login and password
   * @param {string} login
   * @param {string} code
   * @return {Promise.<boolean|object>}
   */
  async tryLoginByCode({login, code}) {
    log.debug('Try login', login, code);
    const user = await this.getOne({login});
    if (!user) {
      return false;
    }
    if (user.signInCode !== code) {
      throw new InvalidCodeError('Invalid code');
    }
    if (user.signInCodeExpiration.getTime() < new Date().getTime()) {
      throw new CodeExpiredError('Code is expired');
    }
    return user;
  }

  /**
   * Registers new user
   * @param {object} user
   * @param {string} user.login
   * @param {string} user.password
   * @param {string} user.firstName
   * @param {string} user.lastName
   * @param {string} [user.middleName]
   * @return {Promise<*>}
   */
  async register(user) {
    log.debug('register user', user);
    check.assert.nonEmptyString(user.login, '"login" is required');
    check.assert.nonEmptyString(user.password, '"password" is required');
    check.assert.nonEmptyString(user.firstName, '"firstName" is required');
    check.assert.nonEmptyString(user.lastName, '"lastName" is required');
    const {login} = user;
    const existsUser = await this.getOne({login});
    if (existsUser) {
      throw new UserAlreadyExistsError({login});
    }
    const passwordSalt = Crypto.randomBytes(128).toString('base64');
    // eslint-disable-next-line require-atomic-updates
    user.password = _getPasswordHash(user.password, passwordSalt);
    // eslint-disable-next-line require-atomic-updates
    user.passwordSalt = passwordSalt;
    return await this.create(user);
    // const notificationService = new NotificationService();
    // await notificationService.createUserActivationNotification(result._id);
  }

  /**
   * Updates password for existing user
   * @param {string} userId
   * @param {string} password
   * @return {Promise<void>}
   */
  async setPassword(userId, password) {
    const user = await this.get(userId);
    const passwordSalt = Crypto.randomBytes(128).toString('base64');
    user.password = _getPasswordHash(password, passwordSalt);
    user.passwordSalt = passwordSalt;
    await user.save();
    return user;
  }


  /**
   * Login or register user using google credentials
   * @param {object} options
   * @param {string} options.accessToken
   */
  async signInWithGoogle(options) {
    check.assert.assigned(options, '"options" is required');
    const {accessToken} = options;
    check.assert.assigned(accessToken, '"options.accessToken" is required');
    const oauth2 = google.oauth2({
      auth: apiKey,
      version: 'v2',
      credential: {
        accessToken
      }
    });
    const OAuth2 = google.auth.OAuth2;
    const oauth2Client = new OAuth2();
    oauth2Client.setCredentials({access_token: accessToken});
    const {data: profile} = await oauth2.userinfo.v2.me.get({
      fields: 'email,family_name,given_name,id,picture,verified_email',
      auth: oauth2Client
    });
    const id = profile.id;
    check.assert.nonEmptyString(id, 'Cant get id');
    let user = await User.findOne({googleId: id});
    if (!user) {
      const fileService = new FileService();
      const photoFile = await fileService.saveFromUrl(profile.picture);
      user = new User({
        firstName: profile.given_name,
        lastName: profile.family_name,
        login: profile.email,
        photo: photoFile._id,
        googleId: id
      });
      await user.save();
    }
    return user;
  }


  /**
   * Login or register user using facebook credentials
   * @param {object} options
   * @param {string} options.accessToken
   */
  async signInWithFacebook(options) {
    check.assert.assigned(options, '"options" is required');
    const {accessToken} = options;
    check.assert.assigned(accessToken, '"options.accessToken" is required');
    const profile = await new Promise((resolve, reject) => {
      fbgraph.get(`/me?fields=id,email,first_name,last_name,cover&access_token=${accessToken}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
    const id = profile.id;
    check.assert.nonEmptyString(id, 'Cant get id');
    const picture = await new Promise((resolve, reject) => {
      fbgraph.get(`/me/picture?access_token=${accessToken}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        resolve(res);
      });
    });
    let user = await User.findOne({facebookId: id});
    if (!user) {
      const fileService = new FileService();
      const photoFile = await fileService.saveFromUrl(picture.location, 'photo.jpg');
      user = new User({
        firstName: profile.first_name,
        lastName: profile.last_name,
        login: profile.email,
        photo: photoFile._id,
        facebookId: id
      });
      await user.save();
    }
    return user;
  }

  /**
   * Login or register user using twitter credentials
   * @param {object} options
   * @param {string} options.accessToken
   */
  async signInWithTwitter(options) {
    check.assert.assigned(options, '"options" is required');
    const {accessToken, secret} = options;
    check.assert.assigned(accessToken, '"options.accessToken" is required');
    check.assert.assigned(secret, '"options.secret" is required');
    const twitter = new Twitter({
      consumer_key: twitterConfig.consumerKey,
      consumer_secret: twitterConfig.consumerSecret,
      access_token_key: accessToken,
      access_token_secret: secret
    });
    const profile = await twitter.get('account/verify_credentials.json', {include_entities: true});
    const id = profile.id_str;
    check.assert.nonEmptyString(id, 'Cant get id');
    let user = await User.findOne({twitterId: id});
    if (!user) {
      const nameParts = profile.name.split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts[1] || '-';
      const fileService = new FileService();
      const photoFile = await fileService.saveFromUrl(profile.profile_image_url_https.replace('_normal', '_bigger'), 'photo.jpg');
      user = new User({
        description: profile.description,
        firstName: firstName,
        lastName: lastName,
        login: profile.email,
        photo: photoFile._id,
        twitterId: id
      });
      await user.save();
    }
    return user;
  }

  /**
   * Creates user by email if not exists
   * and generates temporary signIn code
   * @param {string} email
   * @param {boolean} sendNotification
   * @param {string} parentUserId
   * @return {Promise<void>}
   */
  async createByEmail(email, sendNotification = true, parentUserId) {
    check.assert.assigned(email, '"email" is required');
    let user = await this.getOne({login: email});
    const signInCode = randomatic('0', 6);
    const signInCodeExpiration = new Date(new Date().getTime() + 5 * 60 * 1000);
    if (!user) {
      user = await this.create({
        login: email,
        signInCode,
        signInCodeExpiration,
        parentUser: parentUserId
      });
    } else {
      user.signInCode = signInCode;
      user.signInCodeExpiration = signInCodeExpiration;
      await user.save();
    }
    if (sendNotification) {
      const notificationService = new NotificationService();
      await notificationService.createSignInCodeNotification(user._id);
    }
    return user;
  }
}

module.exports = UserService;
