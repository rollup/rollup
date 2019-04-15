System.register([], function (exports, module) {
  'use strict';
  return {
    execute: function () {

      const getWorkerMessage = () => new Promise(resolve => {
        const worker = new Worker(new URL('worker.js', module.meta.url).href, {type: 'module'});
        worker.onmessage = resolve;
      });

      getWorkerMessage().then(message => document.write(`<h1>1: ${message.data}</h1>`));

      module.import('./chunks/chunk.js')
      	.then(result => result.getWorkerMessage())
      	.then(message => document.write(`<h1>2: ${message.data}</h1>`));

    }
  };
});
