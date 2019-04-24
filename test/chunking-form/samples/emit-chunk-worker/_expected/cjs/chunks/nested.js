'use strict';

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/worker-proxy.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../worker-proxy.js').href));
  worker.onmessage = resolve;
});

exports.getWorkerMessage = getWorkerMessage;
