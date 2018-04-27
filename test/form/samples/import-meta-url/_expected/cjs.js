'use strict';

console.log(new (typeof URL !== 'undefined' ? URL : require('url'))('file:' + __filename).href);