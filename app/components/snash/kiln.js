'use strict';

const KilnInput = window.kiln.kilnInput;

const changeInput = (kilninput) => {
  if (window.innerWidth < 768) {
    kilninput.setProp('_has', { ...kilninput['_has'], input: 'select' });
  } else {
    kilninput.setProp('_has', { ...kilninput['_has'], input: 'radio' });
  }
};

module.exports = (schema) => {
  const eventBus = new KilnInput(schema);

  schema.title = new KilnInput(schema, 'title');
  schema.type = new KilnInput(schema, 'type');
  schema.shareServices = new KilnInput(schema, 'shareServices');
  schema.altTitle = new KilnInput(schema, 'altTitle');
  schema.field1 = new KilnInput(schema, 'field1');
  schema.codeLanguage = new KilnInput(schema, 'codeLanguage');
  schema.code = new KilnInput(schema, 'code');
  schema.links = new KilnInput(schema, 'links');
  schema.articleDate = new KilnInput(schema, 'articleDate');
  schema.caption = new KilnInput(schema, 'caption');
  schema.livefyreId = new KilnInput(schema, 'livefyreId');
  schema.ranger = new KilnInput(schema, 'ranger');
  schema.feedLayout = new KilnInput(schema, 'feedLayout');
  schema.ledeLayout = new KilnInput(schema, 'ledeLayout');
  schema.startTime = new KilnInput(schema, 'startTime');

  schema.altTitle.on('abuttonclick', () => {
    fetch('http://api.icndb.com/jokes/random')
    .then(response => response.json())
    .then(data => {
      let newValue = schema.title.value();
      schema.altTitle.value(data.value.joke);
    });
  })

  schema.type.subscribe('OPEN_FORM', ()=> {
    changeInput(schema.type);
  }, true);

  eventBus.subscribe('UPDATE_COMPONENT', (payload)=> {
    if (payload.data.componentVariation === 'paragraph') {
      let snashInstances = schema.type.getComponentInstances('snash');
      snashInstances.forEach((instance) => {
        eventBus.reRenderInstance(instance);
      });
    }
  }, false);

  schema.type.subscribe('UPDATE_PAGE_STATE', (payload)=> {
    // console.log(payload);
  }, false);

  window.onresize = () => {
    changeInput(schema.type);
  };

  schema['_groups'].stuff.fields.push('shareServices');

  schema.shareServices.on('focus', (val) => {

  });

  schema.shareServices.on('blur', (val) => {

  });

  schema.shareServices.on('input', (val) => {

  });

  schema.shareServices.on('change', (val) => {

  });

  schema.field1.on('focus', (val) => {

  });

  schema.field1.on('blur', (val) => {

  });

  schema.field1.on('input', (val) => {

  });

  schema.field1.on('change', (val) => {

  });

  fetch('http://api.icndb.com/jokes/random')
  .then(response => response.json())
  .then(data => {
    schema.altTitle.setProp('_label', data.value.joke);
  });

  schema.codeLanguage.on('change', (val) => {

    schema.code.setProp('_has.mode', val.value).then((val) => {
      console.log('language change');
      console.log(val);
    });
  });

  schema.code.on('focus', (val) => {

  });

  schema.code.on('blur', (val) => {

  });

  schema.links.on('current', (val) => {

  });

  schema.links.on('removeItem', (val) => {

  });

  schema.links.on('moveItem', (val) => {

  });

  schema.links.on('addItem', (val) => {

  });


  schema.articleDate.on('input', (val) => {

  });

  schema.articleDate.on('touch', (val) => {

  });

  schema.articleDate.on('focus', (val) => {

  });

  schema.articleDate.on('blur', (val) => {

  });

  schema.articleDate.on('open', (val) => {

  });

  schema.articleDate.on('close', (val) => {

  });

  schema.caption.on('text-change', (delta, oldDelta, source) => {
    console.log(delta);
  });

  schema.caption.on('selection-change', (range, oldRange, source) => {

  });

  schema.livefyreId.on('click', (val) => {
    console.log(val);
  });

  schema.livefyreId.on('input', (val) => {
    console.log(val);
  });


  schema.type.on('focus', (val) => {
    console.log('radio focus');
  });

  schema.type.on('blur', (val) => {
    console.log('radio blur');
  });

  schema.type.on('input', (input) => {
    console.log('radio input ' + input);
  });

  schema.type.on('change', (input) => {
    console.log('radio change ' + input);
  });

  schema.ranger.on('update', (input) => {
    console.log('range updated ' + input);
  });

  schema.ranger.on('start', (input) => {
    console.log('range started ' + input);
  });

  schema.ranger.on('slide', (input) => {
    console.log('range slided ' + input);
  });

  schema.ranger.on('change', (input) => {
    console.log('range changed ' + input);
  });

  schema.ranger.on('set', (input) => {
    console.log('range setted ' + input);
  });

  schema.ranger.on('end', (input) => {
    console.log('range ended ' + input);
  });

  schema.feedLayout.on('update', (val) => {
    console.log(val);
  });
  schema.ledeLayout.on('update', (val) => {
    console.log(val);
  });

  schema.startTime.on('update', (val) => {
    console.log(val);
  });

  return schema;
};
