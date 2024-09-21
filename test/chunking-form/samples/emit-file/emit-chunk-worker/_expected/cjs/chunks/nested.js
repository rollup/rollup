'use strict';

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/worker-proxy.js').href : new URL('worker-proxy.js', document.currentScript && document.currentScript.tagName.toUpperCase() === 'SCRIPT' && document.currentScript.src || document.baseURI).href));
  worker.onmessage = resolve;
});

exports.getWorkerMessage = getWorkerMessage;
