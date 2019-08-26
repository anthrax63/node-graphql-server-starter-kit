const {
  GraphQLEnumType
} = require('graphql');

const SortingDirectionType = new GraphQLEnumType({
  name: 'SortingDirection',
  values: {
    asc: {value: 'asc'},
    desc: {value: 'desc'}
  }
});

module.exports = SortingDirectionType;
