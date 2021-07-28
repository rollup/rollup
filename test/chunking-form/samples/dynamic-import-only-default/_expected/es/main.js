var main = Promise.all([import('./entry.js'), import('./generated-other.js')]);

export { main as default };
