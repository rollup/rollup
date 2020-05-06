'use strict';

var shared = require('./chunks/shared.js');

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/chunks/worker-proxy.js').href : new URL('chunks/worker-proxy.js', document.currentScript && document.currentScript.src || document.baseURI).href));
  worker.onmessage = resolve;
});

document.body.innerHTML += `<h1>main: ${shared.shared}</h1>`;
getWorkerMessage().then(message => (document.body.innerHTML += `<h1>1: ${message.data}</h1>`));

Promise.resolve().then(function () { return require('./chunks/nested.js'); })
	.then(result => result.getWorkerMessage())
	.then(message => (document.body.innerHTML += `<h1>2: ${message.data}</h1>`));
