'use strict';

const KilnInput = window.kiln.kilnInput;

module.exports = (schema) => {
  schema.items = new KilnInput(schema, 'items');

  schema.items.on('add', (val) => {
    console.log(val);
  });

  schema.items.on('remove', (val) => {
    console.log(val);
  });

  return schema;
};
