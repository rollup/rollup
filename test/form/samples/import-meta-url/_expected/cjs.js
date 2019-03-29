'use strict';

document.body.innerText = new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? '' : 'file:') + __filename, process.browser && document.baseURI).href;
