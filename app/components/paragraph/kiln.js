'use strict';

const KilnInput = window.kiln.kilnInput;


module.exports = (schema) => {
  let updated = false;

  schema.text = new KilnInput(schema, 'text');



  return schema;
};
