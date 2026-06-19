define(['./chunks/chunk.d.ts', './chunks/chunk2.d.ts'], (function (dep1, dep2) { 'use strict';

	console.log(dep1.num + dep2.num);

}));
