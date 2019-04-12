const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(new URL('../worker.js', import.meta.url).href);
  worker.onmessage = resolve;
});

export { getWorkerMessage };
