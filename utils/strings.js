var _ = require('lodash');

exports.realObj = function (obj) {
  return _.omitBy(dict,_.isUndefined)
}