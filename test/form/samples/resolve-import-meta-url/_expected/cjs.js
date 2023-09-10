'use strict';

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
console.log('resolved');
console.log('resolved');
console.log('resolved');

console.log((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)));
console.log(undefined);
console.log(({ url: (typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('cjs.js', document.baseURI).href)) }));

console.log('url=cjs.js:resolve-import-meta-url/main.js');
console.log('privateProp=cjs.js:resolve-import-meta-url/main.js');
console.log('null=cjs.js:resolve-import-meta-url/main.js');
