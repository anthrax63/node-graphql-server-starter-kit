const {
  graphQLQueryToMongoose,
  graphQLSortToMongoose,
  graphQLLimitToMongoose,
  graphQLSkipToMongoose,
  graphQLArgsToMongoose
} = require('./graphQLMongoose');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);


describe('graphQLMongoose', () => {
  const should = chai.should();


  describe('#graphQLQueryToMongoose', () => {
    const filter = {
      firstName: {eq: 'John'},
      lastName: {ne: 'Smith'},
      dateOfBirth: {gt: '1917-01-01'},
      dateOfDeath: {lt: '1997-01-01'},
      compositions: {gte: 100},
      subscribers: {lte: 10000},
      roles: {in: ['admin', 'user']},
      city: {nin: ['Moscow', 'St. Petersburg']},
      nickname: {regex: '.*star.*'},
      googleLogin: {iregex: '.*brin.*'},
      rate: {inrange: {from: 0, to: 10}},
      age: {between: {from: 20, to: 60}}
    };

    const expectedMongooseQuery = {
      firstName: {$eq: 'John'},
      lastName: {$ne: 'Smith'},
      dateOfBirth: {$gt: '1917-01-01'},
      dateOfDeath: {$lt: '1997-01-01'},
      compositions: {$gte: 100},
      subscribers: {$lte: 10000},
      roles: {$in: ['admin', 'user']},
      city: {$nin: ['Moscow', 'St. Petersburg']},
      nickname: new RegExp('.*star.*'),
      googleLogin: new RegExp('.*brin.*', 'i'),
      rate: {$gte: 0, $lte: 10},
      age: {$gt: 20, $lt: 60}
    };

    it('should check input arguments', async () => {
      // noinspection BadExpressionStatementJS
      await graphQLQueryToMongoose(null, {textSearch: {}}).should.be.rejected;
      await graphQLQueryToMongoose(null, {filter: 'string'}).should.be.rejected;
      await graphQLQueryToMongoose().should.be.rejected;
    });

    it('should convert graphQL query arguments to mongoose query', async () => {
      const mongooseQuery = await graphQLQueryToMongoose(null, {filter});
      should.exist(mongooseQuery);
      mongooseQuery.should.be.instanceOf(Object);
      mongooseQuery.should.deep.equal(expectedMongooseQuery);
    });
  });

  describe('#graphQLSortToMongoose', () => {
    const sort = {
      firstName: 'asc',
      lastName: 'desc'
    };

    const expectedMongooseSort = {
      firstName: 1,
      lastName: -1
    };

    it('should check input arguments', () => {
      should.throw(() => graphQLSortToMongoose());
      should.throw(() => graphQLSortToMongoose('string'));
      should.not.throw(() => graphQLSortToMongoose({}));
      should.not.throw(() => graphQLSortToMongoose(sort));
    });

    it('should convert graphQL sort arguments to mongoose sort', () => {
      const mongooseSort = graphQLSortToMongoose(sort);
      should.exist(mongooseSort);
      mongooseSort.should.be.instanceOf(Object);
      mongooseSort.should.deep.equal(expectedMongooseSort);
    });
  });

  describe('#graphQLLimitToMongoose', () => {
    it('should check input arguments', () => {
      should.throw(() => graphQLLimitToMongoose());
      should.throw(() => graphQLLimitToMongoose('string'));
      should.not.throw(() => graphQLLimitToMongoose(1));
    });

    it('should return limit value', () => {
      graphQLLimitToMongoose(1).should.equal(1);
    });
  });

  describe('#graphQLSkipToMongoose', () => {
    it('should check input arguments', () => {
      should.throw(() => graphQLSkipToMongoose());
      should.throw(() => graphQLSkipToMongoose('string'));
      should.not.throw(() => graphQLSkipToMongoose(1));
    });

    it('should return skip value', () => {
      graphQLSkipToMongoose(1).should.equal(1);
    });
  });

  describe('#graphQLArgsToMongoose', () => {
    const graphQLArgs = {
      filter: {
        firstName: {eq: 'John'},
        lastName: {ne: 'Smith'},
        dateOfBirth: {gt: '1917-01-01'},
        dateOfDeath: {lt: '1997-01-01'},
        compositions: {gte: 100},
        subscribers: {lte: 10000},
        roles: {in: ['admin', 'user']},
        city: {nin: ['Moscow', 'St. Petersburg']},
        nickname: {regex: '.*star.*'},
        rate: {inrange: {from: 0, to: 10}},
        age: {between: {from: 20, to: 60}}
      },
      sort: {
        firstName: 'asc',
        lastName: 'desc'
      },
      skip: 10,
      limit: 20,
      textSearch: 'textsearch'
    };

    const expectedMongooseArgs = {
      query: {
        $and: [
          {
            firstName: {$eq: 'John'},
            lastName: {$ne: 'Smith'},
            dateOfBirth: {$gt: '1917-01-01'},
            dateOfDeath: {$lt: '1997-01-01'},
            compositions: {$gte: 100},
            subscribers: {$lte: 10000},
            roles: {$in: ['admin', 'user']},
            city: {$nin: ['Moscow', 'St. Petersburg']},
            nickname: new RegExp('.*star.*'),
            rate: {$gte: 0, $lte: 10},
            age: {$gt: 20, $lt: 60}
          },
          {
            $or: [{
              firstName: new RegExp('textsearch', 'i')
            }]
          }
        ]
      },
      sort: {
        firstName: 1,
        lastName: -1
      },
      skip: 10,
      limit: 20
    };

    const testType = {
      firstName: {
        textSearch: true
      }
    };

    it('should check input arguments', async () => {
      await graphQLArgsToMongoose(null).should.be.rejected;
      await graphQLArgsToMongoose(null, 'string').should.be.rejected;
      await graphQLArgsToMongoose(testType, {query: graphQLArgs}).should.be.fulfilled;
    });

    it('should return query properly', async () => {
      const mongooseArgs = await graphQLArgsToMongoose(testType, {query: graphQLArgs});
      should.exist(mongooseArgs);
      mongooseArgs.should.be.instanceOf(Object);
      mongooseArgs.should.deep.equal(expectedMongooseArgs);
    });
  });
});
