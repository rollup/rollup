(function (factory) {
	typeof define === 'function' && define.amd ? define(factory) :
	factory();
}((function () { 'use strict';

	import(`${globalThis.unknown}`);
	import(`My ${globalThis.unknown}`);
	import(7);

})));
