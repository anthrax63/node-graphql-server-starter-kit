const {
  GraphQLInputObjectType,
  GraphQLString,
  GraphQLList,
  GraphQLID
} = require('graphql');

function createFilterArgumentType(baseName, inputType) {
  let filterType = !inputType.foreign ? inputType.type : GraphQLID;
  while (filterType.ofType) {
    filterType = filterType.ofType;
  }
  let fields = {
    eq: {type: filterType},
    ne: {type: filterType}
  };
  if (!inputType.foreign) {
    fields = {
      ...fields,
      gt: {type: filterType},
      lt: {type: filterType},
      gte: {type: filterType},
      lte: {type: filterType},
      in: {type: new GraphQLList(filterType)},
      nin: {type: new GraphQLList(filterType)},
      inrange: {
        type: new GraphQLInputObjectType({
          name: `${baseName}RangeFilter`,
          fields: {
            from: {type: filterType},
            to: {type: filterType}
          }
        })
      },
      between: {
        type: new GraphQLInputObjectType({
          name: `${baseName}BetweenFilter`,
          fields: {
            from: {type: filterType},
            to: {type: filterType}
          }
        })
      },
      regex: {type: GraphQLString},
      iregex: {type: GraphQLString}
    };
  }
  return new GraphQLInputObjectType({
    name: `${baseName}FilterArgument`,
    fields
  });
}


module.exports = createFilterArgumentType;
