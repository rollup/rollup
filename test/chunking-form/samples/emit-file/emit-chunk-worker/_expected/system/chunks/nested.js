System.register([], (function (exports, module) {
  'use strict';
  return {
    execute: (function () {

      const getWorkerMessage = exports("getWorkerMessage", () => new Promise(resolve => {
        const worker = new Worker(new URL('worker-proxy.js', module.meta.url).href);
        worker.onmessage = resolve;
      }));

    })
  };
}));
