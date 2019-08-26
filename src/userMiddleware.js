const {User} = require('./models');

module.exports = () => {
  return async (req, res, next) => {
    try {
      if (req.user) {
        // eslint-disable-next-line require-atomic-updates
        req.userInfo = await User.findById(req.user.id).exec();
      }
    } catch (e) {
      return next(e);
    }
    next();
  };
};
