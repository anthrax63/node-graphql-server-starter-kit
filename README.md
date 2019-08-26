# GraphQL server Starter Kit

This is stater kit for server application based on express, GraphQL and mongoose.

# Features

* Ready to use authorization: login/password and OAuth (Facebook, Google, Twitter)
* GraphQL helpers for making powerful and useful API
* File upload supported using Google Storage
* Migrations
* Email notifications
* Ready Dockerfile
* Ready Procfile for Heroku

# Scripts

## Starting

`npm start`

## Testing

`npm test`

## Codestyle

`npm run lint`

## Migrations

### Create migration

`npm run createMigration`

### Make migrations

`npm run makeMigrations`

### Undo last migration

`npm run migrationDown`

## How to develop

### Database

'src/models/schemes' directory contains mongoose models. To add new model, just put new file in this directory. Don't forget to register model using `createModelWithPlugins` method. See example model definitions.

If you use autogenerators for GraphQL API, you can define some options in your model, using `graphQLOptions` parameter.

Example:

```
const Schema = new mongoose.Schema({
  firstName: {type: String, trim: true},
  lastName: {type: String, trim: true},
  login: {type: String, lowercase: true},
  password: {type: String, graphQLOptions: {hidden: true}},
  passwordSalt: {type: String, graphQLOptions: {hidden: true}}
});
```

Supported options:

* hidden: boolean - if "true", field will be hidden in API
* integer: boolean - used for Number fields. if "true", field will be type of GraphQLInt instead of GraphQLFloat
* fieldType: string - if set, generator will use this type for GraphQL. Example: `flightDate: {type: DateOnly, graphQLOptions: {fieldType: 'DateOnly'}}`
* filter: boolean - if "true", field will be available for filtering
* textSearch: boolean - if "true", field will be available for full text searching
* readOnly: boolean - if "true", field will not be available for change

### GraphQL

* src/graphql/schema contains schema definition.
* src/graphql/schema/queries contains queries.
* src/graphql/schema/mutations contains mutations.
* src/graphql/schema/types contains type definitions.
* src/graphql/services/crud contains services, required for automatic generation of API. 

To add new model and create CRUD API for it, you should do next steps:

1. Define type in src/graphql/schema/types.

You can use type generator to fast type definition like this:

```
const {User} = require('../../models');
const mongooseSchemaToGraphQLType = require('../helpers/mongooseModelToGraphQLType');

module.exports = mongooseSchemaToGraphQLType('User', User);
```

If you want do extend your basic models with additional fields, you may use `injectField` option.

Example:

```
const {User} = require('../../models');
const mongooseSchemaToGraphQLType = require('../helpers/mongooseModelToGraphQLType');

module.exports = mongooseSchemaToGraphQLType('User', User, {
    injectFields: {
        fullName: {
            type: GraphQLString,
            resolve(parent) {
                return `${parent.firstName} ${parent.lastName}`;
            }
        }
    }
});
```

2. Define crud service 

Go to "src/graphql/services/crud" and define new service for your model.

Example "crud/UserService.js": 

```
class UserService extends CrudService {
  constructor(contextQuery) {
    super('User', contextQuery);
  }
}
```

You can extend service with other methods and use these in mutations for example.

```
class UserService extends CrudService {
  constructor(contextQuery) {
    super('User', contextQuery);
  }
  
  async tryLogin({login, password}) {
    log.debug('Try login', login, password);
    const user = await this.getOne({login});
    if (!user) {
      return false;
    }
    if (_checkPasswordHash(password, user.passwordSalt, user.password)) {
      return user;
    }
  }
}
```

3. Define queries

Go to "src/graphql/schema/queries" and define query. You can use generators:

```
const UserType = require('../../types/UserType');
const {queryMixin} = require('../../helpers/crudSchemaMixins');

module.exports = {
  ...queryMixin({
    type: UserType
  })
};
```


4. Add your query to schema 

Go to "src/graphql/schema/index.js" and add your queries to schema.

# Use API

API provides powerful functionality for querying and changing data.

Key features:

* Filtering
* Full text searching
* Extending any foreign field
* Return links from other items to requested items
* Subquerying for reference fields


Open http://localhost:8080/graphql to learn how it works.
