'use strict';

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __dirname + '/worker.js').href : new URL((document.currentScript && document.currentScript.src || document.baseURI) + '/../worker.js').href), {type: 'module'});
  worker.onmessage = resolve;
});

getWorkerMessage().then(message => document.write(`<h1>1: ${message.data}</h1>`));

Promise.resolve(require('./chunks/chunk.js'))
	.then(result => result.getWorkerMessage())
	.then(message => document.write(`<h1>2: ${message.data}</h1>`));
