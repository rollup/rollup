define(['require', 'exports'], function (require, exports) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(require.toUrl('./worker-proxy.js'), document.baseURI).href);
    worker.onmessage = resolve;
  });

  exports.getWorkerMessage = getWorkerMessage;

});
