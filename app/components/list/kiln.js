'use strict';

const KilnInput = window.kiln.kilnInput;

module.exports = (schema) => {
  schema.items = new KilnInput(schema, 'items');


  schema.items.on('addItem', (val) => {
    console.log(val);
  });

  schema.items.on('moveItem', (val) => {
    console.log(val);
  });

  schema.items.on('removeItem', (val) => {
    console.log(val);
  });

  return schema;
};
