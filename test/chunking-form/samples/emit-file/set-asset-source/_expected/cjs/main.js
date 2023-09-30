'use strict';

const renderStart = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/assets/renderStart-eFzm3QZM.txt').href : new URL('assets/renderStart-eFzm3QZM.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const renderStartNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/renderStart.txt').href : new URL('renderStart.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const renderStartNamedImmediately = 'renderStart.txt';
const bannerNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/banner.txt').href : new URL('banner.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const footerNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/footer.txt').href : new URL('footer.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const introNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/intro.txt').href : new URL('intro.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const outroNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/outro.txt').href : new URL('outro.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const renderChunkNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/renderChunk.txt').href : new URL('renderChunk.txt', document.currentScript && document.currentScript.src || document.baseURI).href);
const generateBundleNamed = (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__dirname + '/generateBundle.txt').href : new URL('generateBundle.txt', document.currentScript && document.currentScript.src || document.baseURI).href);

exports.bannerNamed = bannerNamed;
exports.footerNamed = footerNamed;
exports.generateBundleNamed = generateBundleNamed;
exports.introNamed = introNamed;
exports.outroNamed = outroNamed;
exports.renderChunkNamed = renderChunkNamed;
exports.renderStart = renderStart;
exports.renderStartNamed = renderStartNamed;
exports.renderStartNamedImmediately = renderStartNamedImmediately;
