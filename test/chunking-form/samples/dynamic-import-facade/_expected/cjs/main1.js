'use strict';

Promise.resolve(require('./generated-dynamic.js')).then(({dynamic}) => console.log('main1', dynamic));
