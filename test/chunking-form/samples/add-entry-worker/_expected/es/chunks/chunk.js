const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(new URL('../worker.js', import.meta.url).href, {type: 'module'});
  worker.onmessage = resolve;
});

export { getWorkerMessage };
