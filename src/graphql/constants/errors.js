const messages = {
  unknownError: {
    id: 'errors.unknownError',
    defaultMessage: 'An unknown error has occurred',
    description: 'An unknown error has occurred'
  },
  internalServerError: {
    id: 'errors.internalServerError',
    defaultMessage: 'Internal server error',
    description: 'Internal server error'
  },
  validationError: {
    id: 'errors.validationError',
    defaultMessage: 'Validation error',
    description: 'Validation error'
  },
  notFoundError: {
    id: 'errors.notFoundError',
    defaultMessage: 'Requested item not found',
    description: 'Not found error'
  },
  accessViolationError: {
    id: 'errors.accessViolationError',
    defaultMessage: 'Access violation',
    description: 'Access violation error'
  },
  authorizationError: {
    id: 'errors.authorizationError',
    defaultMessage: 'Authorization error',
    description: 'Authorization error'
  },
  invalidLoginOrPasswordError: {
    id: 'errors.invalidLoginOrPasswordError',
    defaultMessage: 'Invalid login or password',
    description: 'Invalid login or password'
  },
  userAlreadyExists: {
    id: 'errors.userAlreadyExists',
    defaultMessage: 'User already exists',
    description: 'User already exists'
  },
  invalidCodeError: {
    id: 'errors.invalidCodeError',
    defaultMessage: 'Invalid code'
  },
  codeExpiredError: {
    id: 'errors.codeExpiredError',
    defaultMessage: 'Code expired'
  },
  accountAlreadyUsed: {
    id: 'errors.accountAlreadyUsed',
    defaultMessage: 'Account already used'
  },
  codeNotFound: {
    id: 'errors.codeNotFound',
    defaultMessage: 'Code not found'
  }
};
module.exports.messages = messages;

class QueryError extends Error {
  constructor(code, intlMessage, data) {
    super(intlMessage.defaultMessage);
    this.messageId = intlMessage.id;
    this.code = code;
    this.data = data;
  }
}

class InternalServerError extends QueryError {
  constructor(err) {
    super('SE001', messages.internalServerError, {
      message: err.message,
      stack: err.stack
    });
  }
}

class CommonValidationError extends QueryError {
  constructor(data) {
    super('VL001', messages.validationError, data);
  }
}

class UserAlreadyExistsError extends QueryError {
  constructor(data) {
    super('VL004', messages.userAlreadyExists, data);
  }
}


class NotFoundError extends QueryError {
  constructor(data) {
    super('NF001', messages.notFoundError, data);
  }
}

class AuthorizationError extends QueryError {
  constructor(data) {
    super('AT001', messages.authorizationError, data);
  }
}

class InvalidLoginOrPasswordError extends QueryError {
  constructor() {
    super(
      'AT002',
      messages.invalidLoginOrPasswordError,
    );
  }
}

class AccessViolationError extends QueryError {
  constructor(data) {
    super('AV001', messages.accessViolationError, data);
  }
}

class CodeExpiredError extends QueryError {
  constructor(data) {
    super('VL_CODE_EXPIRED', messages.codeExpiredError, data);
  }
}

class InvalidCodeError extends QueryError {
  constructor(data) {
    super('VL_INVALID_CODE', messages.invalidCodeError, data);
  }
}

module.exports = {
  InternalServerError,
  CommonValidationError,
  UserAlreadyExistsError,
  NotFoundError,
  AuthorizationError,
  InvalidLoginOrPasswordError,
  AccessViolationError,
  CodeExpiredError,
  InvalidCodeError
};
