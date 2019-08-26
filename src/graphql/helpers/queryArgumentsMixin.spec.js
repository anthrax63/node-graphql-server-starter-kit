const queryArgumentsMixin = require('./queryArgumentsMixin');
const chai = require('chai');
const {GraphQLString} = require('graphql');


describe('queryArgumentsMixin', () => {
  const should = chai.should();
  it('should return an object with 4 properties', () => {
    const result = queryArgumentsMixin('User', {
      firstName: {
        type: GraphQLString,
        filter: true,
        sort: true
      },
      lastName: {
        type: GraphQLString,
        filter: true
      },
      middleName: {
        type: GraphQLString,
        sort: true
      }
    });
    should.exist(result);
    should.exist(result.query);
    should.exist(result.query.type);
  });
});
