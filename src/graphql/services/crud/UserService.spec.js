/* eslint-disable max-len */
const UserService = require('./UserService');
const chai = require('chai');
const should = chai.should();
chai.use(require('chai-as-promised'));

describe('UserService', function () {
  this.timeout(60000);

  describe.skip('#signInWithGoogle', () => {
    it('should sign in with google', async () => {
      const testToken = 'ya29.GlwHB-KkVImbsAoE1rWqnucRFqxAT21dqZHeDS4a0G8pqeehOdLNlpIncPw5SPi7SJ-Ayka_c74By0t_rAkyl29Wu5I9SS4J2oHfWMwBoIVTv-9ZcQeb9z7r5aQ99Q';
      const userService = new UserService();
      const user = await userService.signInWithGoogle({accessToken: testToken});
      user.login.should.equal('denis@jethunter.net');
      user.googleId.should.equal('111112965072813397187');
    });

    it('should throw an error if invalid token passed', async () => {
      const testToken = 'ya29.GlwHB-KkVImbsAoE1rWqnucRFqxAT21dqZHeDS4a0G8pqeehOdLNlpIncPw5SPi7SJ-Ayka_c74By0t_rAkyl29Wu5I9SS4J2oHfWMwBoIVTv-9ZcQeb9z7r5aQ98Q';
      const userService = new UserService();
      await userService.signInWithGoogle({accessToken: testToken}).should.be.rejected;
    });
  });

  describe.skip('#signInWithFacebook', () => {
    it('should sign in with facebook', async () => {
      const testToken = 'EAAFzJtB0620BAJJKZCoi39l9sXeYgoZAxeKx9VeRFHNlZB8As8ALg32BZAE2GnUBtssb73qmQZC3SgBVV0A0YxZATvznPTS4Qwl68XhAyjCOPR1q3D5HHhDJOhGr26YWOR5y8Q66EcSHYK9igek6W0WUQwWdsnRIBw2Q2VOUviBAZDZD';
      const userService = new UserService();
      const user = await userService.signInWithFacebook({accessToken: testToken});
      user.login.should.equal('anthrax63@gmail.com');
      user.facebookId.should.equal('2782839281790105');
    });

    it('should throw an error if invalid token passed', async () => {
      const testToken = 'EAAFzJtB0620BAJJKZCoi39l9sXeYgoZAxeKx9VeRFHNlZB8As8ALg32BZAE2GnUBtssb73qmQZC3SgBVV0A0YxZATvznPTS4Qwl68XhAyjCOPR1q3D5HHhDJOhGr26YWOR5y8Q66EcSHYK9igek6W0WUQwWdsnRIBw2Q2VOUviBAZDZE';
      const userService = new UserService();
      await userService.signInWithFacebook({accessToken: testToken}).should.be.rejected;
    });
  });


  describe.skip('#signInWithTwitter', () => {
    it('should sign in with twitter', async () => {
      const testToken = '527773409-8GRiFkLfaSMlgZIDkgvNOearBILp061eKjoQBeVs';
      const testSecret = 'dhyY5MyttmVJw9WucsIC7OOktRmmYh7Wp3NA6UumR2Jno';
      const userService = new UserService();
      const user = await userService.signInWithTwitter({accessToken: testToken, secret: testSecret});
      user.twitterId.should.equal('527773409');
    });

    it('should throw an error if invalid token passed', async () => {
      const testToken = '627773409-8GRiFkLfaSMlgZIDkgvNOearBILp061eKjoQBeVs';
      const userService = new UserService();
      await userService.signInWithTwitter({accessToken: testToken}).should.be.rejected;
    });
  });

  describe('#createByEmail', () => {
    it('should create user by email', async () => {
      const userService = new UserService();
      const user = await userService.createByEmail('anthrax63+bc@gmail.com', false);
      should.exist(user);
      should.exist(user.signInCode);
      should.exist(user.signInCodeExpiration);
      user.signInCodeExpiration.getTime().should.be.above(new Date().getTime());
    });
  });
});
