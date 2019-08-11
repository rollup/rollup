'use strict';

console.log('resolved');
console.log('resolved');
console.log('resolved');

console.log((typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)));
console.log(undefined);
console.log(({ url: (typeof document === 'undefined' ? new (require('u' + 'rl').URL)('file:' + __filename).href : (document.currentScript && document.currentScript.src || new URL('cjs.js', document.baseURI).href)) }));

console.log('url=cjs.js:resolve-import-meta-url/main.js');
console.log('privateProp=cjs.js:resolve-import-meta-url/main.js');
console.log('null=cjs.js:resolve-import-meta-url/main.js');
