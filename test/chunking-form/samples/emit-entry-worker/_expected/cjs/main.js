'use strict';

var __chunk_1 = require('./chunks/chunk.js');

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/worker-proxy.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../worker-proxy.js').href));
  worker.onmessage = resolve;
});

document.body.innerHTML += `<h1>main: ${__chunk_1.shared}</h1>`;
getWorkerMessage().then(message => (document.body.innerHTML += `<h1>1: ${message.data}</h1>`));

Promise.resolve(require('./chunks/chunk2.js'))
	.then(result => result.getWorkerMessage())
	.then(message => (document.body.innerHTML += `<h1>2: ${message.data}</h1>`));
