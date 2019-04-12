const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(new URL('worker.js', import.meta.url).href);
  worker.onmessage = resolve;
});

getWorkerMessage().then(message => document.write(`<h1>1: ${message.data}</h1>`));

import('./chunks/chunk.js')
	.then(result => result.getWorkerMessage())
	.then(message => document.write(`<h1>2: ${message.data}</h1>`));
