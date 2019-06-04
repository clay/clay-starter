'use strict';

const KilnInput = window.kiln.kilnInput;

module.exports = (schema) => {
  schema['_groups'].settings['_placeholder'].height = '200px';

  schema.enableSocialButtons = new KilnInput(schema, 'enableSocialButtons');
  schema.shareServices = new KilnInput(schema, 'shareServices');
  schema.tagline = new KilnInput(schema, 'tagline');

  schema.enableSocialButtons.subscribe('OPEN_FORM', ()=> {
    if (!schema.enableSocialButtons.value()) {
      schema.shareServices.hide();
    } else {
      schema.shareServices.show();
    }
  }, true);

  schema.enableSocialButtons.on('input', (val) => {
    console.log(val);
    if(val) {
      schema.shareServices.show();
    } else {
      schema.shareServices.hide();
    }
  });

  return schema;
};
