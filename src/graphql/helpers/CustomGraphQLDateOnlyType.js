const {GraphQLScalarType} = require('graphql');
const {GraphQLError} = require('graphql/error');
const {Kind} = require('graphql/language');
const DateOnly = require('dateonly');

function padDate(day) {
  let str = String(day);
  if (str.length < 2) {
    str = '0' + str;
  }
  return str;
}

function convert(value) {
  return `${value.getFullYear()}-${padDate(value.getMonth() + 1)}-${padDate(value.getDate())}`;
}

function coerceDate(value) {
  if (typeof value === 'string') {
    value = new DateOnly(value);
  }
  if (!(value instanceof DateOnly)) {
    // Is this how you raise a 'field error'?
    throw new Error('Field error: value is not an instance of Date');
  }
  return convert(value);
}

module.exports = new GraphQLScalarType({
  name: 'Date',
  serialize: coerceDate,
  parseValue: coerceDate,
  parseLiteral(ast) {
    if (ast.kind !== Kind.STRING) {
      throw new GraphQLError('Query error: Can only parse strings to dates but got a: ' + ast.kind, [ast]);
    }
    const result = new DateOnly(ast.value);
    if (ast.value !== convert(result)) {
      throw new GraphQLError('Query error: Invalid date format, only accepts: YYYY-MM-DDTHH:MM:SS.SSSZ', [ast]);
    }
    return result;
  }
});
