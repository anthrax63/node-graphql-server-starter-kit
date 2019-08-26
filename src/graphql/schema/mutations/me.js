const {checkAuth} = require('../../helpers/auth');
const {GraphQLString, GraphQLNonNull, GraphQLObjectType} = require('graphql');
const {UserService} = require('../../services');

module.exports = {
  me: {
    type: new GraphQLObjectType({
      name: 'MeMutations',
      fields: {
        saveBrokerRefLink: {
          type: new GraphQLNonNull(GraphQLString),
          args: {
            link: {type: new GraphQLNonNull(GraphQLString)}
          },
          async resolve({request}, args) {
            checkAuth(request);
            const service = new UserService();
            const user = await service.get(request.userInfo._id);
            user.brokerRefLink = args.link;
            await user.save();
            return user.brokerRefLink;
          }
        }
      }
    }),
    resolve: (parent) => parent
  }
};
