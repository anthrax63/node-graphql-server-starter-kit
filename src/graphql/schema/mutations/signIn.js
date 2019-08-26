const TokenType = require('../../types/TokenType');
const {checkAuth} = require('../../helpers/auth');
const {GraphQLString, GraphQLNonNull, GraphQLBoolean} = require('graphql');
const {UserService} = require('../../services');
const {createToken} = require('../../helpers/token');
const {InvalidLoginOrPasswordError} = require('../../constants/errors');

module.exports = {
  login: {
    type: TokenType,
    args: {
      login: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const loginResult = await service.tryLogin(args);
      if (!loginResult) {
        throw new InvalidLoginOrPasswordError();
      }
      const {_id: id, login} = loginResult;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  },
  loginByCode: {
    type: TokenType,
    args: {
      login: {type: new GraphQLNonNull(GraphQLString)},
      code: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const loginResult = await service.tryLoginByCode(args);
      if (!loginResult) {
        throw new InvalidLoginOrPasswordError();
      }
      const {_id: id, login} = loginResult;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  },
  createUserByEmail: {
    type: new GraphQLNonNull(GraphQLBoolean),
    args: {
      email: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({request, response}, args) {
      console.log('request', request);
      const service = new UserService();
      await service.createByEmail(args.email, true, request.refUser && request.refUser._id);
      return true;
    }
  },
  logout: {
    type: new GraphQLNonNull(GraphQLBoolean),
    async resolve({response}) {
      response.cookie('id_token', '', {maxAge: 0, httpOnly: false});
      return true;
    }
  },
  /* register: {
    type: TokenType,
    args: {
      login: {type: new GraphQLNonNull(GraphQLString)},
      firstName: {type: new GraphQLNonNull(GraphQLString)},
      lastName: {type: new GraphQLNonNull(GraphQLString)},
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const user = await service.register({...args});
      const {_id: id, login} = user;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  },*/
  setPassword: {
    type: new GraphQLNonNull(GraphQLBoolean),
    args: {
      password: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({request}, args) {
      checkAuth(request);
      const service = new UserService();
      await service.setPassword(request.userInfo._id, args.password);
      return true;
    }
  },
  signInWithGoogle: {
    type: TokenType,
    args: {
      accessToken: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const user = await service.signInWithGoogle({...args});
      const {_id: id, login} = user;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  },
  signInWithFacebook: {
    type: TokenType,
    args: {
      accessToken: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const user = await service.signInWithFacebook({...args});
      const {_id: id, login} = user;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  },
  signInWithTwitter: {
    type: TokenType,
    args: {
      accessToken: {type: new GraphQLNonNull(GraphQLString)},
      secret: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve({response}, args) {
      const service = new UserService();
      const user = await service.signInWithTwitter({...args});
      const {_id: id, login} = user;
      const token = createToken({id: id.toString(), login});
      response.cookie('id_token', token.token, {maxAge: 1000 * token.expiresIn, httpOnly: false});
      return {
        result: true,
        ...token
      };
    }
  }
};
