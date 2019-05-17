define(['module', 'exports'], function (module, exports) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(module.uri + '/../worker-proxy.js', document.baseURI).href);
    worker.onmessage = resolve;
  });

  exports.getWorkerMessage = getWorkerMessage;

});
