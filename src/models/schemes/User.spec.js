const {User} = require('..');
const should = require('chai').should();

describe('User', function () {
  it('should generate unique ref code', async () => {
    const user = new User({login: 'test@test'});
    await user.save();
    should.exist(user.refCode);
  });
});
