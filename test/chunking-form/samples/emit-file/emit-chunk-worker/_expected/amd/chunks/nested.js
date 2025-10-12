define(['module', 'require', 'exports'], (function (module, require, exports) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(require.toUrl('./worker-proxy.js'), new URL(module.uri, document.baseURI).href).href);
    worker.onmessage = resolve;
  });

  exports.getWorkerMessage = getWorkerMessage;

}));
