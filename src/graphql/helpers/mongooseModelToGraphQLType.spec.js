const mongooseSchemaToGraphQLType = require('./mongooseModelToGraphQLType');
const mongoose = require('mongoose');
const models = require('../../models');
const services = require('../services');
require('chai').should();

const PlatformCouponSchema = new mongoose.Schema({
  date: {type: Date, index: true, required: true, default: Date.now},
  objectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Line', required: true, index: true},
  number: {type: Number, required: true, index: true, default: () => new Date().getTime()}
}, {_id: false});

const TestSchema = new mongoose.Schema({
  date: {type: Date, index: true, required: true, default: Date.now},
  objectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Line', required: true, index: true},
  anotherObjectId: {type: mongoose.Schema.Types.ObjectId, ref: 'Line', required: true, index: true},
  number: {type: Number, required: true, index: true, default: () => new Date().getTime()},
  stringEnum: {type: String, enum: ['waiting', 'won', 'lost', 'invalid', 'returned'], index: true},
  string: {type: String, required: true, index: true},
  stringArray: {type: [String], required: true, index: true},
  numberArray: {type: [Number], required: true, index: true},
  numberNotRequired: {type: [Number], index: true},
  numberNotIndexed: {type: [Number]},
  optsTest: {type: Number, index: true, graphQLOptions: {filter: false, sort: false, setOn: []}},
  bool: {type: Boolean, default: false, required: true, index: true},
  nested: {type: PlatformCouponSchema, required: true},
  nestedArray: {type: [PlatformCouponSchema], required: true},
  foreignSingle: {type: mongoose.Schema.ObjectId, ref: 'File'},
  foreignArray: {type: [mongoose.Schema.ObjectId], ref: 'File'}
});

const LineSchema = new mongoose.Schema({});

const model = mongoose.model('Test', TestSchema);
const line = mongoose.model('Line', LineSchema);

models.Test = model;
models.Line = line;

services.LineService = {};

describe('mongooseModelToGraphQLType', () => {
  it('should correctly convert model', () => {
    const type = mongooseSchemaToGraphQLType('Test', model, {service: {}});
    const fields = type._fields();
    // (typeof fields.id).should.equal('');
    // console.dir(fields);
    const expected = {
      id: 'ID!',
      date: 'DateTime!',
      objectId: 'TestViewObjectId!',
      anotherObjectId: 'TestViewAnotherObjectId!',
      number: 'Float!',
      stringEnum: 'TestViewStringEnumEnum',
      string: 'String!',
      stringArray: '[String]!',
      numberArray: '[Float]!',
      numberNotRequired: '[Float]',
      numberNotIndexed: '[Float]',
      optsTest: 'Float',
      bool: 'Boolean!',
      nested: 'TestNested!',
      nestedArray: '[TestnestedArray]!',
      foreignSingle: 'TestViewForeignSingle',
      foreignArray: '[TestViewForeignArray]'
    };
    Object.keys(fields).forEach((f) => {
      String(fields[f].type).should.equal(expected[f]);
    });
  });
});
