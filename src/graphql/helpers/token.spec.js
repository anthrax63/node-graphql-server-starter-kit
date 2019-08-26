const {createToken} = require('./token');
const chai = require('chai');
const {auth} = require('../../config');
const jwt = require('jsonwebtoken');


describe('token', () => {
  const should = chai.should();
  describe('#createToken', () => {
    const tokenArgs = {
      id: 'id',
      login: 'login'
    };

    it('should check input arguments', () => {
      should.throw(() => createToken());
      should.throw(() => createToken({}));
      should.not.throw(() => createToken(tokenArgs));
    });

    it('should create token', () => {
      const token = createToken(tokenArgs);
      should.exist(token);
      should.exist(token.token);
      should.exist(token.expiresIn);
      token.token.should.be.a('string');
      token.expiresIn.should.be.a('number');
      token.expiresIn.should.equal(auth.tokenExpirationTime);
      const decoded = jwt.verify(token.token, auth.jwt.secret);
      should.exist(decoded.id);
      decoded.id.should.equal(tokenArgs.id);
    });

    it('should accept custon expiration time', () => {
      const testExpTime = 60;
      const token = createToken({...tokenArgs, expiresIn: testExpTime});
      should.exist(token);
      should.exist(token.token);
      should.exist(token.expiresIn);
      token.token.should.be.a('string');
      token.expiresIn.should.be.a('number');
      token.expiresIn.should.equal(testExpTime);
    });
  });
});
