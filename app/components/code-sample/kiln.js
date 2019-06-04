'use strict';

const KilnInput = window.kiln.kilnInput;

module.exports = (schema) => {
  schema.code = new KilnInput(schema, 'code');

  schema.code.on('change', (val) => {
    console.log('hello!!!');

  });

  return schema;
};
