define(['module', 'require'], function (module, require) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(module.uri + '/../worker.js', document.baseURI).href);
    worker.onmessage = resolve;
  });

  getWorkerMessage().then(message => document.write(`<h1>1: ${message.data}</h1>`));

  new Promise(function (resolve, reject) { require(['./chunks/chunk.js'], resolve, reject) })
  	.then(result => result.getWorkerMessage())
  	.then(message => document.write(`<h1>2: ${message.data}</h1>`));

});
