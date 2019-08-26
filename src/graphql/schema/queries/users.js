const UserType = require('../../types/UserType');
const {queryMixin} = require('../../helpers/crudSchemaMixins');

module.exports = {
  ...queryMixin({
    type: UserType
  })
};
