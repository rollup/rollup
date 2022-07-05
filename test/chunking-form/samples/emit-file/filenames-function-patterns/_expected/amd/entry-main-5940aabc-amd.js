define(['require'], (function (require) { 'use strict';

	console.log('main');
<<<<<<<< HEAD:test/chunking-form/samples/emit-file/filenames-function-patterns/_expected/amd/entry-main-5940aabc-amd.js
	new Promise(function (resolve, reject) { require(['./chunk-deb-87ce45a9-amd'], resolve, reject); }).then(console.log);
========
	new Promise(function (resolve, reject) { require(['./chunk-deb-faae56f2-amd'], resolve, reject); }).then(console.log);
>>>>>>>> 3030e2f11 ([v3.0] New hashing algorithm that "fixes (nearly) everything" (#4543)):test/chunking-form/samples/emit-file/filenames-function-patterns/_expected/amd/entry-main-aaf15a0c-amd.js

}));
