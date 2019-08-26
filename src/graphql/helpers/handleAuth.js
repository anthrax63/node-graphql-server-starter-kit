const {AuthorizationError, AccessViolationError} = require('../constants/errors');
const log = require('../../common/log');

const defaultAuth = {
  create: ['globalAdmin'],
  update: ['globalAdmin'],
  delete: ['globalAdmin'],
  read: ['globalAdmin', 'student', 'publisher', 'teacher']
};

module.exports = async function handleAuth(
  userInfo,
  auth = {},
  actionType = 'create',
  contextRole,
  context,
) {
  if (!userInfo) {
    throw new AuthorizationError('Unknown user for request');
  }

  const accessRoles = ['any'];
  if (userInfo.globalRole) {
    accessRoles.push(userInfo.globalRole);
  }

  const allowedAuth = {
    ...defaultAuth,
    ...auth
  };

  if (userInfo.globalRole !== 'globalAdmin' && contextRole) {
    const role = await contextRole(context, userInfo);
    if (role) {
      accessRoles.push(role);
    }
  }

  log.debug('handleAuth: allowedAuth', allowedAuth);
  log.debug('handleAuth: accessRoles', accessRoles);

  const hasAccess = allowedAuth[actionType].some(
    (role) => accessRoles.indexOf(role) > -1,
  );

  if (!hasAccess) {
    throw new AccessViolationError('Invalid access roles');
  }
};
