'use strict';

const KilnInput = window.kiln.kilnInput;


const updatePublishedDate = (kilnInput, data) => {
  let pubDate = data.publishTime ? new Date(data.publishTime).toLocaleString() : null,
    kilnjsExampleInstances = kilnInput.getComponentInstances('kilnjs-example');

  kilnjsExampleInstances.forEach((instance)=> {
    kilnInput.getComponentData(instance).then((data)=> {
      const componentData = { ...data, pubDate };

      kilnInput.saveComponent(instance, componentData).then(() => {
        kilnInput.publishComponent(instance, componentData);
      });
    });
  });
};

const updateTitle = (kilnInput, { title }) => {
  let kilnjsExampleInstances = kilnInput.getComponentInstances('kilnjs-example');

  kilnjsExampleInstances.forEach((instance)=> {
    kilnInput.getComponentData(instance).then((data)=> {
      const componentData = { ...data, pageTitle: title };

      kilnInput.saveComponent(instance, componentData);
    });
  });
};

const addMetaTitle = (eventBus) => {
  const metaTitleInstances = eventBus.getComponentInstances('meta-title');

  if (metaTitleInstances.length) {
    eventBus.getComponentData(metaTitleInstances[0]).then((data) => {
      updateTitle(eventBus, data)
    });
  }
}

const checkForMetaTitle = (kilnInput) => {
  const metaTitle = kilnInput.getComponentInstances('meta-title');

  if (metaTitle.length > 0) {
    kilnInput.setProp('_has.attachedButton', {
        name: 'abutton',
        tooltip: 'Click Me',
        icon: 'home'
    });
  } else {
    kilnInput.setProp('_has.attachedButton', {});
  }
};

module.exports = (schema) => {
  const eventBus = new KilnInput(schema);

  schema.title = new KilnInput(schema, 'title');
  schema.size = new KilnInput(schema, 'size');
  schema.manualPageTitle = new KilnInput(schema, 'manualPageTitle');
  schema.quantity = new KilnInput(schema, 'quantity');
  schema.users = new KilnInput(schema, 'users');

  schema.formValidation = () => {
    if (schema.size.value() === 'h2' && schema.title.value() && schema.title.value().length > 40) {
      eventBus.showSnackBar({ message: 'When size is H2, the Title can\'t be longer than 40 chars', position: 'center' })
      return false;
    }

    return true;
  };

  schema.title.on('input', (val) => {
    if (val.length === 0) {
      schema.size.hide();
    } else {
      schema.size.show();
    }
  });

  schema.quantity.on('keydown', (e) => {
    if (isNaN(e.key) && e.keyCode !== 8 && e.keyCode !== 46) {
      e.preventDefault();
    }
  });

  schema.manualPageTitle.on('abuttonclick', () => {
    const metaTitles = schema.manualPageTitle.getComponentInstances('meta-title'),
      currentState = schema.manualPageTitle.getState();

    if (metaTitles.length) {
      schema.manualPageTitle.value(currentState.components[metaTitles[0]].title);
    }
  });

  eventBus.subscribe('OPEN_FORM', ()=> {
    console.log(eventBus.getState());

    if (schema.users.value()) {
      schema.users.setProp('_has.options', [schema.users.value()]);
    };

    fetch('http://www.somaku.com/users')
    .then(response => response.json())
    .then((response) => {
      const users = response.map((user) => {
        return user.name;
      });

      schema.users.setProp('_has.options', users);
    });

    if (schema.title.value() && schema.title.value().length > 0) {
      schema.size.show();
    } else {
      schema.size.hide();
    }

    checkForMetaTitle(schema.manualPageTitle);
  }, true);

  eventBus.subscribe('UPDATE_PAGE_STATE', (payload)=> {
    const stateChange = payload.history[payload.history.length - 1];

    if (stateChange.action === 'publish' || stateChange.action === 'unpublish') {
      updatePublishedDate(eventBus, payload);
    }
  }, false);

  eventBus.subscribe('UPDATE_COMPONENT', (payload)=> {
    switch(payload.data.componentVariation) {
      case 'meta-title':
        updateTitle(eventBus, payload.data);
      break;
    }
  }, false);

  eventBus.subscribe('REMOVE_COMPONENT', (payload)=> {
    switch(payload.componentName) {
      case 'meta-title':
        updateTitle(eventBus, { title: null });
      break;
    }
  }, false);

  eventBus.subscribe('COMPONENT_ADDED', (payload)=> {
    const state = eventBus.getState();

    switch(payload.componentName) {
        case 'kilnjs-example':
        if (state.page.state.published) {
          updatePublishedDate(eventBus, state.page.state);
        }
        addMetaTitle(eventBus);
      break;
    }
  }, false);

  return schema;
};
