define(['require', './chunks/chunk'], function (require, shared) { 'use strict';

  const getWorkerMessage = () => new Promise(resolve => {
    const worker = new Worker(new URL(require.toUrl('./chunks/worker-proxy.js'), document.baseURI).href);
    worker.onmessage = resolve;
  });

  document.body.innerHTML += `<h1>main: ${shared.shared}</h1>`;
  getWorkerMessage().then(message => (document.body.innerHTML += `<h1>1: ${message.data}</h1>`));

  new Promise(function (resolve, reject) { require(['./chunks/nested'], resolve, reject) })
  	.then(result => result.getWorkerMessage())
  	.then(message => (document.body.innerHTML += `<h1>2: ${message.data}</h1>`));

});
