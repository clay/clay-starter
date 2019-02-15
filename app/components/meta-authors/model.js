'use strict';

const _get = require('lodash/get');

module.exports.save = (ref, data) => {
  data.authors = data.authors || [];
  // Normalize "authors" value; if saved from a Kiln form, it will be of the form
  // [{text: string}].
  data.authors = data.authors
    .map(author => typeof author === 'string' ? author : _get(author, 'text', ''));

  return data;
};

module.exports.render = (ref, data) => {
  // Transforms "authors" value into form [{text: string}] so it can be edited in
  // simple-list Kiln field.
  data.authors = data.authors.map(author => ({text: author}));
  return data;
};
