'use strict';

require('./generated-existing.js');
require('./direct-relative-external');
require('to-indirect-relative-external');
require('direct-absolute-external');
require('to-indirect-absolute-external');

// nested
Promise.resolve(require('./generated-existing.js'));
Promise.resolve(require('./direct-relative-external'));
Promise.resolve(require('to-indirect-relative-external'));
Promise.resolve(require('direct-absolute-external'));
Promise.resolve(require('to-indirect-absolute-external'));

//main
Promise.resolve(require('./generated-existing.js'));
Promise.resolve(require('./direct-relative-external'));
Promise.resolve(require('to-indirect-relative-external'));
Promise.resolve(require('direct-absolute-external'));
Promise.resolve(require('to-indirect-absolute-external'));

Promise.resolve(require('dynamic-direct-external' + unknown));
Promise.resolve(require('to-dynamic-indirect-external'));
Promise.resolve(require('./generated-existing.js'));
Promise.resolve(require('my' + 'replacement'));
