'use strict';

console.log(new (typeof URL !== 'undefined' ? URL : require('url').URL)('file:' + __filename).href);