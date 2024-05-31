const lazy1 = import('./generated-foo%20bar.js');
const lazy2 = import('./generated-foo_bar.js');
const lazy3 = import('./generated-foo%E3%81%82bar.js');
const lazy4 = import('./generated-foo_E3_81bar.js');

export { lazy1, lazy2, lazy3, lazy4 };
