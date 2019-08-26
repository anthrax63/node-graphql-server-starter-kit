const UserType = require('../../types/UserType');
const {UserService} = require('../../services');
const {checkAuth} = require('../../helpers/auth');
const {GraphQLNonNull, GraphQLBoolean, GraphQLObjectType, GraphQLString} = require('graphql');

module.exports = {
  me: {
    type: UserType,
    async resolve({request}, args) {
      checkAuth(request);
      const service = new UserService();
      return await service.get(request.userInfo._id);
    }
  },
  checkCurrentUser: {
    type: UserType,
    async resolve({request}) {
      if (!request.userInfo) {
        return null;
      }
      const service = new UserService();
      return await service.get(request.userInfo._id);
    }
  },
  checkUserExists: {
    type: new GraphQLNonNull(new GraphQLObjectType({
      name: 'UserExistsResult',
      fields: {
        exists: {type: new GraphQLNonNull(GraphQLBoolean)},
        hasPassword: {type: new GraphQLNonNull(GraphQLBoolean)}
      }
    })),
    args: {
      email: {type: new GraphQLNonNull(GraphQLString)}
    },
    async resolve(_, args) {
      const service = new UserService();
      const user = await service.getOne({login: args.email});
      if (user) {
        return {
          exists: true,
          hasPassword: !!user.password
        };
      } else {
        return {exists: false, hasPassword: false};
      }
    }
  }
};
