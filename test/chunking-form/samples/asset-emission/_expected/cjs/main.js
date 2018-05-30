'use strict';

var main = new (typeof URL !== 'undefined' ? URL : require('ur'+'l').URL)((process.browser ? '' : 'file:') + __dirname + '/assets/test-19916f7d.ext', process.browser && document.baseURI).href;

module.exports = main;
