const getWorkerMessage = () => new Promise(resolve => {
  const worker = new Worker(new URL('worker-proxy.js', import.meta.url).href);
  worker.onmessage = resolve;
});

export { getWorkerMessage };
