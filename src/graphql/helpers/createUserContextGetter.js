module.exports = (withNull) => {
  return (parent, args, request) => {
    if (withNull) {
      return {$or: [{user: null}, {user: request.userInfo._id}]};
    } else {
      return {user: request.userInfo._id};
    }
  };
};
