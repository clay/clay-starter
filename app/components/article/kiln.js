'use strict';

const KilnInput = window.kiln.kilnInput;

module.exports = (schema) => {

  schema.headline = new KilnInput(schema, 'headline');
  schema.articleTime = new KilnInput(schema, 'articleTime');

  schema.headline.on('change', (val) => {
    console.log(val);
      if(/\d/.test(val)){
        console.log(val.replace(/[0-9]/g, ''));
        schema.headline.value(val.replace(/[0-9]/g, ''));
      }
  });

  schema.headline.on('selection-change', (val) => {

  });




  schema.articleTime = new KilnInput(schema, 'articleTime');

  schema.articleTime.on('update', (val) => {

  });

  schema.headline.subscribe('UPDATE_COMPONENT', (payload)=> {

  });

  schema.headline.subscribe('CLOSE_FORM', (payload)=> {

  });

  return schema;
};
