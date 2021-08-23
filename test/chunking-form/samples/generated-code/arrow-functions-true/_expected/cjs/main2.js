'use strict';

Promise.resolve().then(() => require('./generated-dep1.js')).then(n => n.dep1).then(console.log);
