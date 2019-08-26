const {NotFoundError} = require('../../constants/errors');
const check = require('check-types');
const mongoose = require('mongoose');
const log = require('../../../common/log');
require('../../../models');

const maxLimit = 100;

const ActionTypes = {
  create: 'CREATE',
  update: 'UPDATE',
  remove: 'REMOVE'
};

class CrudService {
  constructor(modelName, contextQuery) {
    this._model = mongoose.model(modelName);
    this._modelName = modelName;
    this._contextQuery = contextQuery;
  }

  /**
   * Inserts a new item
   * @param {object} props
   * @return {Promise.<object>}
   */
  create(props) {
    const Model = this._model;
    if (props.id) {
      props._id = props.id;
      delete props.id;
    }
    log.debug('CREATE', props);
    const obj = new Model(props);
    return obj.save().then((newObject) => {
      this._pushModelAction(ActionTypes.create, {id: newObject._id});
      return newObject;
    });
  }

  /**
   * Replaces an item
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  replace(props) {
    const Model = this._model;
    const id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    const obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findByIdAndUpdate(id, obj, {runValidators: true, new: true})
      .exec()
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Replaces an item or creates if it does not exist
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  createOrReplace(props) {
    const Model = this._model;
    const id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    const obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          return this.create(props);
        } else {
          return this.replace(props);
        }
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Merges an item or creates if it does not exist
   * @param {object} props
   * @return {Promise.<object>} Replaced object
   */
  createOrMerge(props) {
    const Model = this._model;
    const id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    const obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          return this.create(props);
        } else {
          return this.merge(props);
        }
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Updates an item by merge passed props to existing item
   * @param {object} props
   * @return {Promise.<object>}
   */
  merge(props) {
    const Model = this._model;
    const id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    const obj = {...props, _id: id};
    delete obj.id;
    return Model
      .findById(id)
      .exec()
      .then((doc) => {
        if (!doc) {
          throw new NotFoundError({id});
        }
        Object.assign(doc, obj);
        return doc.save();
      })
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  update(props) {
    const Model = this._model;
    const id = props.id || props._id;
    check.assert.assigned(id, '"props" should contain "id" or "_id" property');
    const obj = {...props, _id: id};
    delete obj._id;
    delete obj.id;
    return Model
      .findByIdAndUpdate(id, {$set: obj}, {new: true})
      .exec()
      .then((newObject) => {
        this._pushModelAction(ActionTypes.update, {id: newObject._id});
        return newObject;
      });
  }

  /**
   * Lists list by query
   * @param {object} query
   * @param {number} skip
   * @param {number} limit
   * @param {object} sort
   * @return {Promise.<object[]>}
   */
  async list({query, skip, limit, sort}) {
    log.debug('LIST', this._modelName, query, skip, 'limit', limit, sort);
    const Model = this._model;
    let request = Model.find(this._makeQuery(query));
    if (skip !== undefined) {
      request = request.skip(skip);
    }
    if (limit) {
      if (limit > maxLimit) {
        throw new Error(`Max limit is ${maxLimit}`);
      }
      request = request.limit(limit);
    } else {
      request.limit(maxLimit);
    }
    if (sort) {
      request = request.sort(sort);
    }
    return await request.exec();
  }

  get(props, scope) {
    log.debug('GET', this._modelName, props);
    const Model = this._model;
    const id = (typeof props === 'string' || props instanceof mongoose.Types.ObjectId) ? props : (props.id || props._id);
    if (!id) {
      return null;
    }
    const request = Model.findOne(this._makeQuery({_id: id, ...scope}));
    return request.exec()
      .then((u) => {
        if (u) {
          return u;
        }
        throw new NotFoundError({id});
      });
  }

  /**
   * Returns one object
   * @param {object} query
   * @return {Promise.<object[]>}
   */
  getOne(query) {
    log.debug('GET ONE', query);
    const Model = this._model;
    const request = Model.findOne(this._makeQuery(query));
    return request.exec();
  }

  getMany(query) {
    log.debug('GET ONE', query);
    const Model = this._model;
    const request = Model.find(this._makeQuery(query));
    return request.exec();
  }

  count(query = {}) {
    log.debug('COUNT', JSON.stringify({query}));
    if (query.query) {
      query = query.query;
    }
    const Model = this._model;
    return Model.count(this._makeQuery({...query})).exec();
  }

  distinct(field, query = {}) {
    log.debug('DISTINCT', field, JSON.stringify({query}));
    const Model = this._model;
    return Model.distinct(field, this._makeQuery({...query})).exec();
  }

  /**
   * Removes multiple list by id or array of id
   * @param {array|string} ids
   * @return {Promise.<boolean>}
   */
  remove(ids) {
    check.assert.assigned(ids, '"ids" is required');
    if (!(ids instanceof Array)) {
      ids = [ids];
    }
    const Model = this._model;
    return Model
      .remove({_id: {$in: ids}})
      .exec()
      .then(() => {
        this._pushModelAction(ActionTypes.remove, {ids});
        return true;
      });
  }

  _pushModelAction(actionType, payload) {
    // Empty
  }

  _makeQuery(query) {
    if (!this._contextQuery) {
      return query;
    }
    return {$and: [query, this._contextQuery]};
  }
}


module.exports = CrudService;
