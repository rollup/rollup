'use strict';

var external = require('external');

import(external.join('a', 'b'));
console.log(external.join);
