var main = Promise.all([import('./entry.js'), import('./generated-other.js')]);

export default main;
