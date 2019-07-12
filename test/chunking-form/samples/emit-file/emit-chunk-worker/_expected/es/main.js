import { s as shared } from './chunks/chunk.js';

const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(new URL('chunks/worker-proxy.js', import.meta.url).href);
  worker.onmessage = resolve;
});

document.body.innerHTML += `<h1>main: ${shared}</h1>`;
getWorkerMessage().then(message => (document.body.innerHTML += `<h1>1: ${message.data}</h1>`));

import('./chunks/nested.js')
	.then(result => result.getWorkerMessage())
	.then(message => (document.body.innerHTML += `<h1>2: ${message.data}</h1>`));
