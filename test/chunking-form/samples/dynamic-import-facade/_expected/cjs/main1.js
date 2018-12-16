'use strict';

Promise.resolve(require('./generated-chunk2.js')).then(({dynamic}) => console.log('main1', dynamic));
