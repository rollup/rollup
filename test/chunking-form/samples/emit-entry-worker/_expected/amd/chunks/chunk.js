define(['module', 'exports'], function (module, exports) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(module.uri + '/../../worker.js', document.baseURI).href, {type: 'module'});
    worker.onmessage = resolve;
  });

  exports.getWorkerMessage = getWorkerMessage;

});
