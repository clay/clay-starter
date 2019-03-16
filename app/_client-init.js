'use strict';

window.modules = ['tags.client']

// function getClientJs(name) {
//   return import(`components/${name}/client.js`).then(mod => mod.default);
// }

function tryToMount(fn, el, name) {
  try {
    fn(el); // init the controller
  } catch (e) {
    const elementTag = el.outerHTML.slice(0, el.outerHTML.indexOf(el.innerHTML));

    console.error(`Error initializing controller for "${name}" on "${elementTag}"`, e);
  }
}

/**
 * mount client.js component controllers
 */
function mountComponentModules() {
  window.modules
    .forEach(key => {
      // getClientJs(key.replace('.client', ''))
      //   .then(mod => {
          if (typeof mod === 'function') {
            const name = key.replace('.client', ''),
              instancesSelector = `[data-uri*="_components/${name}/"]`,
              instances = document.querySelectorAll(instancesSelector);

            for (let el of instances) {
              tryToMount(mod, el, name);
            }
          }
        // });
    });
}

// Make sure that a `window.process.env.NODE_ENV` is available in the client for any dependencies,
// services, or components that could require it
// note: the `#NODE_ENV#` value is swapped for the actual environment variable in /lib/cmd/compile/scripts.js
window.process = window.process || {};
window.process.env = window.process.env || {};
if (!window.process.env.NODE_ENV) {
  window.process.env.NODE_ENV = '#NODE_ENV#';
}

mountComponentModules();
