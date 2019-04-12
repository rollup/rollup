'use strict';

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/../worker.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../../worker.js').href));
  worker.onmessage = resolve;
});

exports.getWorkerMessage = getWorkerMessage;
