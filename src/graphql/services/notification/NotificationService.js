const check = require('check-types');
const nodemailer = require('nodemailer');
const smtpTransport = require('nodemailer-smtp-transport');
const {emailNotifications} = require('../../../config');
const CrudService = require('../crud/crud');
const {User} = require('../../../models');
const FileService = require('../crud/FileService');
const {NotFoundError} = require('../../constants/errors');
const fs = require('fs');
const path = require('path');
const log = require('../../../common/log');
const Handlebars = require('handlebars');

const transporter = nodemailer.createTransport(smtpTransport(emailNotifications.smtp));

const signInCodeTemplate = Handlebars.compile(fs.readFileSync(path.join(__dirname, './templates/signInCode.hbs'), 'utf8'));

const notificationTypes = {
  signInCode: {
    subject: 'SignIn code',
    templateHtml: signInCodeTemplate
  }
};

class NotificationService extends CrudService {
  /**
   * Constructs a new CRUD service based on Notification model
   * @param {object} contextQuery
   */
  constructor(contextQuery) {
    super('Notification', contextQuery);
  }

  /**
   * Sends code to email
   * @param {string} userId
   * @return {Promise<void>}
   */
  async createSignInCodeNotification(userId) {
    const foundUser = await User.findById(userId).exec();
    if (!foundUser) {
      throw new NotFoundError({userId});
    }
    if (!foundUser.signInCode) {
      throw new Error('User has no sign-in code');
    }
    if (foundUser.signInCodeExpiration.getTime() < new Date().getTime()) {
      throw new Error('Code is expired ' + foundUser.signInCodeExpiration);
    }
    const data = {
      code: foundUser.signInCode,
      logoUrl: await this._getLogoUrl()
    };
    await this.createNotificationForEmail(foundUser.login, 'signInCode', data);
  }

  /**
   * Creates a notification object
   * @param {string} userId
   * @param {string} type
   * @param {object} data
   * @return {Promise<Object>}
   */
  async createNotification(userId, type, data) {
    check.assert.assigned(userId, '"userId" is required');
    check.assert.assigned(type, '"type" is required');
    check.assert.assigned(data, '"data" is required');
    const foundUser = await User.findById(userId).exec();
    if (!foundUser) {
      throw new NotFoundError({userId});
    }
    const notification = await this.create({
      type,
      receiver: userId,
      email: foundUser.login,
      data
    });
    this.trySendNotification(notification);
    return notification;
  }

  /**
   * Creates a notification object
   * @param {string} email
   * @param {string} type
   * @param {object} data
   * @return {Promise<Object>}
   */
  async createNotificationForEmail(email, type, data) {
    check.assert.assigned(email, '"email" is required');
    check.assert.assigned(type, '"type" is required');
    check.assert.assigned(data, '"data" is required');
    const notification = await this.create({
      type,
      email,
      data
    });
    this.trySendNotification(notification);
    return notification;
  }


  /**
   * Tries to send email
   * @param {object} notification
   * @return {Promise}
   */
  trySendNotification(notification) {
    const notificationTemplate = notificationTypes[notification.type];
    const mailOptions = {
      from: emailNotifications.from,
      to: notification.email,
      subject: notificationTemplate.subject,
      html: notificationTemplate.templateHtml(notification.data)
    };
    return new Promise((resolve, reject) => {
      log.debug('trySendNotification', notification);
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          log.error('Error send notification', error);
          return reject(error);
        }
        return resolve(this.merge({id: notification.id, delivered: true}));
      });
    });
  }

  async _getLogoUrl() {
    const fileService = new FileService();
    const logoFile = await fileService.getOne({systemTag: 'emailLogo'});
    if (!logoFile) {
      throw new NotFoundError('Logo file is not exist');
    }
    return logoFile.link;
  }
}

module.exports = NotificationService;
